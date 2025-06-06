import { NextResponse } from 'next/server';
import { db } from '@/server/db';
import { tasks } from '@/server/db/schema';
import { eq } from 'drizzle-orm';
import type { Task } from '@/types/task';
import { TaskStatus } from '@/types/task';
import { calculateTaskDueDate } from '@/lib/task/util';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ taskId: string }> }
) {
  try {
    const { taskId } = await params;
    const body = await request.json() as Task;

    console.log('PATCH /api/tasks/[taskId]: taskId', taskId);
    console.log('PATCH /api/tasks/[taskId]: request body week', body.week);
    const calculatedDueDate = body.week !== undefined ? calculateTaskDueDate(body.week, 15) : undefined;
    console.log('PATCH /api/tasks/[taskId]: calculatedDueDate', calculatedDueDate);
    if (calculatedDueDate instanceof Date && !isNaN(calculatedDueDate.getTime())) {
      console.log('PATCH /api/tasks/[taskId]: calculatedDueDate.toISOString()', calculatedDueDate.toISOString());
    }

    const sanitizedSubtasks = body.subtasks ? body.subtasks.map(subtask => ({
      id: subtask.id || crypto.randomUUID(),
      title: subtask.title,
      status: subtask.status ?? TaskStatus.TODO,
      notes: subtask.notes,
      estimatedEffort: subtask.estimatedEffort
    })) : null;

    const task = await db
      .update(tasks)
      .set({
        title: body.title,
        notes: body.notes,
        week: body.week,
        type: body.type,
        estimatedEffort: body.estimatedEffort,
        status: body.status,
        subtasks: sanitizedSubtasks,
        updatedAt: new Date(),
        ...(calculatedDueDate !== undefined && { dueDate: calculatedDueDate }),
      })
      .where(eq(tasks.id, taskId))
      .returning();

    return NextResponse.json({ data: task[0] });
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