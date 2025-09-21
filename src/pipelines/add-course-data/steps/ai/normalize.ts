import type { AITask } from '@/types/api/ai';
import type { Subtask } from '@/types/subtask';
import type { Task, TaskType } from '@/types/task';
import { StatusTask } from '@/types/status-task';

export function normalizeTasks(raw: AITask[]): Array<Omit<Task, 'id' | 'courseId'>> {
    return raw.map((item) => {
        const week = Number(item.week ?? 0) || 0;
        const type = (item.type ?? 'theorie') as TaskType;
        const title = String(item.title ?? '').trim();
        const notes = item.notes ? String(item.notes) : undefined;
        const estimatedEffort = typeof item.estimatedEffort === 'number' ? item.estimatedEffort : Number(item.estimatedEffort) || 0;
        const subtasks: Subtask[] | undefined = Array.isArray(item.subtasks)
            ? item.subtasks.map(st => ({
                id: crypto.randomUUID(),
                title: String(st.title ?? ''),
                status: StatusTask.TODO,
                notes: st.notes ? String(st.notes) : undefined,
                estimatedEffort: typeof st.estimatedEffort === 'number' ? st.estimatedEffort : Number(st.estimatedEffort) || undefined,
            }))
            : undefined;

        const task: Omit<Task, 'id' | 'courseId'> = {
            title,
            notes,
            week,
            type,
            status: StatusTask.TODO,
            estimatedEffort,
            actualEffort: 0,
            subtasks,
            createdAt: new Date(),
            updatedAt: new Date(),
            dueDate: new Date(),
        };

        return task;
    });
}

export default normalizeTasks;
