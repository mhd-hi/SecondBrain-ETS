"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { PomodoroDialog } from '@/components/Boards/FocusSession/PomodoroDialog';
import type { Task } from '@/types/task';
import { toast } from 'sonner';

const PREFFERED_POMODORO_DURATION = 52;

interface PomodoroContextType {
  startPomodoro: (task: Task, duration?: number) => void;
  isDialogOpen: boolean;
  currentTask: Task | null;
  streak: number;
  duration: number;
  setDuration: (duration: number) => void;
}

const PomodoroContext = createContext<PomodoroContextType | undefined>(undefined);

interface PomodoroProviderProps {
  children: ReactNode;
}

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

  const startPomodoro = (task: Task, sessionDuration?: number) => {
    setCurrentTask(task);
    if (sessionDuration) {
      setDuration(sessionDuration);
    }
    setIsDialogOpen(true);
  };

  const handlePomodoroComplete = async (durationHours: number) => {
    if (!currentTask) {
      toast.error("No task selected");
      return;
    }

    try {
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
    } catch (error) {
      console.error('Failed to complete Pomodoro:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to complete Pomodoro');
    }
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setCurrentTask(null);
  };

  const value: PomodoroContextType = {
    startPomodoro,
    isDialogOpen,
    currentTask,
    streak,
    duration,
    setDuration,
  };

  return (
    <PomodoroContext.Provider value={value}>
      {children}
      <PomodoroDialog
        isOpen={isDialogOpen}
        onClose={handleDialogClose}
        taskTitle={currentTask?.title ?? ""}
        streak={streak}
        duration={duration}
        onComplete={handlePomodoroComplete}
      />
    </PomodoroContext.Provider>
  );
}

export function usePomodoro() {
  const context = useContext(PomodoroContext);
  if (context === undefined) {
    throw new Error('usePomodoro must be used within a PomodoroProvider');
  }
  return context;
}
