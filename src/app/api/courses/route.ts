import { db } from '@/server/db';
import { tasks, courses } from '@/server/db/schema';
import { eq, sql } from 'drizzle-orm';
import { TaskStatus } from '@/types/task';
import { apiRoutePatterns, withErrorHandling, successResponse } from '@/lib/api/server-util';

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
      throw new Error('Course already exists');
    }

    const [course] = await db.insert(courses).values({
      code,
      name,
      term: '20252', // Default term
    }).returning();

    return course;
  },
  'Error creating course',
  ['code', 'name']
);

export const getCoursesWithInProgressCount = withErrorHandling(async () => {
  const coursesWithCounts = await db
    .select({
      id: courses.id,
      code: courses.code,
      inProgressCount: sql<number>`count(*) filter (where ${tasks.status} = ${TaskStatus.IN_PROGRESS})`,
    })
    .from(courses)
    .leftJoin(tasks, eq(courses.id, tasks.courseId))
    .groupBy(courses.id, courses.code);

  return successResponse(coursesWithCounts);
}, 'Error fetching courses');