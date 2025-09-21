import type { NewTaskInput, UpdateTaskInput } from '@/types/api/task';
import { NextResponse } from 'next/server';
import { withAuthSimple } from '@/lib/auth/api';
import { createUserTask, deleteUserTask, getUserCourse, getUserCourseTasks, updateUserTask } from '@/lib/auth/db';
import { calculateTaskDueDate } from '@/lib/task/util';
import { calculateWeekFromDueDate } from '@/lib/term/util';
import { StatusTask } from '@/types/status-task';

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
      tasks: NewTaskInput[];
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
        week: task.week ?? (userProvidedDueDate ? calculateWeekFromDueDate(userProvidedDueDate) : 1),
        status: task.status ?? StatusTask.TODO,
        subtasks: task.subtasks?.map(subtask => ({
          ...subtask,
          id: subtask.id ?? crypto.randomUUID(),
          status: subtask.status ?? StatusTask.TODO,
        })),
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

    const updates = await request.json() as UpdateTaskInput;

    const payload = {
      ...updates,
      status: updates.status ?? StatusTask.TODO,
      subtasks: updates.subtasks?.map(subtask => ({
        ...subtask,
        id: subtask.id ?? crypto.randomUUID(),
        status: subtask.status ?? StatusTask.TODO,
      })),
      notes: updates.notes,
      dueDate: updates.week ? calculateTaskDueDate(updates.week) : undefined,
    } as Partial<typeof import('@/server/db/schema').tasks.$inferInsert> & { subtasks?: Partial<typeof import('@/server/db/schema').subtasks.$inferInsert>[] };

    const updatedTask = await updateUserTask(id, user.id, payload);

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
