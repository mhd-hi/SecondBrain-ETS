import { NextResponse } from 'next/server';
import { db } from '@/server/db';
import { courses, tasks } from '@/server/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(
  request: Request,
  context: { params: Promise<{ courseId: string }> }
) {
  try {
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

    return NextResponse.json({
      ...course[0],
      tasks: courseTasks,
    });
  } catch (error) {
    console.error('Error fetching course:', error);
    return NextResponse.json(
      { error: 'Failed to fetch course' },
      { status: 500 }
    );
  }
} 