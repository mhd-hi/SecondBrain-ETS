import type { Subtask, Task, TaskStatus } from '@/types/task';
import { and, eq, gte, lt, ne, or } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { withAuthSimple } from '@/lib/auth/api';
import { db } from '@/server/db';
import { courses, tasks } from '@/server/db/schema';

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
    // 1. Overdue (due date < today) and not completed and not draft OR
    // 2. Due within the selected time range AND are actionable (IN_PROGRESS or TODO)
    // AND belong to the current user
    const results = await db.select().from(tasks).where(
      and(
        eq(tasks.userId, user.id), // Filter by current user
        or(
          // Overdue tasks (not completed and not draft)
          and(
            lt(tasks.dueDate, now),
            ne(tasks.status, 'COMPLETED'),
            ne(tasks.status, 'DRAFT'),
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

    const tasksData: Task[] = results.map(row => ({
      ...row.tasks,
      course: row.courses ?? undefined,
      status: row.tasks.status as TaskStatus,
      subtasks: row.tasks.subtasks as Subtask[] | undefined,
      notes: row.tasks.notes ?? undefined,
    }));

    return NextResponse.json(tasksData);
  },
);
