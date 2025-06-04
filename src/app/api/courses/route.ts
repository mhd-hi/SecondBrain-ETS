import { NextResponse } from 'next/server';
import { db } from '@/server/db';
import { courses, tasks } from '@/server/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');

    if (code) {
      // Fetch specific course by code
      const course = await db
        .select()
        .from(courses)
        .where(eq(courses.code, code))
        .limit(1);

      if (!course.length) {
        return NextResponse.json(
          { error: 'Course not found' },
          { status: 404 }
        );
      }

      const existingCourse = course[0]!;
      const courseTasks = await db
        .select()
        .from(tasks)
        .where(eq(tasks.courseId, existingCourse.id));

      return NextResponse.json([{
        ...existingCourse,
        tasks: courseTasks || [],
      }]);
    }

    // Fetch all courses
    const allCourses = await db.select().from(courses);
    console.log('Raw courses from DB:', allCourses);

    const coursesWithTasks = await Promise.all(
      allCourses.map(async (course) => {
        const courseTasks = await db
          .select()
          .from(tasks)
          .where(eq(tasks.courseId, course.id));
        return {
          ...course,
          tasks: courseTasks || [],
        };
      })
    );

    console.log('Courses with tasks:', coursesWithTasks);
    return NextResponse.json(coursesWithTasks);
  } catch (error) {
    console.error('Error fetching courses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch courses' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { code, name } = await request.json() as { code: string; name: string; };
    
    // Check if course already exists
    const existingCourse = await db.select().from(courses).where(eq(courses.code, code));

    if (existingCourse.length > 0) {
      return NextResponse.json(
        { error: 'Course already exists' },
        { status: 400 }
      );
    }

    const [course] = await db.insert(courses).values({
      code,
      name,
      term: '20252', // Default term
    }).returning();

    return NextResponse.json(course);
  } catch (error) {
    console.error('Error creating course:', error);
    return NextResponse.json(
      { error: 'Failed to create course' },
      { status: 500 }
    );
  }
} 