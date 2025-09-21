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
    const response = await fetch('/api/pomodoro/streak');

    if (!response.ok) {
        throw new Error('Failed to fetch streak');
    }

    const data = await response.json() as { streakDays: number };
    return data.streakDays ?? 0;
};
