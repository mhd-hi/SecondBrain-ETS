import type { Subtask } from '@/types/subtask';
import type { Task } from '@/types/task';

export type NewTaskInput = Omit<Task, 'id' | 'courseId'> & {
    subtasks?: Subtask[];
    notes?: string;
    dueDate?: string;
};

export type UpdateTaskInput = Partial<Omit<Task, 'id' | 'courseId'>> & {
    subtasks?: Subtask[];
    notes?: string;
};
