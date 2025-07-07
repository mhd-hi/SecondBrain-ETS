import type { Task } from './task';

export type PomodoroType = 'work' | 'shortBreak' | 'longBreak';

export type PomodoroContextType = {
  startPomodoro: (task: Task | null, duration?: number, autoStart?: boolean) => void;
  currentTask: Task | null;
  streak: number;
  isPomodoroActive: boolean;
  isRunning: boolean;
  timeLeftSec: number;
  totalTimeSec: number;
  pomodoroType: PomodoroType;
  currentDuration: number;
  toggleTimer: () => void;
  stopPomodoro: () => void;
  addFiveMinutes: () => void;
  switchToPomodoroType: (pomodoroType: PomodoroType) => void;
  updateDuration: (duration: number) => void;
};
