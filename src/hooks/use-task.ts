import type { TEvent } from '@/calendar/types';
import type { Task, TaskType } from '@/types/task';
import type { FilterType } from '@/types/todays-focus';
import { useCallback, useState } from 'react';
import { toast } from 'sonner';
import { api } from '@/lib/utils/api/api-client-util';
import { withLoadingState } from '@/lib/utils/api/loading-util';
import { ErrorHandlers } from '@/lib/utils/errors/error';
import { StatusTask } from '@/types/status-task';

export function useTask() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addTask = async ({ courseId, newTask }: {
    courseId: string;
    newTask: {
      title: string;
      notes: string;
      estimatedEffort: number;
      dueDate: Date;
      type: TaskType;
      status: StatusTask;
    };
  }) => {
    setError(null);
    return withLoadingState(async () => {
      try {
        await api.post('/api/tasks', {
          courseId,
          tasks: [
            {
              ...newTask,
              status: StatusTask.TODO,
              dueDate: newTask.dueDate.toISOString(),
            },
          ],
        });
        return true;
      } catch (err) {
        ErrorHandlers.api(err, 'Failed to add task');
        setError('Failed to add task');
        return false;
      }
    }, setIsLoading);
  };

  return { addTask, isLoading, error };
}

export const fetchFocusTasks = async (filter: FilterType): Promise<Task[]> => {
  return api.get(`/api/tasks/focus?filter=${filter}`, 'Failed to fetch focus tasks');
};

export const fetchCalendarTasks = async (startDate: Date, endDate: Date): Promise<TEvent[]> => {
  return api.get(`/api/tasks/calendar?start=${startDate.toISOString()}&end=${endDate.toISOString()}`, 'Failed to fetch calendar tasks');
};

export const updateStatusTask = async (taskId: string, status: StatusTask): Promise<void> => {
  await api.patch(`/api/tasks/${taskId}/status`, { status }, 'Failed to update task status');
};

export const updateDueDateTask = async (taskId: string, dueDate: Date): Promise<void> => {
  await api.patch(`/api/tasks/${taskId}`, {
    dueDate: dueDate.toISOString(),
  }, 'Failed to update task due date');
};

export const batchUpdateStatusTask = async (taskIds: string[], status: StatusTask): Promise<{
  updatedCount: number;
  status: StatusTask;
  updatedTasks: Task[];
}> => {
  return api.patch('/api/tasks/batch/status', { taskIds, status }, 'Failed to batch update task status');
};

export async function deleteTask(taskId: string, fetchCourse?: () => Promise<void>) {
  try {
    await api.delete(`/api/tasks/${taskId}`);
    toast.success('Task deleted successfully');
    if (fetchCourse) {
      await fetchCourse();
    }
  } catch (error) {
    ErrorHandlers.api(error, 'Failed to delete task');
  }
}

export const useCalendarTasks = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getCalendarTasks = useCallback(async (startDate: Date, endDate: Date): Promise<TEvent[]> => {
    setError(null);
    return withLoadingState(async () => {
      try {
        return await fetchCalendarTasks(startDate, endDate);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch calendar tasks';
        setError(errorMessage);
        throw new Error(errorMessage);
      }
    }, setIsLoading);
  }, []);

  return { getCalendarTasks, isLoading, error };
};
