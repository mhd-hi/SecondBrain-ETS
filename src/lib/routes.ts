export const ROUTES = {
    HOME: '/',
    DASHBOARD: '/',
    COURSES: '/courses',
    POMODORO: '/pomodoro',
    CALENDAR: '/calendar',
    ROADMAP: '/roadmap',
    PREFERENCES: '/preferences',
    SIGNIN: '/api/auth/signin',
    DAY_VIEW: '/day-view',
} as const;

// Route builder helpers
export const getCoursePath = (id: string | number) => `${ROUTES.COURSES}/${id}`;
export const getPomodoroPath = (taskId?: string | number) =>
    taskId ? `${ROUTES.POMODORO}?taskId=${taskId}` : ROUTES.POMODORO;
export const getCalendarPath = () => ROUTES.CALENDAR;
export const getPreferencesPath = () => ROUTES.PREFERENCES;
export const getDayViewPath = () => ROUTES.DAY_VIEW;
export const getHomePath = () => ROUTES.HOME;

export default ROUTES;
