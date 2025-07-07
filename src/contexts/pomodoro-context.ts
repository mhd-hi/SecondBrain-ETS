import type { PomodoroContextType } from '@/types/pomodoro';
import { createContext } from 'react';

export const PomodoroContext = createContext<PomodoroContextType | undefined>(undefined);
