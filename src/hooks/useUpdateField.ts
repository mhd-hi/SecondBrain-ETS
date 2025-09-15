import { useCallback } from 'react';

/**
 * Hook to update a field for a task or subtask via API.
 */
export type UpdateFieldParams = {
  type: 'task' | 'subtask';
  id: string;
  input: string;
  value: string;
};

export function useUpdateField() {
  return useCallback(async (params: UpdateFieldParams) => {
    let endpoint = '';
    switch (params.type) {
      case 'task':
        endpoint = '/api/tasks/update';
        break;
      case 'subtask':
        endpoint = '/api/subtasks/update';
        break;
      default:
        throw new Error('Invalid type for update');
    }
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...(params.type === 'task'
            ? { taskId: params.id }
            : { id: params.id }),
          input: params.input,
          value: params.value,
        }),
      });
      if (!res.ok) {
        throw new Error('Failed to update');
      }
      return await res.json();
    } catch (err) {
      console.error('Failed to update field', err);
      throw err;
    }
  }, []);
}
