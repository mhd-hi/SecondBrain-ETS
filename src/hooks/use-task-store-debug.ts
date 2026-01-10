import { useTaskStore } from '@/lib/stores/task-store';

/**
 * Development helper to inspect the task store state
 * Only use in development - remove from production builds
 */
export function useTaskStoreDebug() {
    const tasks = useTaskStore(state => state.getAllTasks());
    const isLoading = useTaskStore(state => state.isLoading);
    const error = useTaskStore(state => state.error);

    if (process.env.NODE_ENV !== 'development') {
        return null;
    }

    return {
        taskCount: tasks.length,
        tasks,
        isLoading,
        error,
        // Helper to log store state
        logState: () => {
            console.group('📦 Task Store State');
            console.log('Total Tasks:', tasks.length);
            console.log('Loading:', isLoading);
            console.log('Error:', error);
            console.table(tasks.map(t => ({
                id: t.id.slice(0, 8),
                title: t.title,
                status: t.status,
                course: t.course?.code,
                subtasks: t.subtasks?.length || 0,
            })));
            console.groupEnd();
        },
        // Helper to find tasks
        findTasks: (query: string) => {
            const lowerQuery = query.toLowerCase();
            return tasks.filter(t =>
                t.title.toLowerCase().includes(lowerQuery)
                || t.notes?.toLowerCase().includes(lowerQuery)
                || t.course?.code.toLowerCase().includes(lowerQuery),
            );
        },
        // Helper to get store statistics
        getStats: () => {
            const byStatus = tasks.reduce((acc, task) => {
                acc[task.status] = (acc[task.status] || 0) + 1;
                return acc;
            }, {} as Record<string, number>);

            const byCourse = tasks.reduce((acc, task) => {
                const code = task.course?.code || 'unknown';
                acc[code] = (acc[code] || 0) + 1;
                return acc;
            }, {} as Record<string, number>);

            return {
                total: tasks.length,
                byStatus,
                byCourse,
                withSubtasks: tasks.filter(t => t.subtasks && t.subtasks.length > 0).length,
                totalSubtasks: tasks.reduce((sum, t) => sum + (t.subtasks?.length || 0), 0),
            };
        },
    };
}

/**
 * Add this to window for easy console access
 * Usage in console: window.taskStore.logState()
 */
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    (window as unknown as { taskStore: unknown }).taskStore = {
        get state() {
            return useTaskStore.getState();
        },
        logState: () => {
            const state = useTaskStore.getState();
            const tasks = state.getAllTasks();
            console.group('📦 Task Store State');
            console.log('Total Tasks:', tasks.length);
            console.log('Loading:', state.isLoading);
            console.log('Error:', state.error);
            console.table(tasks.map(t => ({
                id: t.id.slice(0, 8),
                title: t.title.slice(0, 30),
                status: t.status,
                course: t.course?.code,
                subtasks: t.subtasks?.length || 0,
            })));
            console.groupEnd();
        },
        getAllTasks: () => useTaskStore.getState().getAllTasks(),
        getTask: (id: string) => useTaskStore.getState().getTask(id),
        reset: () => useTaskStore.getState().reset(),
    };
}
