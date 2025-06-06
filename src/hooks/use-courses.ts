"use client";

import { useState, useCallback } from 'react';
import type { Course } from '@/types/course';
import { api } from '@/lib/api/util';
import { CommonErrorMessages } from '@/lib/error/util';
import { withLoadingState } from '@/lib/loading/util';

export function useCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetchCourses = useCallback(async () => {
    setError(null);
    try {
      const data = await withLoadingState(
        () => api.get<Course[]>('/api/courses', CommonErrorMessages.COURSE_FETCH_FAILED),
        setIsLoading
      );
      setCourses(data);
    } catch {
      setError('Failed to load courses');
    }
  }, []);

  return {
    courses,
    isLoading,
    error,
    fetchCourses,
  };
}