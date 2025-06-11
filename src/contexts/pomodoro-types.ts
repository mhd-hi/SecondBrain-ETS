import type { Task } from '@/types/task';
import { createContext } from 'react';

type PomodoroContextType = {
  startPomodoro: (task: Task | null, duration?: number) => void;
  isDialogOpen: boolean;
  currentTask: Task | null;
  streak: number;
  duration: number;
  setDuration: (duration: number) => void;
};

export const PomodoroContext = createContext<PomodoroContextType | undefined>(undefined);
export type { PomodoroContextType };
