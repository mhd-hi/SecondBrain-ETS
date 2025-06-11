'use client';

import type { ReactNode } from 'react';
import type { PomodoroContextType } from './pomodoro-types';
import type { Task } from '@/types/task';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { PomodoroDialog } from '@/components/Boards/FocusSession/PomodoroDialog';
import { PomodoroContext } from './pomodoro-types';

const PREFFERED_POMODORO_DURATION = 25;

type PomodoroProviderProps = {
  children: ReactNode;
};

export function PomodoroProvider({ children }: PomodoroProviderProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentTask, setCurrentTask] = useState<Task | null>(null);
  const [streak, setStreak] = useState(0);
  const [duration, setDuration] = useState(PREFFERED_POMODORO_DURATION);

  // Fetch user streak on mount
  useEffect(() => {
    const fetchStreak = async () => {
      try {
        const streakResponse = await fetch('/api/pomodoro/streak');
        if (streakResponse.ok) {
          const streakData = await streakResponse.json() as { streakDays: number };
          setStreak(streakData.streakDays ?? 0);
        }
      } catch (error) {
        console.error('Failed to fetch streak:', error);
      }
    };

    void fetchStreak();
  }, []);

  const startPomodoro = useCallback((task: Task | null, sessionDuration?: number) => {
    setCurrentTask(task);
    if (sessionDuration) {
      setDuration(sessionDuration);
    }
    setIsDialogOpen(true);
  }, []);

  const handlePomodoroComplete = useCallback(async (durationHours: number) => {
    try {
      if (currentTask) {
        // If there's a task, update it
        const response = await fetch('/api/pomodoro/complete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            taskId: currentTask.id,
            durationHours,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json() as { message?: string };
          throw new Error(errorData.message ?? 'Failed to complete Pomodoro');
        }

        const result = await response.json() as {
          success: boolean;
          newStreakDays: number;
          taskUpdated: { id: string; actualEffort: number };
        };

        setStreak(result.newStreakDays);
        toast.success(`Pomodoro completed! ${(durationHours * 60).toFixed(0)} minutes added to task.`);
      } else {
        // Free focus session - just update streak
        const response = await fetch('/api/pomodoro/complete-free', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            durationHours,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json() as { message?: string };
          throw new Error(errorData.message ?? 'Failed to complete Pomodoro');
        }

        const result = await response.json() as {
          success: boolean;
          newStreakDays: number;
        };

        setStreak(result.newStreakDays);
        toast.success(`Focus session completed! ${(durationHours * 60).toFixed(0)} minutes of focused work.`);
      }
    } catch (error) {
      console.error('Failed to complete Pomodoro:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to complete Pomodoro');
    }
  }, [currentTask]);

  const handleDialogClose = useCallback(() => {
    setIsDialogOpen(false);
    setCurrentTask(null);
  }, []);

  const value: PomodoroContextType = useMemo(() => ({
    startPomodoro,
    isDialogOpen,
    currentTask,
    streak,
    duration,
    setDuration,
  }), [startPomodoro, isDialogOpen, currentTask, streak, duration, setDuration]);

  return (
    <PomodoroContext value={value}>
      {children}
      <PomodoroDialog
        isOpen={isDialogOpen}
        onClose={handleDialogClose}
        taskTitle={currentTask?.title ?? ''}
        streak={streak}
        duration={duration}
        setDuration={setDuration}
        onComplete={handlePomodoroComplete}
      />
    </PomodoroContext>
  );
}
