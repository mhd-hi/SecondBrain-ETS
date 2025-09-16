import { and, eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth/api';
import { db } from '@/server/db';
import { subtasks, tasks } from '@/server/db/schema';

export const PATCH = withAuth<{ taskId: string; subtaskId: string }>(
  async (request, { params, user }) => {
    const { taskId, subtaskId } = await params;
    const { status } = await request.json() as { status: string };

    // Verify that the parent task belongs to the user
    const parent = await db.select().from(tasks).where(and(eq(tasks.id, taskId), eq(tasks.userId, user.id))).limit(1);
    if (!parent.length) {
      return NextResponse.json({ error: 'Task not found or unauthorized' }, { status: 404 });
    }

    // Update the subtask row directly
    const updated = await db.update(subtasks)
      .set({ status, updatedAt: new Date() } as any)
      .where(and(eq(subtasks.id, subtaskId), eq(subtasks.taskId, taskId)))
      .returning();

    if (!updated.length) {
      return NextResponse.json({ error: 'Subtask not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  },
);
