import { NextResponse } from 'next/server';
import { db } from '@/server/db';
import { tasks, reviewQueue } from '@/server/db/schema';
import { eq } from 'drizzle-orm';
import type { Draft, Subtask } from '@/types/course';
import { TaskStatus, ReviewStatus } from '@/types/course';

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

    const courseTasks = await db.select().from(tasks).where(eq(tasks.courseId, courseId)).orderBy(tasks.week);
    return NextResponse.json(courseTasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tasks' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { courseId, tasks: newTasks } = await request.json() as { courseId: string; tasks: Draft[] };

    if (!courseId || !newTasks?.length) {
      return NextResponse.json(
        { error: 'Course ID and tasks are required' },
        { status: 400 }
      );
    }

    // Insert tasks and create review queue entries in a transaction
    const insertedTasks = await db.transaction(async (tx) => {
      const insertedTasks = await tx.insert(tasks).values(
        newTasks.map(task => ({
          courseId,
          title: task.title,
          week: task.week,
          isDraft: task.isDraft,
          status: TaskStatus.PENDING,
          description: task.suggestedDueDate,
          subtasks: task.subtasks?.map((subtask: Subtask) => ({
            id: subtask.id ?? crypto.randomUUID(),
            title: subtask.title,
            completed: subtask.completed ?? false
          })) ?? [],
          notes: task.notes
        }))
      ).returning();

      // Create review queue entries for each task
      await tx.insert(reviewQueue).values(
        insertedTasks.map(task => ({
          taskId: task.id,
          status: ReviewStatus.PENDING,
        }))
      );

      return insertedTasks;
    });

    return NextResponse.json(insertedTasks);
  } catch (error) {
    console.error('Error creating tasks:', error);
    return NextResponse.json(
      { error: 'Failed to create tasks' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const { id, ...updates } = await request.json() as { id: string } & Partial<Draft>;

    if (!id) {
      return NextResponse.json(
        { error: 'Task ID is required' },
        { status: 400 }
      );
    }

    const [updatedTask] = await db.update(tasks)
      .set({
        title: updates.title,
        week: updates.week,
        status: updates.status ?? TaskStatus.PENDING,
        isDraft: updates.isDraft ?? true,
        subtasks: updates.subtasks?.map((subtask: Subtask) => ({
          id: subtask.id ?? crypto.randomUUID(),
          title: subtask.title,
          completed: subtask.completed ?? false
        })) ?? [],
        notes: updates.notes
      })
      .where(eq(tasks.id, id))
      .returning();

    return NextResponse.json(updatedTask);
  } catch (error) {
    console.error('Error updating task:', error);
    return NextResponse.json(
      { error: 'Failed to update task' },
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
        { error: 'Task ID is required' },
        { status: 400 }
      );
    }

    await db.delete(tasks).where(eq(tasks.id, id));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting task:', error);
    return NextResponse.json(
      { error: 'Failed to delete task' },
      { status: 500 }
    );
  }
} 