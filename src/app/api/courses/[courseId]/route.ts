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

export async function DELETE(
  request: Request,
  context: { params: { courseId: string } }
) {
  try {
    const { courseId } = context.params;

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

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error deleting course:', error);
    return NextResponse.json(
      { error: 'Failed to delete course' },
      { status: 500 }
    );
  }
} 