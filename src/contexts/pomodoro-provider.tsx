/* eslint-disable react-hooks-extra/no-direct-set-state-in-use-effect */
'use client';

import type { ReactNode } from 'react';
import type { PomodoroContextType, PomodoroType } from '@/types/pomodoro';
import type { Task } from '@/types/task';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import { completePomodoroSession, fetchPomodoroStreak } from '@/hooks/use-pomodoro';
import { playSelectedNotificationSound } from '@/lib/audio/util';
import { PomodoroContext } from './pomodoro-context';

const DEFAULT_WORK_DURTION = 25;
const LONG_BREAK_THRESHOLD = 45;

type SessionDurations = {
  work: number;
  shortBreak: number;
  longBreak: number;
};

type PomodoroProviderProps = {
  children: ReactNode;
};

export function PomodoroProvider({ children }: PomodoroProviderProps) {
  // SSR-safe: always use defaults for initial state
  const [currentTask, setCurrentTask] = useState<Task | null>(null);
  const [streak, setStreak] = useState(0);
  const [pomodoroType, setPomodoroType] = useState<PomodoroType>('work');
  const [isPomodoroActive, setIsPomodoroActive] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionDurations, setSessionDurations] = useState<SessionDurations>({
    work: DEFAULT_WORK_DURTION,
    shortBreak: DEFAULT_WORK_DURTION * 0.2,
    longBreak: DEFAULT_WORK_DURTION * 0.6,
  });
  const [timeLeftSec, setTimeLeftSec] = useState<number | null>(null);
  const [totalTimeSec, setTotalTimeSec] = useState<number | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // On mount, update durations from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const settings = localStorage.getItem('pomodoroSettings');
      let work = DEFAULT_WORK_DURTION;
      let shortBreak = DEFAULT_WORK_DURTION * 0.2;
      let longBreak = DEFAULT_WORK_DURTION * 0.6;
      if (settings) {
        try {
          const parsed = JSON.parse(settings);
          work = typeof parsed.workDuration === 'number' ? parsed.workDuration : DEFAULT_WORK_DURTION;
          shortBreak = typeof parsed.shortBreakDuration === 'number' ? parsed.shortBreakDuration : DEFAULT_WORK_DURTION * 0.2;
          longBreak = typeof parsed.longBreakDuration === 'number' ? parsed.longBreakDuration : DEFAULT_WORK_DURTION * 0.6;
        } catch {}
      }
      setSessionDurations({ work, shortBreak, longBreak });
      setTimeLeftSec(work * 60);
      setTotalTimeSec(work * 60);
      setIsLoaded(true);
    }
  }, []);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Get current duration based on session type
  const currentDuration = sessionDurations[pomodoroType];

  const handlePomodoroComplete = useCallback(async (durationHours: number) => {
    try {
      const result = await completePomodoroSession(durationHours, currentTask?.id);

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
    setTimeLeftSec(prev => (prev !== null ? prev + 5 * 60 : 5 * 60));
    setTotalTimeSec(prev => (prev !== null ? prev + 5 * 60 : 5 * 60));
  }, []);

  // Timer logic
  useEffect(() => {
    if (isRunning && timeLeftSec !== null && timeLeftSec > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeftSec((prev) => {
          if (prev === null || prev <= 1) {
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
    const loadStreak = async () => {
      try {
        const streakDays = await fetchPomodoroStreak();
        setStreak(streakDays);
      } catch (error) {
        console.error('Failed to fetch streak:', error);
      }
    };

    void loadStreak();
  }, []);

  // Handle auto-completion when timer reaches 0
  useEffect(() => {
    if (
      timeLeftSec === 0
      && isPomodoroActive
      && totalTimeSec !== null
      && totalTimeSec > 0
    ) {
      const timer = setTimeout(() => {
        // Read notification sound and volume from localStorage
        let sound = 'default';
        let volume = 0.2;
        try {
          const settings = localStorage.getItem('pomodoroSettings');
          if (settings) {
            const parsed = JSON.parse(settings);
            sound = parsed.notificationSound || 'default';
            volume = typeof parsed.soundVolume === 'number' ? Math.max(0, Math.min(1, parsed.soundVolume / 100)) : 0.2;
          }
        } catch {}

        playSelectedNotificationSound(sound, volume);

        if (pomodoroType === 'work' && totalTimeSec !== null) {
          const completedMinutes = totalTimeSec / 60;
          const durationHours = completedMinutes / 60;
          handlePomodoroComplete(durationHours);
        }

        // Auto-progress to next session
        if (pomodoroType === 'work' && totalTimeSec !== null) {
          const workMinutes = totalTimeSec / 60;
          const nextBreakType = workMinutes >= LONG_BREAK_THRESHOLD ? 'longBreak' : 'shortBreak';
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
    timeLeftSec: timeLeftSec ?? 0,
    totalTimeSec: totalTimeSec ?? 0,
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

  // Only render children when timer is loaded
  if (!isLoaded || timeLeftSec === null || totalTimeSec === null) {
    return null;
  }
  return (
    <PomodoroContext.Provider value={value}>
      {children}
    </PomodoroContext.Provider>
  );
}
