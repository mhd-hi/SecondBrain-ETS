import type { Subtask, TaskStatus } from "./task";

export interface Task {
  id: string;
  title: string;
  notes?: string;
  week: number;
  type: 'theorie' | 'pratique' | 'exam' | 'homework' | 'lab';
  estimatedEffort: number;
  subtasks?: Subtask[];
  status: TaskStatus;
  courseId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Course {
  id: string;
  code: string;
  name: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
  tasks: Task[];
}

export interface CourseImportResponse {
  courseCode: string;
  term: string;
  tasks: Array<{
    title: string;
    week: number;
    type: 'theorie' | 'pratique' | 'exam' | 'homework' | 'lab';
    subtasks?: Subtask[];
  }>;
}

export interface CourseCreateRequest {
  code: string;
  name: string;
  description: string;
}

export interface CourseCreateResponse {
  id: string;
  code: string;
  name: string;
  description: string;
}

// API Response Types
export interface CourseResponse {
  data: Course;
  error?: string;
}

export interface TaskResponse {
  data: Task;
  error?: string;
}

export interface TasksResponse {
  data: Task[];
  error?: string;
}

// Error Types
export interface ApiError {
  error: string;
} 