'use client';

import type { CourseApiResponse } from '@/types/api/course';
import type { Course, Daypart } from '@/types/course';
import type { StatusTask } from '@/types/status-task';
import type { Task } from '@/types/task';
import { useCallback, useState } from 'react';
import { api } from '@/lib/utils/api/api-client-util';
import { withLoadingAndErrorHandling } from '@/lib/utils/api/loading-util';
import { ErrorHandlers } from '@/lib/utils/errors/error';
import { getDefaultImageFor } from '@/lib/utils/url-util';
import { LINK_TYPES } from '@/types/custom-link';

export function useCourse(courseId: string) {
  const [course, setCourse] = useState<Course | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetchCourse = useCallback(async () => {
    await withLoadingAndErrorHandling(
      async () => {
        const data = await api.get<CourseApiResponse>(`/api/courses/${courseId}`);

        const tasksWithValidatedDates: Task[] = data.tasks.map(task => ({
          ...task,
          actualEffort: task.actualEffort ?? 0,
          dueDate: task.dueDate ? new Date(task.dueDate) : new Date(),
          createdAt: new Date(task.createdAt),
          updatedAt: new Date(task.updatedAt),
        }));

        const linksWithImages = data.customLinks.map(link => ({
          ...link,
          imageUrl: link.imageUrl ?? getDefaultImageFor(link.type ?? LINK_TYPES.CUSTOM),
        }));

        setCourse({
          ...data,
          createdAt: new Date(data.createdAt),
          updatedAt: new Date(data.updatedAt),
          tasks: tasksWithValidatedDates,
          customLinks: linksWithImages,
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

  const getFilteredTasks = useCallback((status?: StatusTask) => {
    if (!status) {
      return tasks;
    }
    return tasks.filter(task => task.status === status);
  }, [tasks]);

  const updateCourseColor = useCallback(async (color: string) => {
    await withLoadingAndErrorHandling(
      async () => {
        const res = await fetch(`/api/courses/${courseId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ color }),
        });
        if (!res.ok) {
          throw new Error('Failed to update course color');
        }

        // Update the local course state with the new color
        setCourse(prevCourse =>
          prevCourse ? { ...prevCourse, color } : prevCourse,
        );
      },
      setIsLoading,
      (error) => {
        setError('Failed to update course color');
        ErrorHandlers.api(error, 'Failed to update course color');
      },
    );
  }, [courseId]);

  const updateCourseDaypart = useCallback(async (daypart: Daypart) => {
    await withLoadingAndErrorHandling(
      async () => {
        const res = await fetch(`/api/courses/${courseId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ daypart }),
        });
        if (!res.ok) {
          throw new Error('Failed to update course daypart');
        }

        // Update the local course state with the new daypart
        setCourse(prevCourse => prevCourse ? { ...prevCourse, daypart } : prevCourse);
      },
      setIsLoading,
      (error) => {
        setError('Failed to update course daypart');
        ErrorHandlers.api(error, 'Failed to update course daypart');
      },
    );
  }, [courseId]);

  const deleteCourse = useCallback(async () => {
    await withLoadingAndErrorHandling(
      async () => {
        await api.delete(`/api/courses/${courseId}`, 'Failed to delete course');
      },
      setIsLoading,
      (error) => {
        setError('Failed to delete course');
        ErrorHandlers.api(error, 'Failed to delete course');
      },
    );
  }, [courseId]);

  return {
    course,
    tasks,
    isLoading,
    error,
    fetchCourse,
    getFilteredTasks,
    setCourse,
    setTasks,
    updateCourseColor,
    updateCourseDaypart,
    deleteCourse,
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

export async function deleteCourseById(courseId: string) {
  return api.delete(`/api/courses/${courseId}`, 'Failed to delete course');
}
