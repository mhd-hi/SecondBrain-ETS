import type { NextRequest } from 'next/server';
import type { AuthenticatedUser } from '@/lib/auth/api';
import { and, eq, inArray } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { successResponse } from '@/lib/api/server-util';
import { withAuthSimple } from '@/lib/auth/api';
import { db } from '@/server/db';
import { tasks } from '@/server/db/schema';
import { TaskStatus } from '@/types/task';

export type BatchStatusUpdateRequest = {
  taskIds: string[];
  status: TaskStatus;
};

async function handleBatchStatusUpdate(
  request: NextRequest,
  user: AuthenticatedUser,
): Promise<NextResponse> {
  const { taskIds, status } = await request.json() as BatchStatusUpdateRequest;

  if (!taskIds || taskIds.length === 0) {
    return NextResponse.json(
      { error: 'taskIds are required' },
      { status: 400 },
    );
  }

  if (!status) {
    return NextResponse.json(
      { error: 'status is required' },
      { status: 400 },
    );
  }

  // Validate status is a valid TaskStatus
  if (!Object.values(TaskStatus).includes(status)) {
    return NextResponse.json(
      { error: 'Invalid status value' },
      { status: 400 },
    );
  }

  // Update all tasks with the new status (only user's tasks)
  const updatedTasks = await db
    .update(tasks)
    .set({
      status,
      updatedAt: new Date(),
    })
    .where(and(inArray(tasks.id, taskIds), eq(tasks.userId, user.id)))
    .returning();

  return successResponse({
    updatedCount: updatedTasks.length,
    status,
    updatedTasks,
  });
}

export const PATCH = withAuthSimple(handleBatchStatusUpdate);
