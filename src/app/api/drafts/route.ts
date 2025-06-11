import type { Task } from '@/types/task';
import { NextResponse } from 'next/server';
import { withAuthSimple } from '@/lib/auth/api';
import { createUserTask, deleteUserTask, getUserCourseTasks, updateUserTask } from '@/lib/auth/db';
import { calculateTaskDueDate } from '@/lib/task/util';
import { TaskStatus } from '@/types/task';

export const GET = withAuthSimple(
  async (request, user) => {
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('courseId');

    if (!courseId) {
      return NextResponse.json(
        { error: 'courseId parameter is required', code: 'MISSING_PARAMETER' },
        { status: 400 },
      );
    }

    // Use secure query function that automatically verifies ownership
    const drafts = await getUserCourseTasks(courseId, user.id);

    // Filter for draft status tasks
    const draftTasks = drafts.filter(task => task.status === TaskStatus.DRAFT);
    return NextResponse.json(draftTasks);
  },
);

export const POST = withAuthSimple(
  async (request, user) => {
    const data = await request.json() as Task & { courseId: string };

    if (!data.courseId || !data.title || !data.week) {
      return NextResponse.json(
        { error: 'courseId, title, and week are required', code: 'MISSING_FIELDS' },
        { status: 400 },
      );
    }

    const { courseId, ...taskData } = data;

    // Use secure function to create task with automatic user assignment
    const draft = await createUserTask(user.id, {
      courseId,
      title: taskData.title,
      week: taskData.week,
      notes: taskData.notes,
      type: taskData.type,
      estimatedEffort: taskData.estimatedEffort,
      status: TaskStatus.DRAFT,
      subtasks: taskData.subtasks?.map(subtask => ({
        ...subtask,
        id: crypto.randomUUID(),
        status: subtask.status ?? TaskStatus.DRAFT,
      })),
      dueDate: calculateTaskDueDate(taskData.week),
    });

    return NextResponse.json(draft);
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

    const updates = await request.json() as Partial<Task>;

    const draft = await updateUserTask(id, user.id, {
      ...updates,
      status: updates.status ?? TaskStatus.DRAFT,
      subtasks: updates.subtasks?.map(subtask => ({
        ...subtask,
        id: crypto.randomUUID(),
        status: subtask.status ?? TaskStatus.TODO,
      })),
    });

    return NextResponse.json(draft);
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
