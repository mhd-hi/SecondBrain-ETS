import { and, eq, inArray } from 'drizzle-orm';
import { db } from '@/server/db';
import { courses, subtasks, tasks } from '@/server/db/schema';

export async function findUserCoursesWithTasks(userId: string) {
  return db.query.courses.findMany({
    where: eq(courses.userId, userId),
    columns: {
      id: true,
      name: true,
      code: true,
      term: true,
      color: true,
      daypart: true,
    },
    with: {
      tasks: {
        columns: {
          id: true,
          courseId: true,
          title: true,
          notes: true,
          type: true,
          status: true,
          estimatedEffort: true,
          actualEffort: true,
          dueDate: true,
        },
      },
    },
  });
}

export async function findCourseByUserCodeTerm(userId: string, code: string, term: string) {
  return db.query.courses.findFirst({
    where: and(eq(courses.userId, userId), eq(courses.code, code), eq(courses.term, term)),
    columns: { id: true, code: true, name: true },
  });
}

export async function courseExists(userId: string, code: string, term: string): Promise<{ exists: boolean }> {
  const found = await findCourseByUserCodeTerm(userId, code, term);
  return { exists: !!found };
}

export async function findCourseByIdAndUser(courseId: string, userId: string) {
  return db.query.courses.findFirst({
    where: and(eq(courses.id, courseId), eq(courses.userId, userId)),
    with: {
      tasks: true,
      customLinks: true,
    },
  });
}

export async function findTasksWithSubtasks(courseId: string, userId: string) {
  const taskRows = await db
    .select({
      id: tasks.id,
      courseId: tasks.courseId,
      title: tasks.title,
      notes: tasks.notes,
      type: tasks.type,
      status: tasks.status,
      estimatedEffort: tasks.estimatedEffort,
      actualEffort: tasks.actualEffort,
      dueDate: tasks.dueDate,
    })
    .from(tasks)
    .where(and(eq(tasks.courseId, courseId), eq(tasks.userId, userId)))
    .orderBy(tasks.dueDate);

  if (taskRows.length === 0) {
    return [];
  }

  const taskIds = taskRows.map(t => t.id);
  const subtaskRows = await db
    .select({
      id: subtasks.id,
      taskId: subtasks.taskId,
      type: subtasks.type,
      title: subtasks.title,
      notes: subtasks.notes,
      status: subtasks.status,
      estimatedEffort: subtasks.estimatedEffort,
      dueDate: subtasks.dueDate,
    })
    .from(subtasks)
    .where(inArray(subtasks.taskId, taskIds));

  const subtasksByTask = new Map<string, typeof subtaskRows>();
  for (const sub of subtaskRows) {
    const list = subtasksByTask.get(sub.taskId) ?? [];
    list.push(sub);
    subtasksByTask.set(sub.taskId, list);
  }

  return taskRows.map(task => ({
    ...task,
    subtasks: subtasksByTask.get(task.id) ?? [],
  }));
}

export default {
  findUserCoursesWithTasks,
  findCourseByUserCodeTerm,
  findCourseByIdAndUser,
  findTasksWithSubtasks,
};
