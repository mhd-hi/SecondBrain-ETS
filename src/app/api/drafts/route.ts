import { db } from '@/server/db';
import { tasks } from '@/server/db/schema';
import { eq } from 'drizzle-orm';
import type { Task } from '@/types/task';
import { TaskStatus } from '@/types/task';
import { calculateTaskDueDate } from '@/lib/task/util';
import { apiRoutePatterns } from '@/lib/api/server-util';

export async function GET(request: Request) {
  return apiRoutePatterns.get(
    async (searchParams) => {
      const courseId = searchParams.get('courseId')!;
      return await db.select().from(tasks).where(eq(tasks.courseId, courseId)).orderBy(tasks.week);
    },
    'Error fetching drafts',
    ['courseId']
  )(request);
}

export async function POST(request: Request) {
  return apiRoutePatterns.post(
    async (data: Task & { courseId: string }) => {
      const { courseId, ...taskData } = data;
      
      // NOTE: Untrusted data source, don't use spread operator
      const [draft] = await db.insert(tasks).values({
        courseId,
        title: taskData.title,
        week: taskData.week,
        notes: taskData.notes,
        type: taskData.type,
        estimatedEffort: taskData.estimatedEffort,
        status: TaskStatus.DRAFT,
        subtasks: taskData.subtasks?.map(({ status, ...subtask }) => ({
          ...subtask,
          id: crypto.randomUUID(),
          status: status ?? TaskStatus.DRAFT
        })),
        dueDate: calculateTaskDueDate(taskData.week)
      }).returning();
      
      return draft;
    },
    'Error creating draft',
    ['courseId', 'title', 'week']
  )(request);
}

export async function PATCH(request: Request) {
  return apiRoutePatterns.patch(
    async (id: string, updates: Partial<Task>) => {
      const [draft] = await db.update(tasks)
        .set({
          ...updates,
          status: updates.status ?? TaskStatus.DRAFT,
          subtasks: updates.subtasks?.map(({ status, ...subtask }) => ({
            ...subtask,
            id: crypto.randomUUID(),
            status: status ?? TaskStatus.TODO
          }))
        })
        .where(eq(tasks.id, id))
        .returning();
      
      return draft;
    },
    'Error updating draft'
  )(request);
}

export async function DELETE(request: Request) {
  return apiRoutePatterns.delete(
    async (id: string) => {
      await db.delete(tasks).where(eq(tasks.id, id));
      return { success: true };
    },
    'Error deleting draft'
  )(request);
}