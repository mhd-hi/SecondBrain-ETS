export type TaskType = 'theorie' | 'pratique' | 'exam' | 'homework' | 'lab';

export enum TaskStatus {
  DRAFT = 'DRAFT',
  IN_PROGRESS = 'IN_PROGRESS',
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
  updatedAt?: Date;
}

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
  notes?: string;
  estimatedEffort?: number;
}
