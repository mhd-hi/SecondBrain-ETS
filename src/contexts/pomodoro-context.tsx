'use client';

import type { ReactNode } from 'react';
import { PomodoroContext, PomodoroContextType } from './pomodoro-types';
import type { Task } from '@/types/task';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
// Import the new hook and component
import { usePomodoroTimer, SessionType } from '../hooks/usePomodoroTimer';
import { PomodoroTimer } from '../components/PomodoroTimer';

const PREFFERED_POMODORO_DURATION = 25;

type PomodoroProviderProps = {
  children: ReactNode;
};

export function PomodoroProvider({ children }: PomodoroProviderProps) {
  const [isTimerVisible, setIsTimerVisible] = useState(false);
  const [timerKey, setTimerKey] = useState(0); // To force re-mount PomodoroTimer
  const [currentTask, setCurrentTask] = useState<Task | null>(null);
  const [streak, setStreak] = useState(0);
  const [duration, setDuration] = useState(PREFFERED_POMODORO_DURATION); // This is initial work session duration

  // Fetch user streak on mount (existing logic)
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
    // Set the duration for the upcoming series of pomodoros.
    // The hook will pick this up via `initialDurationMinutes`.
    setDuration(sessionDuration || PREFFERED_POMODORO_DURATION);
    setIsTimerVisible(true);
    setTimerKey(prev => prev + 1); // Update key to re-initialize PomodoroTimer with new duration/task
  }, []);

  const stopPomodoro = useCallback(() => {
    setIsTimerVisible(false);
    setCurrentTask(null); // Clear task
    // Optionally reset duration to default, or leave it as last set by user
    // setDuration(PREFFERED_POMODORO_DURATION);
  }, []);

  // Callback for when a pomodoro work session is completed (from the hook)
  const handlePomodoroWorkSessionComplete = useCallback(async (completedDurationHours: number) => {
    try {
      if (currentTask) {
        const response = await fetch('/api/pomodoro/complete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ taskId: currentTask.id, durationHours }),
        });
        if (!response.ok) {
          const errorData = await response.json() as { message?: string };
          throw new Error(errorData.message ?? 'Failed to complete Pomodoro for task');
        }
        const result = await response.json() as { success: boolean; newStreakDays: number; taskUpdated: { id: string; actualEffort: number } };
        setStreak(result.newStreakDays);
        toast.success(`Pomodoro completed! ${(completedDurationHours * 60).toFixed(0)} minutes added to task.`);
      } else {
        // Free focus session (no specific task)
        const response = await fetch('/api/pomodoro/complete-free', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ durationHours }),
        });
        if (!response.ok) {
          const errorData = await response.json() as { message?: string };
          throw new Error(errorData.message ?? 'Failed to complete free Pomodoro session');
        }
        const result = await response.json() as { success: boolean; newStreakDays: number };
        setStreak(result.newStreakDays);
        toast.success(`Focus session completed! ${(completedDurationHours * 60).toFixed(0)} minutes of focused work.`);
      }
    } catch (error) {
      console.error('Failed to complete Pomodoro session:', error);
      toast.error(error instanceof Error ? error.message : 'Pomodoro completion failed');
    }
  }, [currentTask]);

  // Instantiate the pomodoro timer hook
  const pomodoroHook = usePomodoroTimer({
    initialDurationMinutes: duration, // Context's duration state feeds into the hook
    onCompleteCallback: handlePomodoroWorkSessionComplete, // Called when a 'work' session finishes
    onStopCallback: stopPomodoro, // Called when the timer is stopped via its own stop button
    // onSessionChangeCallback can be added if needed
  });

  // Value for the PomodoroContext.Provider
  const contextValue: PomodoroContextType = useMemo(() => ({
    isTimerVisible,
    startPomodoro,
    stopPomodoro,
    currentTask,
    streak,
    duration, // Expose current work session duration
    setDuration, // Expose setter for work session duration
  }), [isTimerVisible, startPomodoro, stopPomodoro, currentTask, streak, duration, setDuration]);

  return (
    <PomodoroContext.Provider value={contextValue}>
      {children}
      {isTimerVisible && (
        <PomodoroTimer
          key={timerKey} // Re-mounts and re-initializes timer when key changes
          taskTitle={currentTask?.title ?? ''}
          streak={streak}
          timeLeftSec={pomodoroHook.timeLeftSec}
          isRunning={pomodoroHook.isRunning}
          sessionType={pomodoroHook.sessionType}
          completedPomodoros={pomodoroHook.completedPomodoros}
          totalTimeSec={pomodoroHook.totalTimeSec}
          progress={pomodoroHook.progress}
          initialDurationMinutes={duration} // Pass context's duration to DurationSelector
          onPlayPause={pomodoroHook.handlePlayPause}
          onStop={pomodoroHook.handleStop} // Hook's own stop logic
          onAddFiveMinutes={pomodoroHook.handleAddFiveMinutes}
          onSetWorkSessionDuration={(newWorkDuration) => {
            // This function is called by DurationSelector in PomodoroTimer
            // 1. Update the context's duration. This is the source of truth for initial work duration.
            setDuration(newWorkDuration);
            // 2. The hook (usePomodoroTimer) will automatically re-initialize
            //    because its `initialDurationMinutes` prop (which is `duration` from context)
            //    will change, triggering its internal useEffect.
            //    If immediate update of the hook's current non-running work session is desired
            //    without relying on the prop change effect (e.g. if timerKey doesn't change),
            //    we can also call:
            // if (pomodoroHook.sessionType === 'work' && !pomodoroHook.isRunning) {
            //   pomodoroHook.setWorkSessionDuration(newWorkDuration);
            // }
          }}
          onSkipBreak={pomodoroHook.switchToNextSession} // To skip break and go to work
        />
      )}
    </PomodoroContext.Provider>
  );
}

// Standard hook to consume the PomodoroContext
export const usePomodoro = () => {
  const context = React.useContext(PomodoroContext);
  if (context === undefined) {
    throw new Error('usePomodoro must be used within a PomodoroProvider');
  }
  return context;
};
