'use client';

import { use } from 'react';
import { PomodoroContext } from './pomodoro-context';

export function usePomodoro() {
  const context = use(PomodoroContext);
  if (context === undefined) {
    throw new Error('usePomodoro must be used within a PomodoroProvider');
  }
  return context;
}
