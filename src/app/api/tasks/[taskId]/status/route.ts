import type { NextRequest } from 'next/server';
import type { AuthenticatedUser } from '@/lib/auth/api';
import type { TaskStatus } from '@/types/task';
import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth/api';
import { updateTaskStatus } from '@/lib/task/queries';

async function handleUpdateTaskStatus(
  request: NextRequest,
  context: { params: Promise<{ taskId: string }>; user: AuthenticatedUser },
): Promise<NextResponse> {
  const { taskId } = await context.params;
  const { status } = await request.json() as { status: TaskStatus };

  if (!status) {
    return NextResponse.json(
      { error: 'Status is required' },
      { status: 400 },
    );
  }

  const updatedTask = await updateTaskStatus(taskId, status, context.user.id);
  return NextResponse.json(updatedTask);
}

export const PATCH = withAuth(handleUpdateTaskStatus);
