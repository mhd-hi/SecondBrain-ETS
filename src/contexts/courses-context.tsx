"use client";

import React, { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react';
import type { ReactNode } from 'react';
import { api } from '@/lib/api/util';
import { ErrorHandlers } from '@/lib/error/util';
import type { Course } from '@/types/course';
import { TaskStatus } from '@/types/task';

// Simple interface for courses list view (used by sidebar)
export interface CourseListItem {
  id: string;
  code: string;
  name: string;
  inProgressCount: number;
}

interface CoursesContextType {
  courses: Course[];
  coursesListItems: CourseListItem[];
  isLoading: boolean;
  error: string | null;
  fetchCourses: () => Promise<void>;
  refreshCourses: () => Promise<void>;
  addCourse: (course: Course) => void;
  deleteCourse: (courseId: string) => void;
  updateCourse: (courseId: string, updates: Partial<Course>) => void;
}

const CoursesContext = createContext<CoursesContextType | undefined>(undefined);

interface CoursesProviderProps {
  children: ReactNode;
}

export function CoursesProvider({ children }: CoursesProviderProps) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Convert full courses to simplified list items for sidebar
  const coursesListItems: CourseListItem[] = useMemo(
    () => courses.map(course => ({
      id: course.id,
      code: course.code,
      name: course.name,
      inProgressCount: course.tasks?.filter(task => task.status === TaskStatus.IN_PROGRESS).length ?? 0
    })),
    [courses]
  );
  const fetchCourses = useCallback(async () => {
    try {
      setError(null);
      setIsLoading(true);
      const data = await api.get<Course[]>("/api/courses");
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
      const data = await api.get<Course[]>("/api/courses");
      setCourses(data ?? []);
    } catch (error) {
      setError('Failed to refresh courses');
      ErrorHandlers.silent(error, 'CoursesProvider refreshCourses');
    }
  }, []);

  const addCourse = useCallback((course: Course) => {
    setCourses(prev => {
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
      course.id === courseId ? { ...course, ...updates } : course
    ));
  }, []);

  useEffect(() => {
    void fetchCourses();
  }, [fetchCourses]);
  const value: CoursesContextType = {
    courses,
    coursesListItems,
    isLoading,
    error,
    fetchCourses,
    refreshCourses,
    addCourse,
    deleteCourse,
    updateCourse,
  };

  return (
    <CoursesContext.Provider value={value}>
      {children}
    </CoursesContext.Provider>
  );
}

export function useCourses() {
  const context = useContext(CoursesContext);
  if (context === undefined) {
    throw new Error('useCourses must be used within a CoursesProvider');
  }
  return context;
}
