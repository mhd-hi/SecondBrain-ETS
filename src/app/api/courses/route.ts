import { withAuthSimple } from '@/lib/auth/api';
import { getUserCourses, createUserCourse } from '@/lib/auth/db';
import { generateRandomCourseColor } from '@/lib/utils';
import { NextResponse } from 'next/server';

export const GET = withAuthSimple(
  async (request, user) => {
    // Use secure query function that automatically filters by user
    const coursesWithTasks = await getUserCourses(user.id);
    return NextResponse.json(coursesWithTasks);
  }
);

export const POST = withAuthSimple(
  async (request, user) => {
    const data = await request.json() as { code: string; name: string };
    
    if (!data.code || !data.name) {
      return NextResponse.json(
        { error: 'code and name are required', code: 'MISSING_FIELDS' },
        { status: 400 }
      );
    }

    const { code, name } = data;
    
    // Check if course already exists for this user
    const existingCourses = await getUserCourses(user.id);
    const existingCourse = existingCourses.find(course => course.code === code);

    if (existingCourse) {
      // Return the existing course instead of throwing an error
      return NextResponse.json(existingCourse);
    }

    // Use secure function to create course with automatic user assignment
    const course = await createUserCourse(user.id, {
      code,
      name,
      term: '20252', // Default term
      color: generateRandomCourseColor(),
    });

    return NextResponse.json(course);
  }
);