export type TaskType = 'theorie' | 'pratique' | 'exam' | 'homework' | 'lab';

export enum TaskStatus {
  DRAFT = 'DRAFT',
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED'
}

export interface Task {
  id: string;
  courseId: string;
  title: string;
  week: number;
  type: TaskType;
  status: TaskStatus;
  estimatedEffort?: number;
  notes?: string;
  subtasks?: Subtask[];
}

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
  notes?: string;
  estimatedEffort?: number;
}
