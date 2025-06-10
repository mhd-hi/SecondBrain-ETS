"use client";

import { useState, useCallback } from 'react';
import type { Course } from '@/types/course';
import type { Task, TaskStatus, TaskType } from '@/types/task';
import { api } from '@/lib/api/util';
import { withLoadingAndErrorHandling } from '@/lib/loading/util';
import { ErrorHandlers } from '@/lib/error/util';

interface CourseResponse {
  id: string;
  code: string;
  name: string;
  color: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  tasks: Array<{
    id: string;
    title: string;
    notes?: string;
    dueDate?: string;
    week: number;
    type: TaskType;
    status: TaskStatus;
    estimatedEffort: number;
    actualEffort: number;
    courseId: string;
    createdAt: string;
    updatedAt: string;
  }>;
}

export function useCourse(courseId: string) {
  const [course, setCourse] = useState<Course | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetchCourse = useCallback(async () => {
    await withLoadingAndErrorHandling(
      async () => {
        const data = await api.get<CourseResponse>(`/api/courses/${courseId}`);
        
        // Convert dueDate strings to Date objects and handle invalid dates
        const tasksWithValidatedDates: Task[] = data.tasks.map(task => ({
          ...task,
          actualEffort: task.actualEffort ?? 0,
          dueDate: task.dueDate ? new Date(task.dueDate) : new Date(), // Fallback to current date if dueDate is missing
          createdAt: new Date(task.createdAt),
          updatedAt: new Date(task.updatedAt)
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
      }
    );
  }, [courseId]);

  const getFilteredTasks = useCallback((status?: TaskStatus) => {
    if (!status) return tasks;
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
    setTasks
  };
}
