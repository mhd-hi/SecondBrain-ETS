import type { NextRequest } from 'next/server';
import { sql } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { db } from '@/server/db';
import { tasks } from '@/server/db/schema';

// POST /api/tasks/update
export async function POST(req: NextRequest) {
  try {
    const { taskId, input, value } = await req.json();
    // Only allow updating certain fields
    const allowedFields = ['title', 'notes', 'status', 'estimatedEffort', 'actualEffort', 'dueDate', 'week', 'type'];

    if (!allowedFields.includes(input)) {
      return NextResponse.json({ success: false, error: 'Invalid field' }, { status: 400 });
    }

    const updateObj: Record<string, any> = {};
    updateObj.updatedAt = new Date();

    const result = await db.update(tasks)
      .set(updateObj)
      .where(sql`id = ${taskId}`)
      .returning();

    return NextResponse.json({ success: true, taskId, input, value, updated: result });
  } catch (err) {
    return NextResponse.json({ success: false, error: (err as any)?.message || 'Unknown error' }, { status: 400 });
  }
}
