import { NextResponse } from 'next/server';
import { db } from '@/server/db';
import { tasks } from '@/server/db/schema';
import { eq } from 'drizzle-orm';
import type { Draft } from '@/types/course';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ taskId: string }> }
) {
  try {
    const body = await request.json() as Partial<Draft>;
    const { taskId } = await params;

    // Update the task
    await db
      .update(tasks)
      .set({
        title: body.title,
        notes: body.notes,
        week: body.week,
        status: body.status,
        subtasks: body.subtasks ? body.subtasks.map(subtask => ({
          id: subtask.id || crypto.randomUUID(),
          title: subtask.title,
          completed: subtask.completed ?? false
        })) : null,
        isDraft: body.isDraft,
        updatedAt: new Date(),
      })
      .where(eq(tasks.id, taskId));

    return NextResponse.json({ success: true });
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