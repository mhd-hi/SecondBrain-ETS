import { db } from '@/server/db';
import { courses } from '@/server/db/schema';
import { eq } from 'drizzle-orm';
import { apiRoutePatterns, withErrorHandling, successResponse } from '@/lib/api/server-util';
import { generateRandomCourseColor } from '@/lib/utils';

export const GET = withErrorHandling(async () => {
  // Fetch all courses and their associated tasks
  const coursesWithTasks = await db.query.courses.findMany({
    with: {
      tasks: true, // Include all tasks related to the course
    },
  });

  return successResponse(coursesWithTasks);
}, 'Error fetching courses');

export const POST = apiRoutePatterns.post(
  async (data: { code: string; name: string }) => {
    const { code, name } = data;
    
    // Check if course already exists
    const existingCourse = await db.select().from(courses).where(eq(courses.code, code));

    if (existingCourse.length > 0) {
      // Return the existing course instead of throwing an error
      return existingCourse[0];
    }    const [course] = await db.insert(courses).values({
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