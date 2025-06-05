import { NextResponse } from 'next/server';
import { db } from '@/server/db';
import { tasks, courses } from '@/server/db/schema';
import { eq, sql } from 'drizzle-orm';
import { TaskStatus } from '@/types/task';

export async function GET() {
  try {
    // Fetch all courses and their associated tasks
    const coursesWithTasks = await db.query.courses.findMany({
      with: {
        tasks: true, // Include all tasks related to the course
      },
    });

    // The fetched data will already be in the desired structure based on the schema relations
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

export async function getCoursesWithInProgressCount() {
  try {
    const coursesWithCounts = await db
      .select({
        id: courses.id,
        code: courses.code,
        inProgressCount: sql<number>`count(*) filter (where ${tasks.status} = ${TaskStatus.IN_PROGRESS})`,
      })
      .from(courses)
      .leftJoin(tasks, eq(courses.id, tasks.courseId))
      .groupBy(courses.id, courses.code);

    return NextResponse.json(coursesWithCounts);
  } catch (error) {
    console.error('Error fetching courses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch courses' },
      { status: 500 }
    );
  }
} 