'use client';

import type { ReactNode } from 'react';
import type { PomodoroContextType, PomodoroType } from '@/types/pomodoro';
import type { Task } from '@/types/task';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import { playCompletionSound } from '@/lib/audio/util';
import { PomodoroContext } from './pomodoro-context';

const DEFAULT_WORK_DURTION = 25;
const DEFAULT_SHORT_BREAK_DURATION = DEFAULT_WORK_DURTION * 0.2;
const DEFAULT_LONG_BREAK_DURATION = DEFAULT_WORK_DURTION * 0.6;

type SessionDurations = {
  work: number;
  shortBreak: number;
  longBreak: number;
};

type PomodoroProviderProps = {
  children: ReactNode;
};

export function PomodoroProvider({ children }: PomodoroProviderProps) {
  const [currentTask, setCurrentTask] = useState<Task | null>(null);
  const [streak, setStreak] = useState(0);
  const [pomodoroType, setPomodoroType] = useState<PomodoroType>('work');
  const [isPomodoroActive, setIsPomodoroActive] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [timeLeftSec, setTimeLeftSec] = useState(DEFAULT_WORK_DURTION * 60);
  const [totalTimeSec, setTotalTimeSec] = useState(DEFAULT_WORK_DURTION * 60);

  // Track durations for each session type
  const [sessionDurations, setSessionDurations] = useState<SessionDurations>({
    work: DEFAULT_WORK_DURTION,
    shortBreak: DEFAULT_SHORT_BREAK_DURATION,
    longBreak: DEFAULT_LONG_BREAK_DURATION,
  });

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Get current duration based on session type
  const currentDuration = sessionDurations[pomodoroType];

  const handlePomodoroComplete = useCallback(async (durationHours: number) => {
    try {
      const response = await fetch('/api/pomodoro/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          durationHours,
          taskId: currentTask?.id, // Always send taskId (can be undefined)
        }),
      });

      if (!response.ok) {
        const errorData = await response.json() as { message?: string };
        throw new Error(errorData.message ?? 'Failed to complete Pomodoro');
      }

      const result = await response.json() as {
        success: boolean;
        sessionType: 'task' | 'free';
        taskUpdated?: any;
      };

      if (result.sessionType === 'task') {
        toast.success(`Pomodoro completed! ${(durationHours * 60).toFixed(0)} minutes added to task.`);
      } else {
        toast.success(`Focus session completed! ${(durationHours * 60).toFixed(0)} minutes of focused work.`);
      }
    } catch (error) {
      console.error('Failed to complete Pomodoro:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to complete Pomodoro');
    }
  }, [currentTask]);

  const switchToPomodoroType = useCallback((newPomodoroType: PomodoroType) => {
    setPomodoroType(newPomodoroType);

    // Use the stored duration for the new session type
    const duration = sessionDurations[newPomodoroType];
    const durationInSeconds = duration * 60;

    setTimeLeftSec(durationInSeconds);
    setTotalTimeSec(durationInSeconds);
    setIsRunning(false);

    // Always activate the session when switching types
    setIsPomodoroActive(true);
  }, [sessionDurations]);

  const startPomodoro = useCallback((task: Task | null, duration?: number, autoStart = false) => {
    setCurrentTask(task);
    setPomodoroType('work');

    const workDuration = duration || sessionDurations.work;

    // Update the work duration if a specific duration was provided
    if (duration) {
      setSessionDurations(prev => ({ ...prev, work: duration }));
    }

    const durationInSeconds = workDuration * 60;

    setTimeLeftSec(durationInSeconds);
    setTotalTimeSec(durationInSeconds);
    setIsPomodoroActive(true);
    setIsRunning(autoStart);
  }, [sessionDurations.work]);

  const updateDuration = useCallback((newDuration: number) => {
    // Update the duration for the current session type
    setSessionDurations(prev => ({
      ...prev,
      [pomodoroType]: newDuration,
    }));

    // If not running, update the timer
    if (!isRunning) {
      const durationInSeconds = newDuration * 60;
      setTimeLeftSec(durationInSeconds);
      setTotalTimeSec(durationInSeconds);
    }
  }, [pomodoroType, isRunning]);

  const toggleTimer = useCallback(() => {
    // Ensure session is active when starting timer
    if (!isPomodoroActive) {
      setIsPomodoroActive(true);
    }
    setIsRunning(!isRunning);
  }, [isRunning, isPomodoroActive]);

  const stopPomodoro = useCallback(() => {
    setIsRunning(false);
    setIsPomodoroActive(false);
    setCurrentTask(null);
    setPomodoroType('work');

    const durationInSeconds = sessionDurations.work * 60;
    setTimeLeftSec(durationInSeconds);
    setTotalTimeSec(durationInSeconds);

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, [sessionDurations.work]);

  const addFiveMinutes = useCallback(() => {
    setTimeLeftSec(prev => prev + 5 * 60);
    setTotalTimeSec(prev => prev + 5 * 60);
  }, []);

  // Timer logic - Key Fix: Removed isPomodoroActive requirement
  useEffect(() => {
    if (isRunning && timeLeftSec > 0) {
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
  }, [isRunning, timeLeftSec]);

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

  // Handle auto-completion when timer reaches 0
  useEffect(() => {
    if (timeLeftSec === 0 && isPomodoroActive && totalTimeSec > 0) {
      const timer = setTimeout(() => {
        playCompletionSound();

        if (pomodoroType === 'work') {
          const completedMinutes = totalTimeSec / 60;
          const durationHours = completedMinutes / 60;
          handlePomodoroComplete(durationHours);
        }

        toast.success(
          pomodoroType === 'work'
            ? 'Work session completed! Starting your break...'
            : 'Break completed! Starting your work session...',
        );

        // Auto-progress to next session
        if (pomodoroType === 'work') {
          const workMinutes = totalTimeSec / 60;
          const nextBreakType = workMinutes >= 45 ? 'longBreak' : 'shortBreak';
          switchToPomodoroType(nextBreakType);
        } else {
          switchToPomodoroType('work');
        }

        setIsRunning(false);
      }, 0);

      return () => clearTimeout(timer);
    }
  }, [timeLeftSec, isPomodoroActive, totalTimeSec, pomodoroType, handlePomodoroComplete, switchToPomodoroType]);

  const value: PomodoroContextType = useMemo(() => ({
    startPomodoro,
    currentTask,
    streak,
    isPomodoroActive,
    isRunning,
    timeLeftSec,
    totalTimeSec,
    pomodoroType,
    currentDuration,
    toggleTimer,
    stopPomodoro,
    addFiveMinutes,
    switchToPomodoroType,
    updateDuration,
  }), [
    startPomodoro,
    currentTask,
    streak,
    isPomodoroActive,
    isRunning,
    timeLeftSec,
    totalTimeSec,
    pomodoroType,
    currentDuration,
    toggleTimer,
    stopPomodoro,
    addFiveMinutes,
    switchToPomodoroType,
    updateDuration,
  ]);

  return (
    <PomodoroContext.Provider value={value}>
      {children}
    </PomodoroContext.Provider>
  );
}
