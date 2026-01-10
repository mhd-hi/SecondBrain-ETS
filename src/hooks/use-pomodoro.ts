import type { PomodoroType } from '@/types/pomodoro';
import type { Task } from '@/types/task';
import { useCallback } from 'react';
import { usePomodoroStore } from '@/lib/stores/pomodoro-store';

export function usePomodoroOperations() {
    const store = usePomodoroStore();

    const startPomodoro = useCallback(
        (task: Task | null, duration?: number, autoStart = false) => {
            store.startPomodoro(task, duration, autoStart);
        },
        [store],
    );

    const toggleTimer = useCallback(() => {
        store.toggleTimer();
    }, [store]);

    const stopPomodoro = useCallback(() => {
        store.stopPomodoro();
    }, [store]);

    const addFiveMinutes = useCallback(() => {
        store.addFiveMinutes();
    }, [store]);

    const switchToPomodoroType = useCallback(
        (type: PomodoroType) => {
            store.switchToPomodoroType(type);
        },
        [store],
    );

    const updateDuration = useCallback(
        (duration: number) => {
            store.updateDuration(duration);
        },
        [store],
    );

    const fetchStreak = useCallback(async () => {
        await store.fetchStreak();
    }, [store]);

    return {
        startPomodoro,
        toggleTimer,
        stopPomodoro,
        addFiveMinutes,
        switchToPomodoroType,
        updateDuration,
        fetchStreak,

        currentTask: store.currentTask,
        pomodoroType: store.pomodoroType,
        isPomodoroActive: store.isPomodoroActive,
        isRunning: store.isRunning,
        timeLeftSec: store.timeLeftSec,
        totalTimeSec: store.totalTimeSec,
        sessionDurations: store.sessionDurations,
        streak: store.streak,
        currentDuration: store.sessionDurations[store.pomodoroType],
    };
}

export { usePomodoroStore };
