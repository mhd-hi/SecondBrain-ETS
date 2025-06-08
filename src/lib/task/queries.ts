import { and, eq, gte, lt } from "drizzle-orm";
import { db } from "@/server/db";
import { tasks, courses } from "@/server/db/schema";
import type { TaskStatus, Task, Subtask } from "@/types/task";

export const getTasksForWeek = async (startDate: Date, endDate: Date): Promise<Task[]> => {
  try {
    
    const results = await db.select().from(tasks)
      .where(and(
        gte(tasks.dueDate, startDate),
        lt(tasks.dueDate, endDate)
      ))
      .leftJoin(courses, eq(tasks.courseId, courses.id));

    return results.map(row => ({
      ...row.tasks,
      course: row.courses ?? undefined,
      status: row.tasks.status as TaskStatus,
      subtasks: row.tasks.subtasks as Subtask[] | undefined,
      notes: row.tasks.notes ?? undefined
    }));
  } catch (error) {
    console.error('Error fetching tasks:', error);
    throw error;
  }
};

export const updateTaskStatus = async (taskId: string, status: TaskStatus) => {
  return db
    .update(tasks)
    .set({ status, updatedAt: new Date() })
    .where(eq(tasks.id, taskId))
    .returning();
};

export const createTask = async (data: {
  courseId: string;
  title: string;
  notes?: string;
  estimatedEffort: number;
  dueDate: Date;
  subtasks?: Array<{
    id: string;
    title: string;
    status: TaskStatus;
    notes?: string;
    estimatedEffort?: number;
  }>;
}) => {
  // Calculate week number based on due date
  const startOfYear = new Date(new Date().getFullYear(), 0, 1);
  const week = Math.ceil((data.dueDate.getTime() - startOfYear.getTime()) / (7 * 24 * 60 * 60 * 1000));

  return db.insert(tasks).values({
    ...data,
    week,
    type: "theorie",
    status: "DRAFT",
  }).returning();
}; 