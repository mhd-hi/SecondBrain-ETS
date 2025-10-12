import type { Task } from '@/types/task';

export const completePomodoroSession = async (durationHours: number, taskId?: string): Promise<{
    success: boolean;
    sessionType: 'task' | 'free';
    taskUpdated?: Task | null;
}> => {
    const response = await fetch('/api/pomodoro/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            durationHours,
            taskId, // Always send taskId (can be undefined)
        }),
    });

    if (!response.ok) {
        const errorData = await response.json() as { message?: string };
        throw new Error(errorData.message ?? 'Failed to complete Pomodoro');
    }

    const result = await response.json() as {
        success: boolean;
        sessionType: 'task' | 'free';
        taskUpdated?: Task | null;
    };

    return result;
};

export const fetchPomodoroStreak = async (): Promise<number> => {
    try {
        const response = await fetch('/api/pomodoro/streak');

        if (!response.ok) {
            // If user is unauthenticated or forbidden, just return 0 silently
            if (response.status === 401 || response.status === 403) {
                return 0;
            }

            // Attempt to read the response body for debugging, but don't throw ambiguous errors
            let body: unknown;
            try {
                body = await response.json();
            } catch {
                try {
                    body = await response.text();
                } catch {
                    body = undefined;
                }
            }

            throw new Error(`Failed to fetch streak: ${response.status} ${response.statusText}${body ? ` - ${JSON.stringify(body)}` : ''}`);
        }

        const data = await response.json() as { streakDays?: number } | null;
        return (data && typeof data.streakDays === 'number') ? data.streakDays : 0;
    } catch (error) {
        // Network errors or other unexpected issues: log and return 0 to avoid noisy exceptions
        console.error('Error fetching pomodoro streak (client):', error);
        return 0;
    }
};
