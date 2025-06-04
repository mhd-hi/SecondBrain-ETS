import { NextResponse } from 'next/server';
import { parseCoursePlan } from '~/lib/course-plan-parser';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const courseCode = searchParams.get('courseCode');
  const term = searchParams.get('term');

  if (!courseCode || !term) {
    return NextResponse.json(
      { error: 'Missing required parameters: courseCode and term' },
      { status: 400 },
    );
  }

  try {
    const result = await parseCoursePlan(courseCode, term);
    return NextResponse.json({
      ...result,
      logs: result.logs,
    });
  } catch (error) {
    console.error('Error parsing course plan:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        logs: [], // Include empty logs array even in error case
      },
      { status: 500 },
    );
  }
} 