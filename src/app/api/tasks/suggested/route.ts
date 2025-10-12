import { and, eq, lt, or } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { withAuthSimple } from '@/lib/auth/api';
import { db } from '@/server/db';
import { tasks } from '@/server/db/schema';
import { StatusTask } from '@/types/status-task';

export const GET = withAuthSimple(
  async (request, user) => {
    try {
      const now = new Date();

      // Find the most overdue task with status IN_PROGRESS
      // If no IN_PROGRESS tasks, find the most overdue TODO task
      const suggestedTasks = await db
        .select({
          id: tasks.id,
          title: tasks.title,
          dueDate: tasks.dueDate,
          status: tasks.status,
        })
        .from(tasks)
        .where(
          and(
            eq(tasks.userId, user.id),
            lt(tasks.dueDate, now), // Overdue tasks only
            or(
              eq(tasks.status, StatusTask.IN_PROGRESS),
              eq(tasks.status, StatusTask.TODO),
            ),
          ),
        )
        .orderBy(tasks.dueDate) // Most overdue first
        .limit(5); // Get top 5 to have options

      if (!suggestedTasks.length) {
        // If no overdue tasks, get the most urgent upcoming IN_PROGRESS or TODO task
        const upcomingTasks = await db
          .select({
            id: tasks.id,
            title: tasks.title,
            dueDate: tasks.dueDate,
            status: tasks.status,
          })
          .from(tasks)
          .where(
            and(
              eq(tasks.userId, user.id),
              or(
                eq(tasks.status, StatusTask.IN_PROGRESS),
                eq(tasks.status, StatusTask.TODO),
              ),
            ),
          )
          .orderBy(tasks.dueDate)
          .limit(1);

        if (upcomingTasks.length > 0) {
          return NextResponse.json(upcomingTasks[0]);
        }

        // No tasks available
        return NextResponse.json(null);
      }

      // Prioritize IN_PROGRESS tasks over TODO tasks
      const inProgressTask = suggestedTasks.find(task => task.status === StatusTask.IN_PROGRESS);
      const suggestedTask = inProgressTask ?? suggestedTasks[0];

      return NextResponse.json(suggestedTask);
    } catch (error) {
      console.error('Failed to fetch suggested task:', error);
      return NextResponse.json(
        { error: 'Failed to fetch suggested task' },
        { status: 500 },
      );
    }
  },
);
