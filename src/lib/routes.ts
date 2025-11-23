export const ROUTES = {
    HOME: '/',
    DASHBOARD: '/',
    COURSES: '/courses',
    POMODORO: '/pomodoro',
    CALENDAR: '/calendar',
    ROADMAP: '/roadmap',
    PREFERENCES: '/preferences',
    SIGNIN: '/api/auth/signin',
};

export const getCoursePath = (id: string | number) => `${ROUTES.COURSES}/${id}`;

export default ROUTES;
