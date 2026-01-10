import type { SQL } from 'drizzle-orm';
import { and, eq, inArray } from 'drizzle-orm';
import { AuthorizationError } from '@/lib/auth/api';
import { db } from '@/server/db';
import { courses, subtasks, tasks } from '@/server/db/schema';
import { StatusTask } from '@/types/status-task';

/**
 * Get courses for authenticated user
 */
export async function getUserCourses(userId: string) {
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
      customLinks: {
        columns: {
          id: true,
          url: true,
          title: true,
          type: true,
          imageUrl: true,
          courseId: true,
        },
      },
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
      customLinks: true,
    },
  });

  if (!course) {
    throw new AuthorizationError('Course not found or access denied');
  }

  return course;
}

/**
 * Get tasks for a specific course with user verification
 * Optimized with single query using manual aggregation
 */
export async function getUserCourseTasks(courseId: string, userId: string) {
  // Fetch tasks first
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

  // Fetch all subtasks in one query
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

  // Group subtasks by taskId
  const subtasksByTask = new Map<string, typeof subtaskRows>();
  for (const subtask of subtaskRows) {
    const list = subtasksByTask.get(subtask.taskId) ?? [];
    list.push(subtask);
    subtasksByTask.set(subtask.taskId, list);
  }

  // Combine results
  return taskRows.map(task => ({
    ...task,
    subtasks: subtasksByTask.get(task.id) ?? [],
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
 * Update task with ownership verification
 */
export async function updateUserTask(
  taskId: string,
  userId: string,
  updates: Partial<typeof tasks.$inferInsert>,
) {
  // If updates include subtasks, handle them separately
  type SubUpdate = Partial<typeof subtasks.$inferInsert>;
  type UpdateWithSubs = Partial<typeof tasks.$inferInsert> & { subtasks?: SubUpdate[] };
  const { subtasks: subUpdates, ...taskUpdates } = updates as UpdateWithSubs;

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
      const subToUpsert: Partial<typeof subtasks.$inferInsert> = {
        title: s.title ?? '',
        notes: s.notes ?? null,
        // Narrow status/type into the subtasks insert types
        status: (s.status as unknown as typeof subtasks.$inferInsert['status']) ?? StatusTask.TODO,
        estimatedEffort: typeof s.estimatedEffort === 'number' ? s.estimatedEffort : 0,
        type: (s.type as unknown as typeof subtasks.$inferInsert['type']) ?? 'theorie',
      };

      if (!s.id) {
        // insert
        await db.insert(subtasks).values({
          ...(subToUpsert as typeof subtasks.$inferInsert),
          id: crypto.randomUUID(),
          taskId,
          createdAt: new Date(),
          updatedAt: new Date(),
        } as typeof subtasks.$inferInsert);
      } else {
        // update
        await db.update(subtasks).set({
          ...subToUpsert,
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

  type ProvidedSub = Partial<typeof subtasks.$inferInsert>;
  type CreateTaskWithSubs = Omit<typeof tasks.$inferInsert, 'userId' | 'id' | 'createdAt' | 'updatedAt'> & { subtasks?: ProvidedSub[] };
  const { subtasks: providedSubs, ...taskFields } = taskData as CreateTaskWithSubs;

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
      const subToInsert: typeof subtasks.$inferInsert = {
        title: s.title ?? '',
        notes: s.notes ?? null,
        status: (s.status as unknown as typeof subtasks.$inferInsert['status']) ?? StatusTask.TODO,
        estimatedEffort: typeof s.estimatedEffort === 'number' ? s.estimatedEffort : 0,
        type: (s.type as unknown as typeof subtasks.$inferInsert['type']) ?? 'theorie',
        id: s.id ?? crypto.randomUUID(),
        taskId: createdTask.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as typeof subtasks.$inferInsert;
      await db.insert(subtasks).values(subToInsert);
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
    .orderBy(tasks.dueDate);
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
    .orderBy(tasks.dueDate);
}
