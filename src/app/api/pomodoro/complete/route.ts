import { and, eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { withAuthSimple } from '@/lib/auth/api';
import { db } from '@/server/db';
import { tasks, users } from '@/server/db/schema';

type CompleteSessionRequest = {
  taskId?: string;
  durationHours: number;
};

export const POST = withAuthSimple(
  async (request, user) => {
    try {
      const body = await request.json() as CompleteSessionRequest;
      const { taskId, durationHours } = body;

      if (typeof durationHours !== 'number' || durationHours <= 0) {
        return NextResponse.json(
          { error: 'Valid durationHours is required' },
          { status: 400 },
        );
      }

      let taskUpdateResult = null;
      const isFreeSession = !taskId;

      // If taskId exists, update the task's actualEffort
      if (!isFreeSession) {
        const taskUpdate = await db
          .update(tasks)
          .set({
            actualEffort: durationHours, // FIXME: This should increment, but we're keeping it simple for now
            updatedAt: new Date(),
          })
          .where(and(
            eq(tasks.id, taskId),
            eq(tasks.userId, user.id),
          ))
          .returning();

        if (!taskUpdate.length) {
          return NextResponse.json(
            { error: 'Task not found or access denied' },
            { status: 404 },
          );
        }

        taskUpdateResult = taskUpdate[0];
      }

      // Update the lastCompletedPomodoroDate and streak
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Get current user data to calculate new streak
      const currentUserData = await db
        .select({
          streakDays: users.streakDays,
          lastCompletedPomodoroDate: users.lastCompletedPomodoroDate,
        })
        .from(users)
        .where(eq(users.id, user.id))
        .limit(1);

      let newStreakDays = 1; // Default for first completion

      if (currentUserData.length > 0 && currentUserData[0]) {
        const userData = currentUserData[0];

        if (userData.lastCompletedPomodoroDate) {
          const lastCompletedDate = new Date(userData.lastCompletedPomodoroDate);
          lastCompletedDate.setHours(0, 0, 0, 0);

          const timeDiff = today.getTime() - lastCompletedDate.getTime();
          const daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));

          if (daysDiff === 0) {
            // Already completed today - keep current streak
            newStreakDays = userData.streakDays ?? 1;
          } else if (daysDiff === 1) {
            // Completed yesterday - increment streak
            newStreakDays = (userData.streakDays ?? 0) + 1;
          } else {
            // More than 1 day gap - reset streak to 1
            newStreakDays = 1;
          }
        }
      }

      await db
        .update(users)
        .set({
          lastCompletedPomodoroDate: today,
          streakDays: newStreakDays,
        })
        .where(eq(users.id, user.id));

      return NextResponse.json({
        success: true,
        taskUpdated: taskUpdateResult,
        sessionType: isFreeSession ? 'free' : 'task',
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
