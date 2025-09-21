import type { Course } from './course';
import type { StatusTask } from './status-task';
import type { Subtask } from './subtask';

export type TaskType = 'theorie' | 'pratique' | 'exam' | 'homework' | 'lab';

export type Task = {
  id: string;
  courseId: string;
  title: string;
  notes?: string;
  week: number;
  type: TaskType;
  status: StatusTask;
  estimatedEffort: number;
  actualEffort: number;
  subtasks?: Subtask[];
  createdAt: Date;
  updatedAt: Date;
  dueDate: Date;
  course?: Course;
};
