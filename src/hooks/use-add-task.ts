import type { TaskType } from '@/types/task';
import { useState } from 'react';
import { api } from '@/lib/api/util';
import { ErrorHandlers } from '@/lib/error/util';
import { withLoadingState } from '@/lib/loading/util';
import { TaskStatus } from '@/types/task';

export function useAddTask() {
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
