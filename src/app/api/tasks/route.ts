import { TaskStatus } from '@/types/task';
import type { Task, Subtask } from '@/types/task'
import { calculateTaskDueDate, calculateWeekFromDueDate } from '@/lib/task/util';
import { withAuthSimple } from '@/lib/auth/api';
import { getUserCourseTasks, createUserTask, updateUserTask, deleteUserTask, getUserCourse } from '@/lib/auth/db';
import { NextResponse } from 'next/server';

export const GET = withAuthSimple(
  async (request, user) => {
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('courseId');
    
    if (!courseId) {
      return NextResponse.json(
        { error: 'courseId parameter is required', code: 'MISSING_PARAMETER' },
        { status: 400 }
      );
    }

    // Use secure query function that automatically verifies ownership
    const courseTasks = await getUserCourseTasks(courseId, user.id);
    return NextResponse.json(courseTasks);
  }
);

export const POST = withAuthSimple(
  async (request, user) => {
    const data = await request.json() as {
      courseId: string;
      tasks: Array<Omit<Task, 'id' | 'courseId' | 'isDraft'> & {
        subtasks?: Subtask[];
        notes?: string;
        dueDate?: string;
      }>
    };

    const { courseId, tasks: newTasks } = data;

    // Verify course ownership first
    await getUserCourse(courseId, user.id);

    // Create tasks with secure function
    const tasksToCreate = newTasks.map(task => {
      const dueDate = new Date(task.dueDate || '');
      
      return {
        ...task,
        courseId,
        // Calculate week from due date if not provided (for manual task creation)
        // Otherwise preserve the original week number from AI parsing
        week: task.week ?? calculateWeekFromDueDate(dueDate),
        status: task.status ?? TaskStatus.DRAFT,
        subtasks: task.subtasks?.map(subtask => ({
          ...subtask,
          id: crypto.randomUUID(),
          status: subtask.status ?? TaskStatus.TODO,
        })),
        dueDate: calculateTaskDueDate(task.week || 1)
      };
    });

    // Use secure bulk insert
    const createdTasks = [];
    for (const taskData of tasksToCreate) {
      const task = await createUserTask(user.id, taskData);
      createdTasks.push(task);
    }

    return NextResponse.json(createdTasks);
  }
);

export const PATCH = withAuthSimple(
  async (request, user) => {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'id parameter is required', code: 'MISSING_PARAMETER' },
        { status: 400 }
      );
    }

    const updates = await request.json() as Partial<Task> & {
      subtasks?: Subtask[];
      notes?: string;
    };

    const updatedTask = await updateUserTask(id, user.id, {
      ...updates,
      status: updates.status ?? TaskStatus.TODO,
      subtasks: updates.subtasks?.map(subtask => ({
        ...subtask,
        id: crypto.randomUUID(),
        status: subtask.status ?? TaskStatus.TODO,
      })),
      notes: updates.notes,
      dueDate: updates.week ? calculateTaskDueDate(updates.week) : undefined
    });

    return NextResponse.json(updatedTask);
  }
);

export const DELETE = withAuthSimple(
  async (request, user) => {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'id parameter is required', code: 'MISSING_PARAMETER' },
        { status: 400 }
      );
    }

    await deleteUserTask(id, user.id);
    return NextResponse.json({ success: true });
  }
);