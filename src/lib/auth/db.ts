import type { SQL } from 'drizzle-orm';
import { and, eq } from 'drizzle-orm';
import { AuthorizationError } from '@/lib/auth/api';
import { db } from '@/server/db';
import { courses, tasks } from '@/server/db/schema';

/**
 * Database query utilities with automatic user filtering for security
 */

/**
 * Get courses for authenticated user
 */
export async function getUserCourses(userId: string) {
  return db.query.courses.findMany({
    where: eq(courses.userId, userId),
    with: {
      tasks: true,
    },
  });
}

/**
 * Get single course for authenticated user with ownership verification
 */
export async function getUserCourse(courseId: string, userId: string) {
  const course = await db.query.courses.findFirst({
    where: and(eq(courses.id, courseId), eq(courses.userId, userId)),
    with: {
      tasks: true,
    },
  });

  if (!course) {
    throw new AuthorizationError('Course not found or access denied');
  }

  return course;
}

/**
 * Get tasks for a specific course with user verification
 */
export async function getUserCourseTasks(courseId: string, userId: string) {
  // First verify course ownership
  await getUserCourse(courseId, userId);

  return db
    .select()
    .from(tasks)
    .where(and(eq(tasks.courseId, courseId), eq(tasks.userId, userId)))
    .orderBy(tasks.week);
}

/**
 * Get single task with ownership verification
 */
export async function getUserTask(taskId: string, userId: string) {
  const task = await db
    .select()
    .from(tasks)
    .where(and(eq(tasks.id, taskId), eq(tasks.userId, userId)))
    .limit(1);

  if (!task.length) {
    throw new AuthorizationError('Task not found or access denied');
  }

  return task[0];
}

/**
 * Get tasks with additional filtering (but always include user filter)
 */
export async function getUserTasksWhere(userId: string, additionalWhere?: SQL) {
  const whereClause = additionalWhere
    ? and(eq(tasks.userId, userId), additionalWhere)
    : eq(tasks.userId, userId);

  return db
    .select()
    .from(tasks)
    .where(whereClause)
    .orderBy(tasks.week);
}

/**
 * Update task with ownership verification
 */
export async function updateUserTask(
  taskId: string,
  userId: string,
  updates: Partial<typeof tasks.$inferInsert>,
) {
  const result = await db
    .update(tasks)
    .set({
      ...updates,
      updatedAt: new Date(),
    })
    .where(and(eq(tasks.id, taskId), eq(tasks.userId, userId)))
    .returning();

  if (!result.length) {
    throw new AuthorizationError('Task not found or access denied');
  }

  return result[0];
}

/**
 * Delete task with ownership verification
 */
export async function deleteUserTask(taskId: string, userId: string) {
  const result = await db
    .delete(tasks)
    .where(and(eq(tasks.id, taskId), eq(tasks.userId, userId)))
    .returning();

  if (!result.length) {
    throw new AuthorizationError('Task not found or access denied');
  }

  return result[0];
}

/**
 * Create task with automatic user assignment
 */
export async function createUserTask(
  userId: string,
  taskData: Omit<typeof tasks.$inferInsert, 'userId' | 'id' | 'createdAt' | 'updatedAt'>,
) {
  // Verify course ownership first
  await getUserCourse(taskData.courseId, userId);

  const result = await db
    .insert(tasks)
    .values({
      ...taskData,
      userId,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .returning();

  return result[0];
}

/**
 * Delete course with ownership verification
 */
export async function deleteUserCourse(courseId: string, userId: string) {
  const result = await db
    .delete(courses)
    .where(and(eq(courses.id, courseId), eq(courses.userId, userId)))
    .returning();

  if (!result.length) {
    throw new AuthorizationError('Course not found or access denied');
  }

  return result[0];
}

/**
 * Create course with automatic user assignment
 */
export async function createUserCourse(
  userId: string,
  courseData: Omit<typeof courses.$inferInsert, 'userId' | 'id' | 'createdAt' | 'updatedAt'>,
) {
  const result = await db
    .insert(courses)
    .values({
      ...courseData,
      userId,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .returning();

  return result[0];
}

/**
 * Batch operations with user filtering
 */
export async function batchUpdateUserTasks(
  userId: string,
  updates: Array<{ id: string; data: Partial<typeof tasks.$inferInsert> }>,
) {
  const results = [];

  for (const update of updates) {
    const result = await updateUserTask(update.id, userId, update.data);
    results.push(result);
  }

  return results;
}

/**
 * Complex queries with user filtering built-in
 */
export async function getUserTasksWithCourseInfo(userId: string) {
  return db
    .select({
      task: tasks,
      course: {
        id: courses.id,
        name: courses.name,
        code: courses.code,
        color: courses.color,
      },
    })
    .from(tasks)
    .innerJoin(courses, eq(tasks.courseId, courses.id))
    .where(and(eq(tasks.userId, userId), eq(courses.userId, userId)))
    .orderBy(tasks.week);
}

/**
 * Get tasks for specific date range with user filtering
 */
export async function getUserTasksInDateRange(
  userId: string,
  startDate: Date,
  endDate: Date,
  additionalWhere?: SQL,
) {
  const baseWhere = and(
    eq(tasks.userId, userId),
    eq(courses.userId, userId), // Double verification via join
  );

  const whereClause = additionalWhere
    ? and(baseWhere, additionalWhere)
    : baseWhere;

  return db
    .select()
    .from(tasks)
    .innerJoin(courses, eq(tasks.courseId, courses.id))
    .where(whereClause)
    .orderBy(tasks.week);
}
