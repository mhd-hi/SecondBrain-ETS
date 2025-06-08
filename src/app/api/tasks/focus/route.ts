import { NextResponse } from "next/server";
import { and, eq, gte, lt, or } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { tasks, courses } from "@/server/db/schema";
import type { TaskStatus, Task, Subtask } from "@/types/task";

const connectionString = process.env.DATABASE_URL!;
const queryClient = postgres(connectionString);
const db = drizzle(queryClient);

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const filter = searchParams.get("filter") ?? "week"; // week, month, quarter

    const now = new Date();
    now.setHours(0, 0, 0, 0); // Start of today

    let endDate: Date;
    
    switch (filter) {
      case "month":
        endDate = new Date(now);
        endDate.setMonth(now.getMonth() + 1);
        break;
      case "quarter":
        endDate = new Date(now);
        endDate.setMonth(now.getMonth() + 3);
        break;
      default: // week
        endDate = new Date(now);
        endDate.setDate(now.getDate() + 7);
        break;
    }

    // Fetch tasks that are:
    // 1. Overdue (due date < today) OR
    // 2. Due within the selected time range AND are in progress
    const results = await db.select().from(tasks)
      .where(
        or(
          // Overdue tasks (any status)
          lt(tasks.dueDate, now),
          // Tasks due within filter range that are in progress
          and(
            gte(tasks.dueDate, now),
            lt(tasks.dueDate, endDate),
            eq(tasks.status, "IN_PROGRESS")
          )
        )
      )
      .leftJoin(courses, eq(tasks.courseId, courses.id));

    const tasksData: Task[] = results.map(row => ({
      ...row.tasks,
      course: row.courses ?? undefined,
      status: row.tasks.status as TaskStatus,
      subtasks: row.tasks.subtasks as Subtask[] | undefined,
      notes: row.tasks.notes ?? undefined
    }));

    return NextResponse.json(tasksData);
  } catch (error) {
    console.error("Error fetching focus tasks:", error);
    return NextResponse.json(
      { error: "Failed to fetch focus tasks" },
      { status: 500 }
    );
  }
}
