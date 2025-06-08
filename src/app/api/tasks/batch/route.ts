import { NextResponse } from 'next/server';
import { db } from '@/server/db';
import { tasks } from '@/server/db/schema';
import { inArray, eq } from 'drizzle-orm';
import type { Task } from '@/types/task';
import { TaskStatus } from '@/types/task';
import { calculateTaskDueDate } from '@/lib/task/util';
import { withErrorHandling, successResponse } from '@/lib/api/server-util';

export interface BatchUpdateRequest {
  action: 'update' | 'delete';
  taskIds: string[];
  updates?: Partial<Task>;
  taskUpdates?: Array<{ taskId: string; updates: Partial<Task> }>; // For per-task updates
}

export const POST = withErrorHandling(
  async (request: Request) => {
    const { action, taskIds, updates, taskUpdates } = await request.json() as BatchUpdateRequest;

    if (!action || !taskIds || taskIds.length === 0) {
      return NextResponse.json(
        { error: 'Action and taskIds are required' },
        { status: 400 }
      );
    }

    if (action === 'update' && !updates && !taskUpdates) {
      return NextResponse.json(
        { error: 'Either updates or taskUpdates are required for update action' },
        { status: 400 }
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
            processedUpdates.dueDate = calculateTaskDueDate(taskUpdate.week);
          }

          // Process subtasks if they exist
          if (taskUpdate.subtasks) {
            processedUpdates.subtasks = taskUpdate.subtasks.map(subtask => ({
              ...subtask,
              id: subtask.id || crypto.randomUUID(),
              status: subtask.status ?? TaskStatus.TODO,
            }));
          }

          return db
            .update(tasks)
            .set({
              ...processedUpdates,
              updatedAt: new Date()
            })
            .where(eq(tasks.id, taskId))
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
          processedUpdates.dueDate = calculateTaskDueDate(updates.week);
        }

        // Process subtasks if they exist
        if (updates?.subtasks) {
          processedUpdates.subtasks = updates.subtasks.map(subtask => ({
            ...subtask,
            id: subtask.id || crypto.randomUUID(),
            status: subtask.status ?? TaskStatus.TODO,
          }));
        }

        // Update all tasks in a single query
        const updatedTasks = await db
          .update(tasks)
          .set({
            ...processedUpdates,
            updatedAt: new Date()
          })
          .where(inArray(tasks.id, taskIds))
          .returning();

        result = updatedTasks;
      }

    } else if (action === 'delete') {
      // Delete all tasks in a single query
      await db
        .delete(tasks)
        .where(inArray(tasks.id, taskIds));

      result = { deletedCount: taskIds.length };
    } else {
      return NextResponse.json(
        { error: 'Invalid action. Must be "update" or "delete"' },
        { status: 400 }
      );
    }

    return successResponse({
      action,
      affectedCount: action === 'update' ? (result as unknown[]).length : (result as { deletedCount: number }).deletedCount,
      result
    });
  },
  'Error performing batch operation'
);
