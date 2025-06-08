import { NextResponse } from "next/server";
import { updateTaskStatus } from "@/lib/task/queries";
import type { TaskStatus } from "@/types/task";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ taskId: string }> }
) {
  try {
    const { taskId } = await params;
    const { status } = await request.json() as { status: TaskStatus };

    if (!status) {
      return NextResponse.json(
        { error: "Status is required" },
        { status: 400 }
      );
    }

    const updatedTask = await updateTaskStatus(taskId, status);
    return NextResponse.json(updatedTask);
  } catch (error) {
    console.error("Error updating task status:", error);
    return NextResponse.json(
      { error: "Failed to update task status" },
      { status: 500 }
    );
  }
} 