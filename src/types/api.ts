import type { Task, TaskType } from './task';

export interface AISubtask {
  title: string;
  estimatedEffort?: number;
  notes?: string;
}

export interface AITask {
  week: number;
  type: TaskType;
  title: string;
  notes?: string;
  estimatedEffort: number;
  subtasks?: AISubtask[];
}

export interface CourseAIResponse {
  courseCode: string;
  term: string;
  tasks: AITask[];
}

export interface ParseCourseAIResponse {
  courseCode: string;
  term: string;
  tasks: Array<Omit<Task, 'id' | 'status' | 'courseId' | 'createdAt' | 'updatedAt'> & {
    subtasks?: AISubtask[];
  }>;
} 