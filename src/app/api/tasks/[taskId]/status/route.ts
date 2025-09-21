import type { NextRequest } from 'next/server';
import type { AuthenticatedUser } from '@/lib/auth/api';
import type { StatusTask } from '@/types/status-task';
import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth/api';
import { updateStatusTask } from '@/lib/task/queries';

async function handleUpdateStatusTask(
  request: NextRequest,
  context: { params: Promise<{ taskId: string }>; user: AuthenticatedUser },
): Promise<NextResponse> {
  const { taskId } = await context.params;
  const { status } = await request.json() as { status: StatusTask };

  if (!status) {
    return NextResponse.json(
      { error: 'Status is required' },
      { status: 400 },
    );
  }

  const updatedTask = await updateStatusTask(taskId, status, context.user.id);
  return NextResponse.json(updatedTask);
}

export const PATCH = withAuth(handleUpdateStatusTask);
