import type { PomodoroType } from '@/types/pomodoro';

export const getBreakActivities = (type: PomodoroType) => {
  if (type === 'shortBreak') {
    return [
      '🚶 Take a short walk',
      '🧘 Do some deep breathing',
      '💧 Drink water & hydrate',
      '🤸 Stretch your body',
      '👀 Rest your eyes (look far away)',
    ];
  } else if (type === 'longBreak') {
    return [
      '🌳 Go for a walk outside',
      '💪 Do a quick workout',
      '😴 Take a 20-minute power nap',
      '🧘‍♀️ Meditate or pray',
      '🥙 Have a healthy snack',
    ];
  }
  return [];
};
