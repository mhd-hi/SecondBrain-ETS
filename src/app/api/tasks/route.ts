import { NextResponse } from 'next/server';
import { db } from '@/server/db';
import { tasks } from '@/server/db/schema';
import { eq } from 'drizzle-orm';
import { TaskStatus } from '@/types/task';
import type {Task, Subtask} from '@/types/task'
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
    const { courseId, tasks: newTasks } = await request.json() as { 
      courseId: string; 
      tasks: Array<Omit<Task, 'id' | 'courseId' | 'isDraft'> & { 
        subtasks?: Subtask[];
        notes?: string;
      }> 
    };

    if (!courseId || !newTasks?.length) {
      return NextResponse.json(
        { error: 'Course ID and tasks are required' },
        { status: 400 }
      );
    }

    // Insert tasks
    const insertedTasks = await db.insert(tasks).values(
      newTasks.map(task => ({
        courseId,
        title: task.title,
        week: task.week,
        type: task.type,
        status: TaskStatus.DRAFT,
        subtasks: task.subtasks?.map(subtask => ({
          id: crypto.randomUUID(),
          title: subtask.title,
          status: subtask.status ?? TaskStatus.PENDING,
          notes: subtask.notes,
          estimatedEffort: subtask.estimatedEffort
        })),
        notes: task.notes,
        dueDate: calculateTaskDueDate(task.week)
      }))
    ).returning();

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
    const { id, ...updates } = await request.json() as { 
      id: string 
    } & Partial<Task> & {
      subtasks?: Subtask[];
      notes?: string;
    };

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
        subtasks: updates.subtasks?.map(subtask => ({
          id: crypto.randomUUID(),
          title: subtask.title,
          status: subtask.status ?? TaskStatus.PENDING,
          notes: subtask.notes,
          estimatedEffort: subtask.estimatedEffort
        })),
        notes: updates.notes,
        dueDate: updates.week ? calculateTaskDueDate(updates.week) : undefined // Using standard 15 weeks
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