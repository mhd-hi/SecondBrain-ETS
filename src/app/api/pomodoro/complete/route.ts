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

      // Update the lastCompletedPomodoroDate
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      await db
        .update(users)
        .set({
          lastCompletedPomodoroDate: today,
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
