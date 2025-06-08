import { db } from '@/server/db';
import { courses } from '@/server/db/schema';
import { eq, and } from 'drizzle-orm';
import { apiRoutePatterns, withErrorHandling, successResponse } from '@/lib/api/server-util';
import { generateRandomCourseColor } from '@/lib/utils';
import { auth } from '@/server/auth';
import { NextResponse } from 'next/server';

export const GET = withErrorHandling(async () => {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Fetch courses for the authenticated user only
  const coursesWithTasks = await db.query.courses.findMany({
    where: eq(courses.userId, session.user.id),
    with: {
      tasks: true, // Include all tasks related to the course
    },
  });

  return successResponse(coursesWithTasks);
}, 'Error fetching courses');

export const POST = apiRoutePatterns.post(
  async (data: { code: string; name: string }) => {
    const session = await auth();
    if (!session?.user?.id) {
      throw new Error('Unauthorized');
    }

    const { code, name } = data;
    
    // Check if course already exists for this user
    const existingCourse = await db.select().from(courses).where(
      and(eq(courses.code, code), eq(courses.userId, session.user.id))
    );

    if (existingCourse.length > 0) {
      // Return the existing course instead of throwing an error
      return existingCourse[0];
    }

    const [course] = await db.insert(courses).values({
      userId: session.user.id,
      code,
      name,
      term: '20252', // Default term
      color: generateRandomCourseColor(),
    }).returning();

    return course;
  },
  'Error creating course',
  ['code', 'name']
);