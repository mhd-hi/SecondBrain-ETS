import type { Task } from "./task";

export interface Course {
  id: string;
  code: string;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  tasks?: Task[];
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