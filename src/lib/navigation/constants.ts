import { getCalendarPath, getPomodoroPath, ROUTES } from '@/lib/routes';

export const navbarItems = [
  {
    title: 'Dashboard',
    url: ROUTES.DASHBOARD,
    icon: '🎯',
  },
  {
    title: 'Pomodoro',
    url: getPomodoroPath(),
    icon: '🍅',
  },
  {
    title: 'Calendar',
    url: getCalendarPath(),
    icon: '📅',
  },
];
