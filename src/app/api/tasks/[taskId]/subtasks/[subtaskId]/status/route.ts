import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/server/db";
import { tasks } from "@/server/db/schema";
import type { TaskStatus, Subtask } from "@/types/task";

export async function PATCH(
  request: Request,
  { params }: { params: { taskId: string; subtaskId: string } }
) {
  try {
    const { status } = await request.json() as { status: TaskStatus };

    // First, get the current task
    const [task] = await db
      .select()
      .from(tasks)
      .where(eq(tasks.id, params.taskId))
      .limit(1);

    if (!task) {
      return NextResponse.json(
        { error: "Task not found" },
        { status: 404 }
      );
    }

    // Update the subtask status in the subtasks array
    const subtasks = (task.subtasks as Subtask[]) || [];
    const updatedSubtasks = subtasks.map(subtask =>
      subtask.id === params.subtaskId
        ? { ...subtask, status }
        : subtask
    );

    // Update the task with the new subtasks array
    await db
      .update(tasks)
      .set({ 
        subtasks: updatedSubtasks,
        updatedAt: new Date()
      })
      .where(eq(tasks.id, params.taskId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating subtask status:", error);
    return NextResponse.json(
      { error: "Failed to update subtask status" },
      { status: 500 }
    );
  }
}
