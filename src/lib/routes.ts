export const ROUTES = {
    HOME: '/',
    DASHBOARD: '/',
    COURSES: '/courses',
    POMODORO: '/pomodoro',
    WEEKLY_ROADMAP: '/weekly-roadmap',
    ROADMAP: '/roadmap',
    CALENDAR: '/calendar',
    PREFERENCES: '/preferences',
    SIGNIN: '/api/auth/signin',
};

export const getCoursePath = (id: string | number) => `${ROUTES.COURSES}/${id}`;

export default ROUTES;
