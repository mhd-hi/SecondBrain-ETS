import type { StatusTask } from '@/types/status-task';
import type { Task, TaskType } from '@/types/task';
import { useCallback } from 'react';
import { useTaskStore } from '@/lib/stores/task-store';

/**
 * Custom hook that provides convenient methods for working with the task store
 * Use this instead of directly accessing useTaskStore for better ergonomics
 */
export function useTaskOperations() {
    const store = useTaskStore();

    const addTask = useCallback(
        async (
            courseId: string,
            newTask: {
                title: string;
                notes: string;
                estimatedEffort: number;
                dueDate: Date;
                type: TaskType;
                status: StatusTask;
            },
        ) => {
            return store.createTask(courseId, newTask);
        },
        [store],
    );

    const updateTaskStatus = useCallback(
        async (taskId: string, status: StatusTask) => {
            return store.updateTaskStatus(taskId, status);
        },
        [store],
    );

    const updateTaskDueDate = useCallback(
        async (taskId: string, dueDate: Date) => {
            return store.updateTaskDueDate(taskId, dueDate);
        },
        [store],
    );

    const updateTaskField = useCallback(
        async (taskId: string, field: string, value: unknown) => {
            return store.updateTaskField(taskId, field, value);
        },
        [store],
    );

    const deleteTask = useCallback(
        async (taskId: string) => {
            return store.removeTask(taskId);
        },
        [store],
    );

    const getTask = useCallback(
        (taskId: string) => {
            return store.getTask(taskId);
        },
        [store],
    );

    const getTasksByCourse = useCallback(
        (courseId: string) => {
            return store.getTasksByCourse(courseId);
        },
        [store],
    );

    const getTasksByStatus = useCallback(
        (status: StatusTask) => {
            return store.getTasksByStatus(status);
        },
        [store],
    );

    const getTasksByDateRange = useCallback(
        (startDate: Date, endDate: Date) => {
            return store.getTasksByDateRange(startDate, endDate);
        },
        [store],
    );

    return {
        // Store state
        tasks: store.getAllTasks(),
        isLoading: store.isLoading,
        error: store.error,

        // Operations
        addTask,
        updateTaskStatus,
        updateTaskDueDate,
        updateTaskField,
        deleteTask,

        // Queries
        getTask,
        getTasksByCourse,
        getTasksByStatus,
        getTasksByDateRange,

        // Utility
        clearError: store.clearError,
        reset: store.reset,

        // Direct store access for advanced usage
        store,
    };
}

/**
 * Hook to get a single task by ID with automatic reactivity
 */
export function useTask(taskId: string | undefined): Task | undefined {
    return useTaskStore(state => (taskId ? state.getTask(taskId) : undefined));
}

/**
 * Hook to get tasks for a specific course with automatic reactivity
 */
export function useCourseTasksStore(courseId: string): Task[] {
    return useTaskStore(state => state.getTasksByCourse(courseId));
}

/**
 * Hook to get tasks by status with automatic reactivity
 */
export function useTasksByStatus(status: StatusTask): Task[] {
    return useTaskStore(state => state.getTasksByStatus(status));
}

/**
 * Hook to get all tasks with automatic reactivity
 */
export function useAllTasks(): Task[] {
    return useTaskStore(state => state.getAllTasks());
}
