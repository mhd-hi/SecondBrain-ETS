"use client";

import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import type { Course } from '@/types/course';

export function useCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCourses = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/courses');
      if (!response.ok) {
        throw new Error('Failed to fetch courses');
      }
      const data = await response.json() as Course[];
      setCourses(data);
    } catch (err) {
      console.error('Error fetching courses:', err);
      setError('Failed to load courses');
      toast.error('Error loading courses', {
        description: 'Please try refreshing the page',
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    courses,
    isLoading,
    error,
    fetchCourses,
  };
} 