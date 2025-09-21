import type { Task, TaskType } from '@/types/task';
import type { FilterType } from '@/types/todays-focus';
import { useState } from 'react';
import { toast } from 'sonner';
import { api } from '@/lib/api/util';
import { withLoadingState } from '@/lib/loading/util';
import { ErrorHandlers } from '@/lib/utils/error';
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
  const response = await fetch(`/api/tasks/focus?filter=${filter}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch focus tasks: ${response.statusText}`);
  }

  return response.json() as Promise<Task[]>;
};

export const fetchWeeklyTasks = async (weekStart: Date, weekEnd: Date): Promise<Task[]> => {
  const response = await fetch(`/api/tasks/weekly?start=${weekStart.toISOString()}&end=${weekEnd.toISOString()}`);

  if (!response.ok) {
    throw new Error('Failed to fetch tasks');
  }

  return response.json() as Promise<Task[]>;
};

export const updateStatusTask = async (taskId: string, status: StatusTask): Promise<void> => {
  const response = await fetch(`/api/tasks/${taskId}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });

  if (!response.ok) {
    throw new Error('Failed to update task status');
  }
};

export const updateDueDateTask = async (taskId: string, dueDate: Date): Promise<void> => {
  const response = await fetch(`/api/tasks/${taskId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      dueDate: dueDate.toISOString(),
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to update task due date');
  }
};

export const batchUpdateStatusTask = async (taskIds: string[], status: StatusTask): Promise<{
  updatedCount: number;
  status: StatusTask;
  updatedTasks: Task[];
}> => {
  const response = await fetch('/api/tasks/batch/status', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ taskIds, status }),
  });

  if (!response.ok) {
    throw new Error(`Failed to batch update task status: ${response.statusText}`);
  }

  return response.json() as Promise<{
    updatedCount: number;
    status: StatusTask;
    updatedTasks: Task[];
  }>;
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
