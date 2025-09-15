import type { Task, TaskType } from '@/types/task';
import { useState } from 'react';
import { toast } from 'sonner';
import { api } from '@/lib/api/util';
import { ErrorHandlers } from '@/lib/error/util';
import { withLoadingState } from '@/lib/loading/util';
import { TaskStatus } from '@/types/task';

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
      status: TaskStatus;
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
              status: TaskStatus.TODO,
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

/**
 * Batch update task status for multiple tasks
 * @param taskIds Array of task IDs to update
 * @param status New status to set for all tasks
 * @returns Promise that resolves when the batch update is complete
 */
export const batchUpdateTaskStatus = async (taskIds: string[], status: TaskStatus): Promise<{
  updatedCount: number;
  status: TaskStatus;
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
    status: TaskStatus;
    updatedTasks: Task[];
  }>;
};
