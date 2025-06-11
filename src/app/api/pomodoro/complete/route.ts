import { and, eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { withAuthSimple } from '@/lib/auth/api';
import { db } from '@/server/db';
import { tasks, users } from '@/server/db/schema';

type CompleteSessionRequest = {
  taskId: string;
  durationHours: number;
};

export const POST = withAuthSimple(
  async (request, user) => {
    try {
      const body = await request.json() as CompleteSessionRequest;
      const { taskId, durationHours } = body;

      if (!taskId || typeof durationHours !== 'number' || durationHours <= 0) {
        return NextResponse.json(
          { error: 'Valid taskId and durationHours are required' },
          { status: 400 },
        );
      }

      // Start transaction-like operations

      // 1. Update task's actualEffort (only if task exists and belongs to user)
      const taskUpdateResult = await db
        .update(tasks)
        .set({
          actualEffort: durationHours, // Note: This should increment, but we're keeping it simple for now
          updatedAt: new Date(),
        })
        .where(and(
          eq(tasks.id, taskId),
          eq(tasks.userId, user.id),
        ))
        .returning();

      if (!taskUpdateResult.length) {
        return NextResponse.json(
          { error: 'Task not found or access denied' },
          { status: 404 },
        );
      }

      // 2. Update user's streak information
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Start of today

      // Get current user data
      const currentUserResult = await db
        .select({
          streakDays: users.streakDays,
          lastCompletedPomodoroDate: users.lastCompletedPomodoroDate,
        })
        .from(users)
        .where(eq(users.id, user.id))
        .limit(1);

      if (!currentUserResult.length) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 },
        );
      }

      const currentUserData = currentUserResult[0];

      if (!currentUserData) {
        return NextResponse.json(
          { error: 'User data not found' },
          { status: 404 },
        );
      }

      let newStreakDays = currentUserData.streakDays ?? 0;

      const lastCompletedDate = currentUserData.lastCompletedPomodoroDate;

      if (lastCompletedDate) {
        const lastDate = new Date(lastCompletedDate);
        lastDate.setHours(0, 0, 0, 0);
        const daysDifference = Math.floor((today.getTime() - lastDate.getTime()) / (24 * 60 * 60 * 1000));

        if (daysDifference === 0) {
          // Same day - don't increment streak
          // Keep existing streak
        } else if (daysDifference === 1) {
          // Next day - increment streak
          newStreakDays += 1;
        } else if (daysDifference > 1) {
          // More than 1 day gap - reset streak
          newStreakDays = 1;
        }
      } else {
        // First pomodoro ever
        newStreakDays = 1;
      }

      // Update user's streak data
      await db
        .update(users)
        .set({
          streakDays: newStreakDays,
          lastCompletedPomodoroDate: today,
        })
        .where(eq(users.id, user.id));

      return NextResponse.json({
        success: true,
        newStreakDays,
        taskUpdated: taskUpdateResult[0],
      });
    } catch (error) {
      console.error('Failed to complete Pomodoro session:', error);
      return NextResponse.json(
        { error: 'Failed to complete Pomodoro session' },
        { status: 500 },
      );
    }
  },
);
