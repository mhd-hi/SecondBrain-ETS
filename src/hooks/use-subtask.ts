import type React from 'react';
import type { Task, TaskStatus } from '@/types/task';
import { api } from '@/lib/api/util';
import { ErrorHandlers } from '@/lib/error/util';

/**
 * Updates the status of a subtask for a given task.
 * @param tasks Current list of tasks
 * @param setTasks State setter for tasks
 * @returns Function to update subtask status
 */
export function updateSubtaskStatus(
    tasks: Task[],
    setTasks: React.Dispatch<React.SetStateAction<Task[]>>,
) {
    return async (taskId: string, subtaskId: string, newStatus: TaskStatus) => {
        try {
            const currentTask = tasks.find((task: Task) => task.id === taskId);
            if (!currentTask?.subtasks) {
                return;
            }

            const updatedSubtasks = currentTask.subtasks.map((subtask: any) =>
                subtask.id === subtaskId
                    ? { ...subtask, status: newStatus }
                    : subtask,
            );

            await api.patch(`/api/tasks/${taskId}`, { subtasks: updatedSubtasks });

            setTasks((prevTasks: Task[]) =>
                prevTasks.map((task: Task) =>
                    task.id === taskId
                        ? { ...task, subtasks: updatedSubtasks }
                        : task,
                ),
            );
        } catch (error) {
            ErrorHandlers.api(error, 'Failed to update subtask status');
        }
    };
}
