import type { NextRequest } from 'next/server';
import type { AuthenticatedUser } from '@/lib/auth/api';
import type { Task } from '@/types/task';
import { and, eq, inArray } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { withAuthSimple } from '@/lib/auth/api';
import { successResponse } from '@/lib/utils/api/api-util';
import { calculateDueDateTask } from '@/lib/utils/task/task-util';
import { db } from '@/server/db';
import { tasks } from '@/server/db/schema';
import { StatusTask } from '@/types/status-task';

export type BatchUpdateRequest = {
  action: 'update' | 'delete';
  taskIds: string[];
  updates?: Partial<Task>;
  taskUpdates?: Array<{ taskId: string; updates: Partial<Task> }>; // For per-task updates
};

async function handleBatchOperation(
  request: NextRequest,
  user: AuthenticatedUser,
): Promise<NextResponse> {
  const { action, taskIds, updates, taskUpdates } = await request.json() as BatchUpdateRequest;

  if (!action || !taskIds || taskIds.length === 0) {
    return NextResponse.json(
      { error: 'Action and taskIds are required' },
      { status: 400 },
    );
  }

  if (action === 'update' && !updates && !taskUpdates) {
    return NextResponse.json(
      { error: 'Either updates or taskUpdates are required for update action' },
      { status: 400 },
    );
  }

  let result: unknown;

  if (action === 'update') {
    if (taskUpdates) {
      // Handle per-task updates
      const updatePromises = taskUpdates.map(async ({ taskId, updates: taskUpdate }) => {
        // Handle date fields properly
        const processedUpdates: Partial<Task> = { ...taskUpdate };

        if (taskUpdate.dueDate) {
          // Ensure dueDate is a proper Date object
          processedUpdates.dueDate = taskUpdate.dueDate instanceof Date
            ? taskUpdate.dueDate
            : new Date(taskUpdate.dueDate as string | number | Date);
        }

        // If week is provided but dueDate is not, calculate dueDate from week
        if (taskUpdate.week && !taskUpdate.dueDate) {
          processedUpdates.dueDate = calculateDueDateTask(taskUpdate.week);
        }

        // Process subtasks if they exist
        if (taskUpdate.subtasks) {
          processedUpdates.subtasks = taskUpdate.subtasks.map(subtask => ({
            ...subtask,
            id: subtask.id || crypto.randomUUID(),
            status: subtask.status ?? StatusTask.TODO,
          }));
        }

        return db
          .update(tasks)
          .set({
            ...processedUpdates,
            updatedAt: new Date(),
          })
          .where(and(eq(tasks.id, taskId), eq(tasks.userId, user.id)))
          .returning();
      });

      const results = await Promise.all(updatePromises);
      result = results.flat();
    } else {
      // Handle uniform updates (existing logic)
      const processedUpdates: Partial<Task> = { ...updates };

      if (updates?.dueDate) {
        // Ensure dueDate is a proper Date object
        processedUpdates.dueDate = updates.dueDate instanceof Date
          ? updates.dueDate
          : new Date(updates.dueDate as string | number | Date);
      }

      // If week is provided but dueDate is not, calculate dueDate from week
      if (updates?.week && !updates?.dueDate) {
        processedUpdates.dueDate = calculateDueDateTask(updates.week);
      }

      // Process subtasks if they exist
      if (updates?.subtasks) {
        processedUpdates.subtasks = updates.subtasks.map(subtask => ({
          ...subtask,
          id: subtask.id || crypto.randomUUID(),
          status: subtask.status ?? StatusTask.TODO,
        }));
      }

      // Update all tasks in a single query (only user's tasks)
      const updatedTasks = await db
        .update(tasks)
        .set({
          ...processedUpdates,
          updatedAt: new Date(),
        })
        .where(and(inArray(tasks.id, taskIds), eq(tasks.userId, user.id)))
        .returning();

      result = updatedTasks;
    }
  } else if (action === 'delete') {
    // Delete all tasks in a single query (only user's tasks)
    await db
      .delete(tasks)
      .where(and(inArray(tasks.id, taskIds), eq(tasks.userId, user.id)));

    result = { deletedCount: taskIds.length };
  } else {
    return NextResponse.json(
      { error: 'Invalid action. Must be "update" or "delete"' },
      { status: 400 },
    );
  }

  return successResponse({
    action,
    affectedCount: action === 'update' ? (result as unknown[]).length : (result as { deletedCount: number }).deletedCount,
    result,
  });
}

export const POST = withAuthSimple(handleBatchOperation);
