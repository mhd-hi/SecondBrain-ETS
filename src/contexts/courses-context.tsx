'use client';

import type { ReactNode } from 'react';
import type { CourseListItem } from '@/types/api/course';
import type { Course } from '@/types/course';
import React, { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { api } from '@/lib/utils/api/api-util';
import { ErrorHandlers } from '@/lib/utils/errors/error';
import { getOverdueTasks } from '@/lib/utils/task';

type CoursesContextType = {
  courses: Course[];
  coursesListItems: CourseListItem[];
  isLoading: boolean;
  error: string | null;
  fetchCourses: () => Promise<void>;
  refreshCourses: () => Promise<void>;
  addCourse: (course: Course) => void;
  deleteCourse: (courseId: string) => void;
  updateCourse: (courseId: string, updates: Partial<Course>) => void;
};

const CoursesContext = createContext<CoursesContextType | undefined>(undefined);

export { CoursesContext };

type CoursesProviderProps = {
  children: ReactNode;
};

export function CoursesProvider({ children }: CoursesProviderProps) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const coursesListItems: CourseListItem[] = useMemo(
    () => courses.map(course => ({
      id: course.id,
      code: course.code,
      name: course.name,
      overdueCount: getOverdueTasks(course.tasks ?? []).length,
    })),
    [courses],
  );
  const fetchCourses = useCallback(async () => {
    try {
      setError(null);
      setIsLoading(true);
      const data = await api.get<Course[]>('/api/courses');
      setCourses(data ?? []);
    } catch (error) {
      setError('Failed to load courses');
      ErrorHandlers.silent(error, 'CoursesProvider fetchCourses');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshCourses = useCallback(async () => {
    try {
      setError(null);
      const data = await api.get<Course[]>('/api/courses');
      setCourses(data ?? []);
    } catch (error) {
      setError('Failed to refresh courses');
      ErrorHandlers.silent(error, 'CoursesProvider refreshCourses');
    }
  }, []);

  const addCourse = useCallback((course: Course) => {
    setCourses((prev) => {
      // Check if course already exists to avoid duplicates
      if (prev.some(c => c.id === course.id)) {
        return prev;
      }
      return [...prev, course];
    });
  }, []);

  const deleteCourse = useCallback((courseId: string) => {
    setCourses(prev => prev.filter(course => course.id !== courseId));
  }, []);
  const updateCourse = useCallback((courseId: string, updates: Partial<Course>) => {
    setCourses(prev => prev.map(course =>
      course.id === courseId ? { ...course, ...updates } : course,
    ));
  }, []);

  useEffect(() => {
    void fetchCourses();
  }, [fetchCourses]);

  const value: CoursesContextType = useMemo(() => ({
    courses,
    coursesListItems,
    isLoading,
    error,
    fetchCourses,
    refreshCourses,
    addCourse,
    deleteCourse,
    updateCourse,
  }), [courses, coursesListItems, isLoading, error, fetchCourses, refreshCourses, addCourse, deleteCourse, updateCourse]);

  return (
    <CoursesContext value={value}>
      {children}
    </CoursesContext>
  );
}
