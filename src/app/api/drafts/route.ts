import { NextResponse } from 'next/server';
import { db } from '@/server/db';
import { tasks } from '@/server/db/schema';
import { eq } from 'drizzle-orm';
import type { Task } from '@/types/task';
import { TaskStatus } from '@/types/task';
import { calculateTaskDueDate } from '@/lib/task/util';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('courseId');

    if (!courseId) {
      return NextResponse.json(
        { error: 'Course ID is required' },
        { status: 400 }
      );
    }

    const drafts = await db.select().from(tasks).where(eq(tasks.courseId, courseId)).orderBy(tasks.week);
    return NextResponse.json(drafts);
  } catch (error) {
    console.error('Error fetching drafts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch drafts' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { courseId, ...data } = await request.json() as Task & { courseId: string };

    // NOTE: Untrusted data source, don't use spread operator
    const [draft] = await db.insert(tasks).values({
      courseId,
      title: data.title,
      week: data.week,
      notes: data.notes,
      type: data.type,
      estimatedEffort: data.estimatedEffort,
      status: TaskStatus.DRAFT,
      subtasks: data.subtasks?.map(({ status, ...subtask }) => ({
        ...subtask,
        id: crypto.randomUUID(),
        status: status ?? TaskStatus.DRAFT
      })),
      dueDate: calculateTaskDueDate(data.week)
    }).returning();
    return NextResponse.json(draft);
  } catch (error) {
    console.error('Error creating draft:', error);
    return NextResponse.json(
      { error: 'Failed to create draft' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const { id, ...updates } = await request.json() as { id: string } & Partial<Task>;
    const [draft] = await db.update(tasks)
      .set({
        ...updates,
        status: updates.status ?? TaskStatus.DRAFT,
        subtasks: updates.subtasks?.map(({ status, ...subtask }) => ({
          ...subtask,
          id: crypto.randomUUID(),
          status: status ?? TaskStatus.TODO
        }))
      })
      .where(eq(tasks.id, id))
      .returning();
    return NextResponse.json(draft);
  } catch (error) {
    console.error('Error updating draft:', error);
    return NextResponse.json(
      { error: 'Failed to update draft' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Draft ID is required' },
        { status: 400 }
      );
    }

    await db.delete(tasks).where(eq(tasks.id, id));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting draft:', error);
    return NextResponse.json(
      { error: 'Failed to delete draft' },
      { status: 500 }
    );
  }
}