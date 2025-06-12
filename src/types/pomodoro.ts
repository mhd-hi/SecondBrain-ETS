import type { Task } from '@/types/task';
import { createContext } from 'react';

type SessionType = 'work' | 'shortBreak' | 'longBreak';

type PomodoroContextType = {
  startPomodoro: (task: Task | null, duration?: number) => void;
  isDialogOpen: boolean;
  currentTask: Task | null;
  streak: number;
  duration: number;
  setDuration: (duration: number) => void;
  isSessionActive: boolean;
  isRunning: boolean;
  timeLeftSec: number;
  totalTimeSec: number;
  sessionType: SessionType;
  completedPomodoros: number;
  toggleTimer: () => void;
  stopSession: () => void;
  addFiveMinutes: () => void;
  switchToNextSession: () => void;
  openDialog: () => void;
};

export const PomodoroContext = createContext<PomodoroContextType | undefined>(undefined);
export type { PomodoroContextType, SessionType };
