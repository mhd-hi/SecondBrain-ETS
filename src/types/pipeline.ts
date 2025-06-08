/**
 * Shared types for the course processing pipeline
 * Used by both client and server-side implementations
 */

import type { CourseAIResponse } from '@/types/api';

export interface ProcessingStep {
  id: string;
  name: string;
  status: 'pending' | 'loading' | 'success' | 'error';
  error?: string;
  startTime?: Date | string;
  endTime?: Date | string;
  data?: unknown;
}

export interface PipelineOptions {
  courseCode: string;
  term?: string;
}

export interface PipelineResult {
  courseData: CourseAIResponse;
  steps: ProcessingStep[];
  logs: string[];
}

export interface SourceResult {
  data: string;
  logs: string[];
  metadata?: Record<string, unknown>;
}

export interface DataSource {
  name: string;
  description: string;
  fetch: (courseCode: string, term?: string) => Promise<SourceResult>;
}

/**
 * API types for step-by-step processing
 */
export interface PipelineStepRequest {
  courseCode: string;
  term?: string;
  step: 'planets' | 'openai';
  htmlData?: string;
}

export interface PipelineStepResult {
  step: ProcessingStep;
  logs: string[];
  data?: unknown;
}

/**
 * Status tracking for independent steps
 */
export interface StepStatus {
  planets: ProcessingStep;
  openai: ProcessingStep;
}
