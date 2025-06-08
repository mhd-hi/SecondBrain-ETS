import { NextResponse } from 'next/server';
import { db } from '@/server/db';
import { tasks } from '@/server/db/schema';
import { inArray } from 'drizzle-orm';
import { TaskStatus } from '@/types/task';
import { withErrorHandling, successResponse } from '@/lib/api/server-util';

export interface BatchStatusUpdateRequest {
  taskIds: string[];
  status: TaskStatus;
}

export const PATCH = withErrorHandling(
  async (request: Request) => {
    const { taskIds, status } = await request.json() as BatchStatusUpdateRequest;

    if (!taskIds || taskIds.length === 0) {
      return NextResponse.json(
        { error: 'taskIds are required' },
        { status: 400 }
      );
    }

    if (!status) {
      return NextResponse.json(
        { error: 'status is required' },
        { status: 400 }
      );
    }

    // Validate status is a valid TaskStatus
    if (!Object.values(TaskStatus).includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status value' },
        { status: 400 }
      );
    }

    // Update all tasks with the new status
    const updatedTasks = await db
      .update(tasks)
      .set({
        status,
        updatedAt: new Date()
      })
      .where(inArray(tasks.id, taskIds))
      .returning();

    return successResponse({
      updatedCount: updatedTasks.length,
      status,
      updatedTasks
    });
  },
  'Error performing batch status update'
);
