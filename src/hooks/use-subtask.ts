import type { StatusTask } from '@/types/status-task';
import type { Subtask } from '@/types/subtask';
import { api } from '@/lib/api/util';
import { ErrorHandlers } from '@/lib/error/util';

export async function createSubtask(taskId: string, payload: {
    title: string;
    notes: string;
    estimatedEffort: number;
    status: StatusTask;
}): Promise<Subtask | null> {
    try {
        const created = await api.post(`/api/tasks/${taskId}/subtasks`, payload);
        return created as Subtask;
    } catch (error) {
        ErrorHandlers.api(error, 'Failed to create subtask');
        return null;
    }
}

export async function deleteSubtask(taskId: string, subtaskId: string): Promise<boolean> {
    try {
        await api.delete(`/api/tasks/${taskId}/subtasks/${subtaskId}`);
        return true;
    } catch (error) {
        ErrorHandlers.api(error, 'Failed to delete subtask');
        return false;
    }
}
