import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { updateTaskStatus } from "@/lib/task/queries";
import type { TaskStatus } from "@/types/task";
import { withAuth, type AuthenticatedUser } from "@/lib/auth/api";

async function handleUpdateTaskStatus(
  request: NextRequest,
  context: { params: Promise<{ taskId: string }>; user: AuthenticatedUser }
): Promise<NextResponse> {
  const { taskId } = await context.params;
  const { status } = await request.json() as { status: TaskStatus };

  if (!status) {
    return NextResponse.json(
      { error: "Status is required" },
      { status: 400 }
    );
  }

  const updatedTask = await updateTaskStatus(taskId, status, context.user.id);
  return NextResponse.json(updatedTask);
}

export const PATCH = withAuth(handleUpdateTaskStatus);