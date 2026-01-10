import type { Course } from './course';
import type { StatusTask } from './status-task';
import type { Subtask } from './subtask';

export type TaskType = 'theorie' | 'pratique' | 'exam' | 'homework' | 'lab';

export const TASK_TYPES = {
  THEORIE: 'theorie',
  PRATIQUE: 'pratique',
  EXAM: 'exam',
  HOMEWORK: 'homework',
  LAB: 'lab',
} as const;

export const TASK_TYPE_OPTIONS = [
  { label: 'Théorie', value: 'theorie' },
  { label: 'Pratique', value: 'pratique' },
  { label: 'Exam', value: 'exam' },
  { label: 'Devoir', value: 'homework' },
  { label: 'Lab', value: 'lab' },
];

export type Task = {
  id: string;
  courseId: string;
  title: string;
  notes?: string;
  type: TaskType;
  status: StatusTask;
  estimatedEffort: number;
  actualEffort: number;
  subtasks?: Subtask[];
  createdAt?: Date;
  updatedAt?: Date;
  dueDate: Date;
  course: Course;
};
