import type { TaskStatus } from '@/types/task-status';

export type Subtask = {
    id: string;
    title: string;
    status: TaskStatus;
    notes?: string;
    estimatedEffort?: number;
};
