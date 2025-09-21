import { and, eq } from 'drizzle-orm';
import { withAuth } from '@/lib/auth/api';
import { deleteUserCourse, getUserCourse, getUserCourseTasks } from '@/lib/auth/db';
import { successResponse } from '@/lib/utils/api/api-util';
import { db } from '@/server/db';
import { courses } from '@/server/db/schema';

export const GET = withAuth<{ courseId: string }>(
  async (request, { params, user }) => {
    const { courseId } = await params;

    // Use secure functions with automatic ownership verification
    const course = await getUserCourse(courseId, user.id);
    const courseTasks = await getUserCourseTasks(courseId, user.id);

    return successResponse({
      ...course,
      tasks: courseTasks,
    });
  },
);

export const PATCH = withAuth<{ courseId: string }>(
  async (request, { params, user }) => {
    const { courseId } = await params;
    const body = await request.json();
    const { color } = body;
    if (!color) {
      return successResponse({ error: 'Missing color' }, 400);
    }
    // Update course color with ownership verification
    const result = await db.update(courses)
      .set({ color })
      .where(and(eq(courses.id, courseId), eq(courses.userId, user.id)))
      .returning();
    if (!result.length) {
      return successResponse({ error: 'Course not found or access denied' }, 404);
    }
    return successResponse(result[0]);
  },
);

export const DELETE = withAuth<{ courseId: string }>(
  async (request, { params, user }) => {
    const { courseId } = await params;

    // Use secure delete function with automatic ownership verification
    await deleteUserCourse(courseId, user.id);

    return successResponse({ success: true });
  },
);
