import { and, eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth/api';
import { db } from '@/server/db';
import { subtasks, tasks } from '@/server/db/schema';

export const DELETE = withAuth<{ taskId: string; subtaskId: string }>(
    async (request, { params, user }) => {
        const { taskId, subtaskId } = await params;

        // Verify that the parent task belongs to the user
        const parent = await db.select().from(tasks).where(and(eq(tasks.id, taskId), eq(tasks.userId, user.id))).limit(1);
        if (!parent.length) {
            return NextResponse.json({ error: 'Task not found or unauthorized' }, { status: 404 });
        }

        // Delete the subtask row directly
        const deleted = await db.delete(subtasks)
            .where(and(eq(subtasks.id, subtaskId), eq(subtasks.taskId, taskId)))
            .returning();

        if (!deleted.length) {
            return NextResponse.json({ error: 'Subtask not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true });
    },
);
