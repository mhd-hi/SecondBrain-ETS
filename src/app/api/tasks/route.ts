import { db } from '@/server/db';
import { tasks, courses } from '@/server/db/schema';
import { eq, and } from 'drizzle-orm';
import { TaskStatus } from '@/types/task';
import type {Task, Subtask} from '@/types/task'
import { calculateTaskDueDate, calculateWeekFromDueDate } from '@/lib/task/util';
import { apiRoutePatterns } from '@/lib/api/server-util';
import { auth } from '@/server/auth';

export const GET = apiRoutePatterns.get(
  async (searchParams) => {
    const session = await auth();
    if (!session?.user?.id) {
      throw new Error('Unauthorized');
    }

    const courseId = searchParams.get('courseId')!;
    
    // First verify the course belongs to the user
    const course = await db.select().from(courses).where(
      and(eq(courses.id, courseId), eq(courses.userId, session.user.id))
    ).limit(1);

    if (!course.length) {
      throw new Error('Course not found');
    }

    return await db.select().from(tasks).where(
      and(eq(tasks.courseId, courseId), eq(tasks.userId, session.user.id))
    ).orderBy(tasks.week);
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
    const session = await auth();
    if (!session?.user?.id) {
      throw new Error('Unauthorized');
    }

    const { courseId, tasks: newTasks } = data;

    // Verify the course belongs to the user
    const course = await db.select().from(courses).where(
      and(eq(courses.id, courseId), eq(courses.userId, session.user.id))
    ).limit(1);

    if (!course.length) {
      throw new Error('Course not found');
    }

    const insertedTasks = await db.insert(tasks).values(
      newTasks.map(task => {
        const dueDate = new Date(task.dueDate);
        
        return {
          ...task,
          courseId,
          userId: session.user.id,
          // Calculate week from due date if not provided (for manual task creation)
          // Otherwise preserve the original week number from AI parsing
          week: task.week ?? calculateWeekFromDueDate(dueDate),
          status: task.status ?? TaskStatus.DRAFT,
          subtasks: task.subtasks?.map(subtask => ({
            ...subtask,
            id: crypto.randomUUID(),
            status: subtask.status ?? TaskStatus.TODO,
          })),
          dueDate,
        };
      })
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
    const session = await auth();
    if (!session?.user?.id) {
      throw new Error('Unauthorized');
    }

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
      .where(and(eq(tasks.id, id), eq(tasks.userId, session.user.id)))
      .returning();

    return updatedTask;
  },
  'Error updating task'
);

export const DELETE = apiRoutePatterns.delete(
  async (id: string) => {
    const session = await auth();
    if (!session?.user?.id) {
      throw new Error('Unauthorized');
    }

    await db.delete(tasks).where(and(eq(tasks.id, id), eq(tasks.userId, session.user.id)));
    return { success: true };
  },
  'Error deleting task'
);