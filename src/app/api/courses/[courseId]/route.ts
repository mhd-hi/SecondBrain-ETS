import { NextResponse } from 'next/server';
import { db } from '@/server/db';
import { courses, tasks } from '@/server/db/schema';
import { eq } from 'drizzle-orm';
import { withErrorHandling, successResponse } from '@/lib/api/server-util';

export const GET = withErrorHandling(
  async (request: Request, context: { params: Promise<{ courseId: string }> }) => {
    const { courseId } = await context.params;
    const course = await db
      .select()
      .from(courses)
      .where(eq(courses.id, courseId))
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
      .where(eq(tasks.courseId, courseId));

    return successResponse({
      ...course[0],
      tasks: courseTasks,
    });
  },
  'Error fetching course'
);

export const DELETE = withErrorHandling(
  async (request: Request, context: { params: Promise<{ courseId: string }> }) => {
    const { courseId } = await context.params;

    if (!courseId) {
      return NextResponse.json(
        { error: 'Course ID is required' },
        { status: 400 }
      );
    }

    // Delete the course from the database
    const deletedCourses = await db.delete(courses)
      .where(eq(courses.id, courseId))
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