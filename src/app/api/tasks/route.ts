import { db } from '@/server/db';
import { tasks } from '@/server/db/schema';
import { eq } from 'drizzle-orm';
import { TaskStatus } from '@/types/task';
import type {Task, Subtask} from '@/types/task'
import { calculateTaskDueDate } from '@/lib/task/util';
import { calculateWeekFromDueDate } from '@/lib/task/util';
import { apiRoutePatterns } from '@/lib/api/server-util';

export const GET = apiRoutePatterns.get(
  async (searchParams) => {
    const courseId = searchParams.get('courseId')!;
    return await db.select().from(tasks).where(eq(tasks.courseId, courseId)).orderBy(tasks.week);
  },
  'Error fetching tasks',
  ['courseId']
);

export const POST = apiRoutePatterns.post(
  async (data: {
    courseId: string;
    tasks: Array<Omit<Task, 'id' | 'courseId' | 'isDraft'> & {
      subtasks?: Subtask[];
      notes?: string;
      dueDate?: string;
    }>
  }) => {
    const { courseId, tasks: newTasks } = data;

    const insertedTasks = await db.insert(tasks).values(
      newTasks.map(task => ({
        ...task,
        courseId,
        week: calculateWeekFromDueDate(new Date(task.dueDate)),
        status: task.status ?? TaskStatus.DRAFT,
        subtasks: task.subtasks?.map(subtask => ({
          ...subtask,
          id: crypto.randomUUID(),
          status: subtask.status ?? TaskStatus.TODO,
        })),
        dueDate: new Date(task.dueDate),
      }))
    ).returning();

    return insertedTasks;
  },
  'Error creating tasks',
  ['courseId', 'tasks']
);

export const PATCH = apiRoutePatterns.patch(
  async (id: string, updates: Partial<Task> & {
    subtasks?: Subtask[];
    notes?: string;
  }) => {
    const [updatedTask] = await db.update(tasks)
      .set({
        ...updates,
        status: updates.status ?? TaskStatus.TODO,
        subtasks: updates.subtasks?.map(subtask => ({
          ...subtask,
          id: crypto.randomUUID(),
          status: subtask.status ?? TaskStatus.TODO,
        })),
        notes: updates.notes,
        dueDate: updates.week ? calculateTaskDueDate(updates.week) : undefined
      })
      .where(eq(tasks.id, id))
      .returning();

    return updatedTask;
  },
  'Error updating task'
);

export const DELETE = apiRoutePatterns.delete(
  async (id: string) => {
    await db.delete(tasks).where(eq(tasks.id, id));
    return { success: true };
  },
  'Error deleting task'
);