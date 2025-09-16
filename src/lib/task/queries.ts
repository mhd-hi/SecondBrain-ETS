import type { Subtask } from '@/types/subtask';
import type { Task } from '@/types/task';
import type { TaskStatus } from '@/types/task-status';
import { and, eq, gte, inArray, lt } from 'drizzle-orm';
import { db } from '@/server/db';
import { courses, subtasks, tasks } from '@/server/db/schema';

export const getTasksForWeek = async (startDate: Date, endDate: Date, userId: string): Promise<Task[]> => {
  try {
    if (!userId) {
      throw new Error('User authentication required');
    }

    const conditions = [
      gte(tasks.dueDate, startDate),
      lt(tasks.dueDate, endDate),
      eq(tasks.userId, userId),
    ];

    const results = await db.select().from(tasks).where(and(...conditions)).leftJoin(courses, eq(tasks.courseId, courses.id));

    const taskRows = results.map(r => r as any);
    const taskIds = taskRows.map(tr => tr.tasks?.id ?? tr.id ?? tr.tasksId).filter(Boolean);

    let subs: any[] = [];
    if (taskIds.length > 0) {
      subs = await db.select().from(subtasks).where(inArray(subtasks.taskId, taskIds));
    }

    const subsByTask: Record<string, any[]> = {};
    for (const s of subs) {
      let arr = subsByTask[s.taskId];
      if (!arr) {
        arr = [];
        subsByTask[s.taskId] = arr;
      }
      arr.push(s);
    }

    return taskRows.map(row => ({
      ...row.tasks,
      course: row.courses ?? undefined,
      status: row.tasks.status as TaskStatus,
      subtasks: subsByTask[row.tasks.id] ?? [],
      notes: row.tasks.notes ?? undefined,
    }));
  } catch (error) {
    console.error('Error fetching tasks:', error);
    throw error;
  }
};

export const updateTaskStatus = async (taskId: string, status: TaskStatus, userId: string) => {
  if (!userId) {
    throw new Error('User authentication required');
  }

  const conditions = [
    eq(tasks.id, taskId),
    eq(tasks.userId, userId),
  ];

  return db
    .update(tasks)
    .set({ status, updatedAt: new Date() })
    .where(and(...conditions))
    .returning();
};

export const createTask = async (data: {
  courseId: string;
  userId: string;
  title: string;
  notes?: string;
  estimatedEffort: number;
  dueDate: Date;
  subtasks?: Subtask[];
}) => {
  // Calculate week number based on due date
  const startOfYear = new Date(new Date().getFullYear(), 0, 1);
  const week = Math.ceil((data.dueDate.getTime() - startOfYear.getTime()) / (7 * 24 * 60 * 60 * 1000));

  return db.insert(tasks).values({
    ...data,
    week,
    type: 'theorie',
    status: 'TODO',
  }).returning();
};
