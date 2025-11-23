import type { Subtask } from '@/types/subtask';
import type { Task } from '@/types/task';
import { and, eq, gte, inArray, lt, ne, or } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { withAuthSimple } from '@/lib/auth/api';
import { parseStatusTask } from '@/lib/utils/task/task-util';
import { db } from '@/server/db';
import { courses, subtasks, tasks } from '@/server/db/schema';
import { StatusTask } from '@/types/status-task';

export const GET = withAuthSimple(
  async (request, user) => {
    const { searchParams } = new URL(request.url);
    const filter = searchParams.get('filter') ?? 'week'; // week, month, quarter

    const now = new Date();
    now.setHours(0, 0, 0, 0); // Start of today

    let endDate: Date;

    switch (filter) {
      case 'month':
        endDate = new Date(now);
        endDate.setMonth(now.getMonth() + 1);
        break;
      case 'quarter':
        endDate = new Date(now);
        endDate.setMonth(now.getMonth() + 3);
        break;
      default: // week
        endDate = new Date(now);
        endDate.setDate(now.getDate() + 7);
        break;
    }

    // Fetch tasks that are:
    // 1. Overdue (due date < today) OR
    // 2. Due within the selected time range AND are actionable (IN_PROGRESS or TODO)
    // AND belong to the current user
    const results = await db.select().from(tasks).where(
      and(
        eq(tasks.userId, user.id), // Filter by current user
        or(
          // Overdue tasks (not completed)
          and(
            lt(tasks.dueDate, now),
            ne(tasks.status, StatusTask.COMPLETED),
          ),
          // Tasks due within filter range that are actionable (IN_PROGRESS or TODO)
          and(
            gte(tasks.dueDate, now),
            lt(tasks.dueDate, endDate),
            or(
              eq(tasks.status, StatusTask.IN_PROGRESS),
              eq(tasks.status, StatusTask.TODO),
            ),
          ),
        ),
      ),
    ).innerJoin(courses, eq(tasks.courseId, courses.id));

    const taskIds = results.map(r => r.tasks.id);

    const subsByTask = new Map<string, Subtask[]>();
    if (taskIds.length > 0) {
      const subs = await db.select().from(subtasks).where(inArray(subtasks.taskId, taskIds));
      for (const s of subs as Array<Record<string, unknown>>) {
        const key = String(s.taskId);
        const mapped: Subtask = {
          id: String(s.id),
          title: String(s.title),
          status: parseStatusTask(String(s.status)),
          notes: s.notes == null ? undefined : String(s.notes),
          estimatedEffort: typeof s.estimatedEffort === 'number' ? s.estimatedEffort : 0,
        };
        const list = subsByTask.get(key) ?? [];
        list.push(mapped);
        subsByTask.set(key, list);
      }
    }

    const tasksData: Task[] = results.map(row => ({
      ...row.tasks,
      course: row.courses,
      status: parseStatusTask(String(row.tasks.status)),
      subtasks: subsByTask.get(String(row.tasks.id)) ?? [],
      notes: row.tasks.notes ?? undefined,
    }));

    return NextResponse.json(tasksData);
  },
);
