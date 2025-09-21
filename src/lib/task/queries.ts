import type { StatusTask } from '@/types/status-task';
import type { Subtask } from '@/types/subtask';
import type { Task } from '@/types/task';
import { and, eq, gte, inArray, lt } from 'drizzle-orm';
import { parseStatusTask } from '@/lib/task';
import { db } from '@/server/db';
import { courses, subtasks, tasks } from '@/server/db/schema';

type TaskRow = {
  tasks: {
    id: string;
    courseId: string;
    title: string;
    notes?: string | null;
    week: number;
    type: string;
    status: StatusTask;
    estimatedEffort: number;
    actualEffort: number;
    createdAt: Date;
    updatedAt: Date;
    dueDate: Date;
  };
  courses?: {
    id: string;
    userId: string;
    name: string;
    code: string;
    term: string;
    color: string;
    createdAt: Date;
    updatedAt: Date;
  } | null;
};

type DBSubtaskRow = {
  id: string;
  type: string;
  taskId: string;
  title: string;
  notes?: string | null;
  status: string;
  estimatedEffort: number;
  createdAt: Date;
  updatedAt: Date;
  dueDate?: Date | null;
};

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

    const results = await db
      .select()
      .from(tasks)
      .where(and(...conditions))
      .leftJoin(courses, eq(tasks.courseId, courses.id));

    const taskRows = results as TaskRow[];

    const taskIds = taskRows.map(tr => tr.tasks.id).filter(Boolean);

    const subs: DBSubtaskRow[] = taskIds.length > 0
      ? await db.select().from(subtasks).where(inArray(subtasks.taskId, taskIds))
      : [];

    const subsByTask = new Map<string, Subtask[]>();
    for (const s of subs) {
      const list = subsByTask.get(s.taskId) ?? [];
      list.push({
        id: s.id,
        title: s.title,
        status: parseStatusTask(String(s.status)),
        notes: s.notes ?? undefined,
        estimatedEffort: s.estimatedEffort,
      });
      subsByTask.set(s.taskId, list);
    }

    return taskRows.map((row) => {
      const t = row.tasks;
      const course = row.courses ?? undefined;
      return {
        id: t.id,
        courseId: t.courseId,
        title: t.title,
        notes: t.notes ?? undefined,
        week: t.week,
        type: t.type as Task['type'],
        status: t.status,
        estimatedEffort: t.estimatedEffort,
        actualEffort: t.actualEffort,
        subtasks: subsByTask.get(t.id) ?? [],
        createdAt: t.createdAt,
        updatedAt: t.updatedAt,
        dueDate: t.dueDate,
        course,
      } as Task;
    });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    throw error;
  }
};

export const updateStatusTask = async (taskId: string, status: StatusTask, userId: string) => {
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
