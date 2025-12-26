// Utility functions and types for Pomodoro localStorage management

import { SOUND_DEFAULT } from '../sound-manager';

export type PomodoroSettings = {
  workDuration: number;
  shortBreakDuration: number;
  longBreakDuration: number;
  soundVolume: number;
  notificationSound: string;
};

export const DEFAULT_POMODORO_SETTINGS: PomodoroSettings = {
  workDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  soundVolume: 60,
  notificationSound: SOUND_DEFAULT,
};

export function loadPomodoroSettings(): PomodoroSettings {
  const savedSettings = typeof window !== 'undefined' ? localStorage.getItem('pomodoroSettings') : null;
  if (savedSettings) {
    try {
      const parsed = JSON.parse(savedSettings);
      return { ...DEFAULT_POMODORO_SETTINGS, ...parsed };
    } catch (error) {
      console.error('Failed to parse saved pomodoro settings:', error);
      return DEFAULT_POMODORO_SETTINGS;
    }
  }
  return DEFAULT_POMODORO_SETTINGS;
}

export function savePomodoroSettings(settings: PomodoroSettings) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('pomodoroSettings', JSON.stringify(settings));
  }
}
