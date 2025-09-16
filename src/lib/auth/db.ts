import type { SQL } from 'drizzle-orm';
import { and, eq, inArray } from 'drizzle-orm';
import { AuthorizationError } from '@/lib/auth/api';
import { db } from '@/server/db';
import { courses, subtasks, tasks } from '@/server/db/schema';

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

  const rows = await db
    .select()
    .from(tasks)
    .where(and(eq(tasks.courseId, courseId), eq(tasks.userId, userId)))
    .orderBy(tasks.week);
  // Fetch subtasks for these tasks and attach
  const taskIds = rows.map(r => r.id);
  if (taskIds.length === 0) {
    return rows;
  }

  const subs = await db.select().from(subtasks).where(inArray(subtasks.taskId, taskIds));

  // Map subtasks to their task id
  const subsByTask: Record<string, any[]> = {};
  for (const s of subs) {
    const key = s.taskId;
    subsByTask[key] = subsByTask[key] || [];
    subsByTask[key].push(s);
  }

  // Attach
  return rows.map(r => ({
    ...r,
    subtasks: subsByTask[r.id] ?? [],
  }));
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

  const t = task[0]!;
  // Attach subtasks
  const subs = await db.select().from(subtasks).where(eq(subtasks.taskId, t.id));
  return { ...t, subtasks: subs };
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
  // If updates include subtasks, handle them separately
  const { subtasks: subUpdates, ...taskUpdates } = updates as any;

  const result = await db
    .update(tasks)
    .set({
      ...taskUpdates,
      updatedAt: new Date(),
    })
    .where(and(eq(tasks.id, taskId), eq(tasks.userId, userId)))
    .returning();

  if (!result.length) {
    throw new AuthorizationError('Task not found or access denied');
  }

  // Process subtasks updates: upsert by id, delete missing ones if provided as full set
  if (Array.isArray(subUpdates)) {
    // Fetch existing subtask ids for this task
    const existing = await db.select().from(subtasks).where(eq(subtasks.taskId, taskId));
    const existingIds = new Set(existing.map(e => e.id));

    // Upsert provided subtasks
    for (const s of subUpdates) {
      if (!s.id) {
        // insert
        await db.insert(subtasks).values({
          ...s,
          id: crypto.randomUUID(),
          taskId,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      } else {
        // update
        await db.update(subtasks).set({
          ...s,
          updatedAt: new Date(),
        }).where(eq(subtasks.id, s.id));
        existingIds.delete(s.id);
      }
    }

    // Delete any existing subtasks not present in the provided list
    for (const idToDelete of existingIds) {
      await db.delete(subtasks).where(eq(subtasks.id, idToDelete));
    }
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

  const { subtasks: providedSubs, ...taskFields } = taskData as any;

  const result = await db
    .insert(tasks)
    .values({
      ...taskFields,
      userId,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .returning();

  const createdTask = result[0]!;

  // Insert provided subtasks
  if (Array.isArray(providedSubs) && providedSubs.length > 0) {
    for (const s of providedSubs) {
      await db.insert(subtasks).values({
        ...s,
        id: s.id ?? crypto.randomUUID(),
        taskId: createdTask.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
  }

  return createdTask;
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
