export type TaskType = 'theorie' | 'pratique' | 'exam' | 'homework' | 'lab';

export enum TaskStatus {
  DRAFT = 'DRAFT',
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED'
}

export interface Task {
  id: string;
  courseId: string;
  title: string;
  notes?: string;
  week: number;
  type: TaskType;
  status: TaskStatus;
  estimatedEffort: number;
  subtasks?: Subtask[];
  createdAt: Date;
  updatedAt: Date;
  tags?: string[];
  dueDate: Date;
}

export interface Subtask {
  id: string;
  title: string;
  status: TaskStatus;
  notes?: string;
  estimatedEffort?: number;
}
