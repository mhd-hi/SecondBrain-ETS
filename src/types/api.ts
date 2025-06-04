import type { Task, Subtask } from './task';

type AISubtask = Pick<Subtask, 'title' | 'estimatedEffort' | 'notes'>;

export interface ParseCourseAIResponse {
  courseCode: string;
  term: string;
  tasks: Array<Omit<Task, 'id' | 'status' | 'courseId' | 'createdAt' | 'updatedAt'> & {
    subtasks?: AISubtask[];
  }>;
} 