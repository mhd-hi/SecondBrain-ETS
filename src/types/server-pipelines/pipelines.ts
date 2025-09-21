import type { CourseAIResponse } from '@/types/api/ai';

export type SourceResult = {
  data: string;
  logs: string[];
  metadata?: Record<string, unknown>;
};

export type DataSource = {
  name: string;
  description: string;
  fetch: (courseCode: string, term: string) => Promise<SourceResult>;
};

export type PipelineOptions = {
  courseCode: string;
  term?: string;
};

export type PipelineResult = {
  courseData: CourseAIResponse;
  steps: ProcessingStep[];
  logs: string[];
};

export type PipelineStepRequest = {
  courseCode: string;
  term?: string;
  step: 'planets' | 'openai';
  htmlData?: string;
};

export type PipelineStepResult = {
  step: ProcessingStep;
  logs: string[];
  data?: unknown;
};

export type ProcessingStep = {
  id: string;
  name: string;
  status: 'pending' | 'loading' | 'success' | 'error';
  error?: string;
  startTime?: Date | string;
  endTime?: Date | string;
  data?: unknown;
};

export type StepStatus = {
  planets: ProcessingStep;
  openai: ProcessingStep;
};
