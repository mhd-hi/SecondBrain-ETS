export const ROUTES = {
  DASHBOARD: '/',
  COURSES: '/courses',
  ADD_COURSE: '/courses/add',
  POMODORO: '/pomodoro',
  CALENDAR: '/calendar',
  ROADMAP: '/roadmap',
  PREFERENCES: '/preferences',
  SIGNIN: '/api/auth/signin',
  DAY_VIEW: '/day-view',
} as const;

// Route builder helpers
export const getCoursePath = (id: string | number) => `${ROUTES.COURSES}/${id}`;
export const getAddCoursePath = () => ROUTES.ADD_COURSE;
export const getPomodoroPath = (taskId?: string | number) =>
  taskId ? `${ROUTES.POMODORO}?taskId=${taskId}` : ROUTES.POMODORO;
export const getCalendarPath = () => ROUTES.CALENDAR;
export const getPreferencesPath = (view?: 'profile' | 'pomodoro') =>
  view ? `${ROUTES.PREFERENCES}?view=${view}` : ROUTES.PREFERENCES;
export const getDayViewPath = () => ROUTES.DAY_VIEW;
export const getDashboardPath = () => ROUTES.DASHBOARD;
