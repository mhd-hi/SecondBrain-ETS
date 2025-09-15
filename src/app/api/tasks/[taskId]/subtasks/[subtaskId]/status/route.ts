import type { Subtask } from '@/types/subtask';
import type { TaskStatus } from '@/types/task-status';
import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth/api';
import { getUserTask, updateUserTask } from '@/lib/auth/db';

export const PATCH = withAuth<{ taskId: string; subtaskId: string }>(
  async (request, { params, user }) => {
    const { taskId, subtaskId } = await params;
    const { status } = await request.json() as { status: TaskStatus };
    const task = await getUserTask(taskId, user.id);

    if (!task) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 },
      );
    }

    // Update the subtask status in the subtasks array
    const subtasks = (task.subtasks as Subtask[]) || [];
    const updatedSubtasks = subtasks.map(subtask =>
      subtask.id === subtaskId
        ? { ...subtask, status }
        : subtask,
    );

    // Verify subtask exists
    const subtaskExists = subtasks.some(subtask => subtask.id === subtaskId);
    if (!subtaskExists) {
      return NextResponse.json(
        { error: 'Subtask not found' },
        { status: 404 },
      );
    }

    // Update the task with the new subtasks array using secure update
    await updateUserTask(taskId, user.id, {
      subtasks: updatedSubtasks,
    });

    return NextResponse.json({ success: true });
  },
);
