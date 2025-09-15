import type { NextRequest } from 'next/server';
import { sql } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { db } from '@/server/db';
import { tasks } from '@/server/db/schema';

// POST /api/tasks/update
export async function POST(req: NextRequest) {
  try {
    const { taskId, input, value } = await req.json();
    const allowedFields = ['title', 'notes', 'status', 'estimatedEffort', 'actualEffort', 'dueDate', 'week', 'type'];

    if (!allowedFields.includes(input)) {
      console.error('Invalid field while updating task, field: ', input);
      return NextResponse.json({ success: false, error: 'Invalid field' }, { status: 400 });
    }

    const updateObj: Record<string, any> = {};

    if (input === 'dueDate') {
      updateObj[input] = new Date(value);
    } else {
      updateObj[input] = value;
    }

    updateObj.updatedAt = new Date();

    try {
      const result = await db.update(tasks)
        .set(updateObj)
        .where(sql`id = ${taskId}`)
        .returning();
      return NextResponse.json({ success: true, taskId, input, value, updated: result });
    } catch (dbErr) {
      console.error('DB update error:', dbErr);
      return NextResponse.json({ success: false, error: (dbErr as any)?.message || 'Unknown DB error' }, { status: 400 });
    }
  } catch (err) {
    console.error('API error:', err);
    return NextResponse.json({ success: false, error: (err as any)?.message || 'Unknown error' }, { status: 400 });
  }
}
