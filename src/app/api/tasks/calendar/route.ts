import type { NextRequest } from 'next/server';
import type { AuthenticatedUser } from '@/lib/auth/api';
import { NextResponse } from 'next/server';
import { withAuthSimple } from '@/lib/auth/api';
import { getCalendarEvents } from '@/lib/utils/task/queries';

async function handleGetCalendarTasks(
    request: NextRequest,
    user: AuthenticatedUser,
): Promise<NextResponse> {
    const { searchParams } = new URL(request.url);
    const start = searchParams.get('start');
    const end = searchParams.get('end');

    if (!start || !end) {
        return NextResponse.json(
            { error: 'Start and end dates are required' },
            { status: 400 },
        );
    }

    const startDate = new Date(start);
    const endDate = new Date(end);

    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
        return NextResponse.json(
            { error: 'Invalid date format' },
            { status: 400 },
        );
    }

    const tasks = await getCalendarEvents(startDate, endDate, user.id);
    return NextResponse.json(tasks);
}

export const GET = withAuthSimple(handleGetCalendarTasks);
