export enum TaskStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed'
}

export enum ReviewStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected'
}

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Draft {
  id: string;
  title: string;
  notes?: string;
  week: number;
  type: string;
  estimatedEffort: string;
  suggestedDueDate: string;
  tags: string[];
  subtasks: Subtask[];
  status: TaskStatus;
  isDraft: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Task extends Omit<Draft, 'isDraft'> {
  courseId: string;
}

export interface Course {
  id: string;
  code: string;
  name: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
  tasks: Draft[];
}

export interface CourseImportResponse {
  courseCode: string;
  term: string;
  drafts: Array<{
    title: string;
    week: number;
    tags: string[];
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

export interface DraftResponse {
  data: Draft;
  error?: string;
}

export interface DraftsResponse {
  data: Draft[];
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