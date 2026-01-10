import type { Course, CourseCreateRequest } from '@/types/course';
import { useSession } from 'next-auth/react';
import { useCallback, useEffect, useMemo } from 'react';
import { useCourseStore } from '@/lib/stores/course-store';

export function useCourseOperations() {
    const { status } = useSession();

    const isLoading = useCourseStore(state => state.isLoading);
    const error = useCourseStore(state => state.error);
    const hasInitialized = useCourseStore(state => state.hasInitialized);

    const coursesMap = useCourseStore(state => state.courses);
    const courses = useMemo(() => Array.from(coursesMap.values()), [coursesMap]);
    const coursesListItems = useMemo(
        () => courses.map(course => ({
            ...course,
            overdueCount: 0,
        })).sort((a, b) => a.code.localeCompare(b.code)),
        [courses],
    );

    useEffect(() => {
        if (status === 'authenticated' && !hasInitialized && !isLoading) {
            void useCourseStore.getState().fetchCourses();
        } else if (status === 'unauthenticated') {
            useCourseStore.getState().reset();
        }
    }, [status, hasInitialized, isLoading]);

    const fetchCourses = useCallback(async () => {
        useCourseStore.setState({ hasInitialized: false });
        return useCourseStore.getState().fetchCourses();
    }, []);

    const refreshCourses = useCallback(async () => {
        return useCourseStore.getState().refreshCourses();
    }, []);

    const createCourse = useCallback(async (courseData: CourseCreateRequest) => {
        return useCourseStore.getState().createCourse(courseData);
    }, []);

    const updateCourseField = useCallback(
        async (courseId: string, field: string, value: unknown) => {
            return useCourseStore.getState().updateCourseField(courseId, field, value);
        },
        [],
    );

    const deleteCourse = useCallback(async (courseId: string) => {
        return useCourseStore.getState().removeCourse(courseId);
    }, []);

    const getCourse = useCallback((courseId: string) => {
        return useCourseStore.getState().getCourse(courseId);
    }, []);

    const getCourseByCode = useCallback((code: string) => {
        return useCourseStore.getState().getCourseByCode(code);
    }, []);

    return {
        courses,
        coursesListItems,
        isLoading,
        error,
        fetchCourses,
        refreshCourses,
        createCourse,
        updateCourseField,
        deleteCourse,
        getCourse,
        getCourseByCode,
        getAllCourses: useCourseStore.getState().getAllCourses,
        getCoursesListItems: useCourseStore.getState().getCoursesListItems,
        clearError: useCourseStore.getState().clearError,
    };
}

export function useCourse(courseId: string) {
    const { status } = useSession();
    const course = useCourseStore(state => state.courses.get(courseId));
    const hasInitialized = useCourseStore(state => state.hasInitialized);
    const isLoading = useCourseStore(state => state.isLoading);

    useEffect(() => {
        if (status === 'authenticated' && !hasInitialized && !isLoading) {
            void useCourseStore.getState().fetchCourses();
        } else if (status === 'unauthenticated') {
            useCourseStore.getState().reset();
        }
    }, [status, hasInitialized, isLoading]);

    const updateCourse = useCallback((updates: Partial<Course>) => {
        useCourseStore.getState().updateCourse(courseId, updates);
    }, [courseId]);

    const deleteCourse = useCallback(async () => {
        return useCourseStore.getState().removeCourse(courseId);
    }, [courseId]);

    return {
        course,
        updateCourse,
        deleteCourse,
    };
}

export function useCourses() {
    const { status } = useSession();

    const isLoading = useCourseStore(state => state.isLoading);
    const error = useCourseStore(state => state.error);
    const hasInitialized = useCourseStore(state => state.hasInitialized);

    const coursesMap = useCourseStore(state => state.courses);
    const courses = useMemo(() => Array.from(coursesMap.values()), [coursesMap]);
    const coursesListItems = useMemo(
        () => courses.map(course => ({
            ...course,
            overdueCount: 0,
        })).sort((a, b) => a.code.localeCompare(b.code)),
        [courses],
    );

    useEffect(() => {
        if (status === 'authenticated' && !hasInitialized && !isLoading) {
            void useCourseStore.getState().fetchCourses();
        } else if (status === 'unauthenticated') {
            useCourseStore.getState().reset();
        }
    }, [status, hasInitialized, isLoading]);

    return {
        courses,
        coursesListItems,
        isLoading,
        error,
    };
}
