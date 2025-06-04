import type { Task, Subtask } from "./task";

export type AISubtask = Pick<Subtask, 'title' | 'estimatedEffort' | 'notes'>;

export interface Course {
  id: string;
  code: string;
  name: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
  tasks: Task[];
}

export interface CourseAIResponse {
  courseCode: string;
  term: string;
  tasks: Array<Omit<Task, 'id' | 'status' | 'courseId' | 'createdAt' | 'updatedAt'> & {
    subtasks?: AISubtask[];
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