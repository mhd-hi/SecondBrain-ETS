import { successResponse } from '@/lib/api/server-util';
import { withAuth } from '@/lib/auth/api';
import { deleteUserCourse, getUserCourse, getUserCourseTasks } from '@/lib/auth/db';

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

export const DELETE = withAuth<{ courseId: string }>(
  async (request, { params, user }) => {
    const { courseId } = await params;

    // Use secure delete function with automatic ownership verification
    await deleteUserCourse(courseId, user.id);

    return successResponse({ success: true });
  },
);
