import type { Course } from './course';
import type { Subtask } from './subtask';
import type { TaskStatus } from './task-status';

export type TaskType = 'theorie' | 'pratique' | 'exam' | 'homework' | 'lab';

export type Task = {
  id: string;
  courseId: string;
  title: string;
  notes?: string;
  week: number;
  type: TaskType;
  status: TaskStatus;
  estimatedEffort: number;
  actualEffort: number;
  subtasks?: Subtask[];
  createdAt: Date;
  updatedAt: Date;
  dueDate: Date;
  course?: Course;
};
