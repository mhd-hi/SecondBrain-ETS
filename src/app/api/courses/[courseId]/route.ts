import { NextResponse } from 'next/server';
import { db } from '@/server/db';
import { courses, tasks } from '@/server/db/schema';
import { eq, and } from 'drizzle-orm';
import { withErrorHandling, successResponse } from '@/lib/api/server-util';
import { auth } from '@/server/auth';

export const GET = withErrorHandling(
  async (request: Request, context: { params: Promise<{ courseId: string }> }) => {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { courseId } = await context.params;
    const course = await db
      .select()
      .from(courses)
      .where(and(eq(courses.id, courseId), eq(courses.userId, session.user.id)))
      .limit(1);

    if (!course.length) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }

    const courseTasks = await db
      .select()
      .from(tasks)
      .where(and(eq(tasks.courseId, courseId), eq(tasks.userId, session.user.id)));

    return successResponse({
      ...course[0],
      tasks: courseTasks,
    });
  },
  'Error fetching course'
);

export const DELETE = withErrorHandling(
  async (request: Request, context: { params: Promise<{ courseId: string }> }) => {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { courseId } = await context.params;

    if (!courseId) {
      return NextResponse.json(
        { error: 'Course ID is required' },
        { status: 400 }
      );
    }

    // Delete the course from the database (only if it belongs to the user)
    const deletedCourses = await db.delete(courses)
      .where(and(eq(courses.id, courseId), eq(courses.userId, session.user.id)))
      .returning();

    if (deletedCourses.length === 0) {
       return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }

    return successResponse({ success: true });
  },
  'Error deleting course'
);