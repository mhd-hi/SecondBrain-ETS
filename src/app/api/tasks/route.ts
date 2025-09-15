import type { Subtask } from '@/types/subtask';
import type { Task } from '@/types/task';
import { NextResponse } from 'next/server';
import { withAuthSimple } from '@/lib/auth/api';
import { createUserTask, deleteUserTask, getUserCourse, getUserCourseTasks, updateUserTask } from '@/lib/auth/db';
import { calculateTaskDueDate, calculateWeekFromDueDate } from '@/lib/task/util';
import { TaskStatus } from '@/types/task-status';

export const GET = withAuthSimple(
  async (request, user) => {
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('courseId');
    const statusParam = searchParams.get('status');

    if (!courseId) {
      return NextResponse.json(
        { error: 'courseId parameter is required', code: 'MISSING_PARAMETER' },
        { status: 400 },
      );
    }

    // Use secure query function that automatically verifies ownership
    const courseTasks = await getUserCourseTasks(courseId, user.id);

    // Filter by status if provided
    let filteredTasks = courseTasks;
    if (statusParam) {
      const statusStrings = statusParam.split(',').map(s => s.trim());
      filteredTasks = courseTasks.filter(task => statusStrings.includes(task.status));
    }

    return NextResponse.json(filteredTasks);
  },
);

export const POST = withAuthSimple(
  async (request, user) => {
    const data = await request.json() as {
      courseId: string;
      tasks: Array<Omit<Task, 'id' | 'courseId'> & {
        subtasks?: Subtask[];
        notes?: string;
        dueDate?: string;
      }>;
    };

    const { courseId, tasks: newTasks } = data;

    // Verify course ownership first
    await getUserCourse(courseId, user.id);

    // Create tasks with secure function
    const tasksToCreate = newTasks.map((task) => {
      const userProvidedDueDate = task.dueDate ? new Date(task.dueDate) : null;

      return {
        ...task,
        courseId,
        // Calculate week from due date if not provided (for manual task creation)
        // Otherwise preserve the original week number from AI parsing
        week: task.week ?? (userProvidedDueDate ? calculateWeekFromDueDate(userProvidedDueDate) : 1),
        status: task.status ?? TaskStatus.TODO,
        subtasks: task.subtasks?.map(subtask => ({
          ...subtask,
          id: crypto.randomUUID(),
          status: subtask.status ?? TaskStatus.TODO,
        })),
        // Use user-provided due date if available, otherwise calculate from week
        dueDate: userProvidedDueDate && !Number.isNaN(userProvidedDueDate.getTime())
          ? userProvidedDueDate
          : calculateTaskDueDate(task.week || 1),
      };
    });

    // Use secure bulk insert
    const createdTasks = [];
    for (const taskData of tasksToCreate) {
      const task = await createUserTask(user.id, taskData);
      createdTasks.push(task);
    }

    return NextResponse.json(createdTasks);
  },
);

export const PATCH = withAuthSimple(
  async (request, user) => {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'id parameter is required', code: 'MISSING_PARAMETER' },
        { status: 400 },
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
      dueDate: updates.week ? calculateTaskDueDate(updates.week) : undefined,
    });

    return NextResponse.json(updatedTask);
  },
);

export const DELETE = withAuthSimple(
  async (request, user) => {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'id parameter is required', code: 'MISSING_PARAMETER' },
        { status: 400 },
      );
    }

    await deleteUserTask(id, user.id);
    return NextResponse.json({ success: true });
  },
);
