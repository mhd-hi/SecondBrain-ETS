import type { StatusTask } from '@/types/status-task';

export type Subtask = {
    id: string;
    title: string;
    status: StatusTask;
    notes?: string;
    estimatedEffort?: number;
};
