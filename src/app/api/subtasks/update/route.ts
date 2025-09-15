import type { NextRequest } from 'next/server';
import { sql } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { db } from '@/server/db';
import { tasks } from '@/server/db/schema';

// POST /api/subtasks/update
export async function POST(req: NextRequest) {
  try {
    const { id, input, value } = await req.json();
    // Only allow updating title or notes for subtasks
    const allowedFields = ['title', 'notes', 'status', 'estimatedEffort', 'actualEffort'];
    if (!allowedFields.includes(input)) {
      return NextResponse.json({ success: false, error: 'Invalid field' }, { status: 400 });
    }

    // Find the parent task containing this subtask
    const allTasks = await db.select().from(tasks);
    const parentTask = allTasks.find((t: any) => Array.isArray(t.subtasks) && t.subtasks.some((sub: any) => sub.id === id));
    if (!parentTask) {
      return NextResponse.json({ success: false, error: 'Subtask not found' }, { status: 404 });
    }
    const subtasks = Array.isArray(parentTask.subtasks)
      ? parentTask.subtasks.map((sub: any) => {
        if (sub.id === id) {
          return { ...sub, [input]: value };
        }
        return sub;
      })
      : [];

    // Update the parent task's subtasks array
    const result = await db.update(tasks)
      .set({ subtasks, updatedAt: new Date() })
      .where(sql`id = ${parentTask.id}`)
      .returning();
    return NextResponse.json({ success: true, id, input, value, updated: result });
  } catch (err) {
    return NextResponse.json({ success: false, error: (err as any)?.message || 'Unknown error' }, { status: 400 });
  }
}
