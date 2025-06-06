import { NextResponse } from 'next/server';
import { db } from '@/server/db';
import { tasks } from '@/server/db/schema';
import { eq } from 'drizzle-orm';
import type { Task } from '@/types/task';
import { TaskStatus } from '@/types/task';
import { calculateTaskDueDate } from '@/lib/task/util';

export async function PATCH(request: Request, { params }: { params: { taskId: string } }) {
  try {
    const { taskId } = params;
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

    const [updatedTask] = await db.update(tasks)
      .set(processedUpdates)
      .where(eq(tasks.id, taskId))
      .returning();

    if (!updatedTask) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedTask);
  } catch (error) {
    console.error('Error updating task:', error);
    return NextResponse.json(
      { error: 'Failed to update task' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ taskId: string }> }
) {
  try {
    const { taskId } = await params;

    // Delete the task
    await db
      .delete(tasks)
      .where(eq(tasks.id, taskId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting task:', error);
    return NextResponse.json(
      { error: 'Failed to delete task' },
      { status: 500 }
    );
  }
}