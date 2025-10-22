import type { TCourseColor } from '@/types/colors';
import type { Daypart } from '@/types/course';
import { and, eq } from 'drizzle-orm';
import { AuthenticationError, AuthorizationError, withAuth } from '@/lib/auth/api';
import { deleteUserCourse, getUserCourse, getUserCourseTasks } from '@/lib/auth/db';
import { statusResponse } from '@/lib/utils/api/api-server-util';
import { db } from '@/server/db';
import { courses } from '@/server/db/schema';

export const GET = withAuth<{ courseId: string }>(
  async (request, { params, user }) => {
    try {
      const { courseId } = await params;

      // Use secure functions with automatic ownership verification
      const course = await getUserCourse(courseId, user.id);
      const courseTasks = await getUserCourseTasks(courseId, user.id);

      return statusResponse({
        ...course,
        tasks: courseTasks,
      });
    } catch (error) {
      console.error('Error in GET /api/courses/[courseId]:', error);
      if (error instanceof AuthorizationError) {
        return statusResponse({ error: error.message }, 403);
      }
      if (error instanceof AuthenticationError) {
        return statusResponse({ error: error.message }, 401);
      }
      return statusResponse({ error: (error as Error).message ?? 'Internal server error' }, 500);
    }
  },
);

export const PATCH = withAuth<{ courseId: string }>(
  async (request, { params, user }) => {
    try {
      const { courseId } = await params;
      const body = await request.json();
      const { color, daypart } = body;
      // Require at least one updatable field
      if (!color && !daypart) {
        return statusResponse({ error: 'Missing color or daypart' }, 400);
      }

      // Build the update object conditionally
      const updatePayload: Partial<{ color: TCourseColor; daypart: Daypart }> = {};
      if (color) {
        updatePayload.color = color;
      }
      if (daypart) {
        updatePayload.daypart = daypart;
      }

      const result = await db.update(courses)
        .set({
          ...(updatePayload.color ? { color: updatePayload.color } : {}),
          ...(updatePayload.daypart ? { daypart: updatePayload.daypart } : {}),
        })
        .where(and(eq(courses.id, courseId), eq(courses.userId, user.id)))
        .returning();
      if (!result.length) {
        return statusResponse({ error: 'Course not found or access denied' }, 404);
      }
      return statusResponse(result[0]);
    } catch (error) {
      console.error('Error: ', error);
      if (error instanceof AuthorizationError) {
        return statusResponse({ error: error.message }, 403);
      }
      if (error instanceof AuthenticationError) {
        return statusResponse({ error: error.message }, 401);
      }
      return statusResponse({ error: (error as Error).message ?? 'Internal server error' }, 500);
    }
  },
);

export const DELETE = withAuth<{ courseId: string }>(
  async (request, { params, user }) => {
    try {
      const { courseId } = await params;

      // Use secure delete function with automatic ownership verification
      await deleteUserCourse(courseId, user.id);

      return statusResponse({ success: true });
    } catch (error) {
      console.error('Error in DELETE /api/courses/[courseId]:', error);
      if (error instanceof AuthorizationError) {
        return statusResponse({ error: error.message }, 403);
      }
      if (error instanceof AuthenticationError) {
        return statusResponse({ error: error.message }, 401);
      }
      return statusResponse({ error: (error as Error).message ?? 'Internal server error' }, 500);
    }
  },
);
