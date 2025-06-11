import { NextResponse } from 'next/server';
import { withAuthSimple } from '@/lib/auth/api';
import { getUserCourses } from '@/lib/auth/db';
import { assertValidCourseCode } from '@/lib/course/util';

export const GET = withAuthSimple(
  async (request, user) => {
    const { searchParams } = new URL(request.url);
    const courseCode = searchParams.get('code');

    if (!courseCode) {
      return NextResponse.json(
        { error: 'code parameter is required', code: 'MISSING_PARAMETER' },
        { status: 400 },
      );
    } // Validate course code format
    let cleanCode: string;
    try {
      cleanCode = assertValidCourseCode(courseCode, 'Invalid course code format');
    } catch (error) {
      return NextResponse.json(
        { error: error instanceof Error ? error.message : 'Invalid course code format', code: 'INVALID_FORMAT' },
        { status: 400 },
      );
    }

    // Check if course exists for this user only
    const userCourses = await getUserCourses(user.id);
    const existingCourse = userCourses.find(course =>
      course.code.toLowerCase() === cleanCode.toLowerCase(),
    );

    return NextResponse.json({
      exists: !!existingCourse,
      course: existingCourse
        ? {
          id: existingCourse.id,
          code: existingCourse.code,
          name: existingCourse.name,
        }
        : null,
    });
  },
);
