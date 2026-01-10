import type { Task } from '@/types/task';
import { useEffect } from 'react';
import { useTaskStore } from '@/lib/stores/task-store';

/**
 * Hook to sync fetched tasks with the task store
 * This ensures that tasks from API calls are automatically added to the store
 */
export function useSyncTasksWithStore(tasks: Task[] | undefined) {
    const setTasks = useTaskStore(state => state.setTasks);

    useEffect(() => {
        if (tasks && tasks.length > 0) {
            setTasks(tasks);
        }
    }, [tasks, setTasks]);
}
