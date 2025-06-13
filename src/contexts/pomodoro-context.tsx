'use client';

import type { ReactNode } from 'react';
import type { PomodoroContextType, SessionType } from '@/types/pomodoro';
import type { Task } from '@/types/task';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import { PomodoroDialog } from '@/components/Boards/FocusSession/PomodoroDialog';
import { PomodoroMiniTimer } from '@/components/PomodoroMiniTimer';
import { playCompletionSound } from '@/lib/audio/util';
import { PomodoroContext } from '@/types/pomodoro';

const PREFFERED_POMODORO_DURATION = 25;
const SHORT_BREAK_DURATION = 5;
const LONG_BREAK_DURATION = 20;
const POMODOROS_BEFORE_LONG_BREAK = 4;

type PomodoroProviderProps = {
  children: ReactNode;
};

export function PomodoroProvider({ children }: PomodoroProviderProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentTask, setCurrentTask] = useState<Task | null>(null);
  const [streak, setStreak] = useState(0);
  const [duration, setDuration] = useState(PREFFERED_POMODORO_DURATION);

  // Persistent timer state
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [timeLeftSec, setTimeLeftSec] = useState(0);
  const [totalTimeSec, setTotalTimeSec] = useState(0);
  const [sessionType, setSessionType] = useState<SessionType>('work');
  const [completedPomodoros, setCompletedPomodoros] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const getSessionDuration = useCallback((type: SessionType) => {
    switch (type) {
      case 'work':
        return duration;
      case 'shortBreak':
        return SHORT_BREAK_DURATION;
      case 'longBreak':
        return LONG_BREAK_DURATION;
    }
  }, [duration]);

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

  const switchToNextSession = useCallback(() => {
    if (sessionType === 'work') {
      const newCompletedPomodoros = completedPomodoros + 1;
      setCompletedPomodoros(newCompletedPomodoros);

      const nextSessionType
        = newCompletedPomodoros % POMODOROS_BEFORE_LONG_BREAK === 0
          ? 'longBreak'
          : 'shortBreak';

      setSessionType(nextSessionType);
      const newDuration = getSessionDuration(nextSessionType) * 60;
      setTimeLeftSec(newDuration);
      setTotalTimeSec(newDuration);
    } else {
      setSessionType('work');
      const newDuration = duration * 60;
      setTimeLeftSec(newDuration);
      setTotalTimeSec(newDuration);
    }
    setIsRunning(false);
  }, [sessionType, completedPomodoros, getSessionDuration, duration]);
  // Timer logic
  useEffect(() => {
    if (isRunning && isSessionActive && timeLeftSec > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeftSec((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isRunning, isSessionActive, timeLeftSec]);

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

  const startPomodoro = useCallback((task: Task | null, sessionDuration?: number, autoStart = false) => {
    setCurrentTask(task);
    if (sessionDuration) {
      setDuration(sessionDuration);
    }

    // Initialize session
    const durationInSeconds = (sessionDuration || duration) * 60;
    setTimeLeftSec(durationInSeconds);
    setTotalTimeSec(durationInSeconds);
    setSessionType('work');
    setCompletedPomodoros(0);
    setIsSessionActive(true);
    setIsRunning(autoStart);
    setIsDialogOpen(true);
  }, [duration]);

  const toggleTimer = useCallback(() => {
    setIsRunning(!isRunning);
  }, [isRunning]);

  const stopSession = useCallback(() => {
    setIsRunning(false);
    setIsSessionActive(false);
    setCurrentTask(null);
    setIsDialogOpen(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const addFiveMinutes = useCallback(() => {
    setTimeLeftSec(prev => prev + 5 * 60);
    setTotalTimeSec(prev => prev + 5 * 60);
    setDuration(duration + 5);
  }, [duration]);

  const openDialog = useCallback(() => {
    setIsDialogOpen(true);
  }, []);
  const handleDialogClose = useCallback(() => {
    setIsDialogOpen(false);
    // Don't reset session if it's active - this allows persistence
  }, []);

  // Handle auto-completion when timer reaches 0
  useEffect(() => {
    if (timeLeftSec === 0 && isSessionActive && totalTimeSec > 0) {
      const timer = setTimeout(() => {
        playCompletionSound();

        if (sessionType === 'work') {
          const completedMinutes = totalTimeSec / 60;
          const durationHours = completedMinutes / 60;
          handlePomodoroComplete(durationHours);
        }

        switchToNextSession();
      }, 0);

      return () => clearTimeout(timer);
    }
  }, [timeLeftSec, isSessionActive, totalTimeSec, sessionType, handlePomodoroComplete, switchToNextSession]);

  const value: PomodoroContextType = useMemo(() => ({
    startPomodoro,
    isDialogOpen,
    currentTask,
    streak,
    duration,
    setDuration,
    isSessionActive,
    isRunning,
    timeLeftSec,
    totalTimeSec,
    sessionType,
    completedPomodoros,
    toggleTimer,
    stopSession,
    addFiveMinutes,
    switchToNextSession,
    openDialog,
  }), [
    startPomodoro,
    isDialogOpen,
    currentTask,
    streak,
    duration,
    setDuration,
    isSessionActive,
    isRunning,
    timeLeftSec,
    totalTimeSec,
    sessionType,
    completedPomodoros,
    toggleTimer,
    stopSession,
    addFiveMinutes,
    switchToNextSession,
    openDialog,
  ]);
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
      <PomodoroMiniTimer />
    </PomodoroContext>
  );
}
