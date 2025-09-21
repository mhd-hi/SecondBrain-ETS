'use client';

import type { CourseApiResponse } from '@/types/api/course';
import type { Course } from '@/types/course';
import type { Task } from '@/types/task';
import type { TaskStatus } from '@/types/task-status';
import { useCallback, useState } from 'react';
import { api } from '@/lib/api/util';
import { ErrorHandlers } from '@/lib/error/util';
import { withLoadingAndErrorHandling } from '@/lib/loading/util';

export function useCourse(courseId: string) {
  const [course, setCourse] = useState<Course | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetchCourse = useCallback(async () => {
    await withLoadingAndErrorHandling(
      async () => {
        const data = await api.get<CourseApiResponse>(`/api/courses/${courseId}`);

        // Convert dueDate strings to Date objects and handle invalid dates
        const tasksWithValidatedDates: Task[] = data.tasks.map(task => ({
          ...task,
          actualEffort: task.actualEffort ?? 0,
          dueDate: task.dueDate ? new Date(task.dueDate) : new Date(), // Fallback to current date if dueDate is missing
          createdAt: new Date(task.createdAt),
          updatedAt: new Date(task.updatedAt),
        }));

        setCourse({
          ...data,
          createdAt: new Date(data.createdAt),
          updatedAt: new Date(data.updatedAt),
          tasks: tasksWithValidatedDates,
        });
        setTasks(tasksWithValidatedDates);
      },
      setIsLoading,
      (error) => {
        setError('Failed to load course data');
        ErrorHandlers.api(error, 'Failed to load course');
      },
    );
  }, [courseId]);

  const getFilteredTasks = useCallback((status?: TaskStatus) => {
    if (!status) {
      return tasks;
    }
    return tasks.filter(task => task.status === status);
  }, [tasks]);

  return {
    course,
    tasks,
    isLoading,
    error,
    fetchCourse,
    getFilteredTasks,
    setCourse,
    setTasks,
  };
}

export const checkCourseExists = async (code: string, term: string): Promise<{
  exists: boolean;
  course?: { id: string; code: string; name: string };
}> => {
  const response = await fetch(`/api/courses/exists?code=${encodeURIComponent(code)}&term=${encodeURIComponent(term)}`);

  if (!response.ok) {
    throw new Error(`Failed to check course existence: ${response.statusText}`);
  }

  return response.json() as Promise<{
    exists: boolean;
    course?: { id: string; code: string; name: string };
  }>;
};
