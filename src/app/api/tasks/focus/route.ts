import type { Subtask } from '@/types/subtask';
import type { Task } from '@/types/task';
import type { TaskStatus } from '@/types/task-status';
import { and, eq, gte, inArray, lt, ne, or } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { withAuthSimple } from '@/lib/auth/api';
import { db } from '@/server/db';
import { courses, subtasks, tasks } from '@/server/db/schema';

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
            ne(tasks.status, 'COMPLETED'),
          ),
          // Tasks due within filter range that are actionable (IN_PROGRESS or TODO)
          and(
            gte(tasks.dueDate, now),
            lt(tasks.dueDate, endDate),
            or(
              eq(tasks.status, 'IN_PROGRESS'),
              eq(tasks.status, 'TODO'),
            ),
          ),
        ),
      ),
    ).leftJoin(courses, eq(tasks.courseId, courses.id));

    const taskIds = results.map(r => r.tasks.id);

    const subsByTask: Record<string, Subtask[]> = {};
    if (taskIds.length > 0) {
      const subs = await db.select().from(subtasks).where(inArray(subtasks.taskId, taskIds));
      for (const s of subs) {
        if (!subsByTask[s.taskId]) {
          subsByTask[s.taskId] = [];
        }
        subsByTask[s.taskId]!.push(s as unknown as Subtask);
      }
    }

    const tasksData: Task[] = results.map(row => ({
      ...row.tasks,
      course: row.courses ?? undefined,
      status: row.tasks.status as TaskStatus,
      subtasks: subsByTask[row.tasks.id] ?? [],
      notes: row.tasks.notes ?? undefined,
    }));

    return NextResponse.json(tasksData);
  },
);
