import type { Task } from '@/types/task';
import { createContext } from 'react';

interface PomodoroContextType {
  startPomodoro: (task: Task | null, sessionDuration?: number) => void;
  stopPomodoro: () => void;
  isTimerVisible: boolean;
  currentTask: Task | null;
  streak: number;
  duration: number; // Represents the preferred work session duration
  setDuration: (duration: number) => void;
}

export const PomodoroContext = createContext<PomodoroContextType | undefined>(undefined);
export type { PomodoroContextType }; // Still export the type if other files import it directly
