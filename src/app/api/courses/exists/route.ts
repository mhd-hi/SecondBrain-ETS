import { NextResponse } from 'next/server';
import { withAuthSimple } from '@/lib/auth/api';
import { courseExists } from '@/lib/utils/course/queries';

export const GET = withAuthSimple(async (request, user) => {
  try {
    const url = new URL(request.url);
    const code = url.searchParams.get('code')?.trim();
    const term = url.searchParams.get('term')?.trim();

    if (!code || !term) {
      return NextResponse.json(
        { error: 'code and term are required', code: 'MISSING_PARAMS' },
        { status: 400 },
      );
    }

    // Use centralized helper to check existence
    const result = await courseExists(user.id, code, term);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in courses/exists:', error);
    try {
      console.error((error as Error).stack);
      // eslint-disable-next-line unused-imports/no-unused-vars
    } catch (_) { }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});
