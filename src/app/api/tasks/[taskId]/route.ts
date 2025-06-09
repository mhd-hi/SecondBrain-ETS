import type { NextRequest, NextResponse } from 'next/server';
import type { Task } from '@/types/task';
import { TaskStatus } from '@/types/task';
import { calculateTaskDueDate } from '@/lib/task/util';
import { successResponse } from '@/lib/api/server-util';
import { withAuth, type AuthenticatedUser } from '@/lib/auth/api';
import { updateUserTask, deleteUserTask } from '@/lib/auth/db';

async function handlePatchTask(
  request: NextRequest,
  context: { params: Promise<{ taskId: string }>; user: AuthenticatedUser }
): Promise<NextResponse> {
  const { taskId } = await context.params;
  const updates = await request.json() as Partial<Task>;

  // Handle date fields properly
  const processedUpdates: Partial<Task> = { ...updates };
  
  if (updates.dueDate) {
    // Ensure dueDate is a proper Date object
    processedUpdates.dueDate = updates.dueDate instanceof Date 
      ? updates.dueDate 
      : new Date(updates.dueDate as string | number | Date);
  }

  // If week is provided but dueDate is not, calculate dueDate from week
  if (updates.week && !updates.dueDate) {
    processedUpdates.dueDate = calculateTaskDueDate(updates.week);
  }

  // Process subtasks if they exist
  if (updates.subtasks) {
    processedUpdates.subtasks = updates.subtasks.map(subtask => ({
      ...subtask,
      id: subtask.id || crypto.randomUUID(),
      status: subtask.status ?? TaskStatus.TODO,
    }));
  }

  // Use secure update function with automatic ownership verification
  const updatedTask = await updateUserTask(taskId, context.user.id, processedUpdates);

  return successResponse(updatedTask);
}

async function handleDeleteTask(
  request: NextRequest,
  context: { params: Promise<{ taskId: string }>; user: AuthenticatedUser }
): Promise<NextResponse> {
  const { taskId } = await context.params;

  // Use secure delete function with automatic ownership verification
  await deleteUserTask(taskId, context.user.id);

  return successResponse({ success: true });
}

// Export the wrapped handlers
export const PATCH = withAuth(handlePatchTask);
export const DELETE = withAuth(handleDeleteTask);