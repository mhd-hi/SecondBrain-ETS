import type { Course } from "./course";

export enum TaskStatus {
  DRAFT = "DRAFT",
  TODO = "TODO",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED"
}

export type TaskType = "theorie" | "pratique" | "exam" | "homework" | "lab";

export interface Subtask {
  id: string;
  title: string;
  status: TaskStatus;
  notes?: string;
  estimatedEffort?: number;
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
  actualEffort: number;
  subtasks?: Subtask[];
  createdAt: Date;
  updatedAt: Date;
  dueDate: Date;
  course?: Course;
}
