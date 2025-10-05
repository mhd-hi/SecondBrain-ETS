import type { TaskType } from '@/types/task';

export type AISubtask = {
  title: string;
  estimatedEffort?: number;
  notes?: string;
};

export type AITask = {
  week: number;
  type: TaskType;
  title: string;
  notes?: string;
  estimatedEffort: number;
  subtasks?: AISubtask[];
};

export type CourseAIResponse = {
  courseCode: string;
  term: string;
  tasks: AITask[];
};
