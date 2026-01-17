import type { CourseAIResponse } from '@/types/api/ai';

export type StepStatus = {
  'planets': 'pending' | 'loading' | 'success' | 'error' | 'skipped';
  'openai': 'pending' | 'loading' | 'success' | 'error' | 'skipped';
  'create-course': 'pending' | 'loading' | 'success' | 'error' | 'skipped';
  'create-tasks': 'pending' | 'loading' | 'success' | 'error' | 'skipped';
};

export type PipelineState =
  | { phase: 'idle' }
  | { phase: 'checking-existence' }
  | { phase: 'planets-loading' }
  | { phase: 'openai-loading'; planetsData: string }
  | { phase: 'create-course-loading'; aiData: CourseAIResponse }
  | {
    phase: 'create-tasks-loading';
    courseId: string;
    aiData: CourseAIResponse;
  }
  | { phase: 'completed'; courseId: string; aiData: CourseAIResponse | null }
  | { phase: 'skipped-pipeline-course-loading' }
  | { phase: 'skipped-pipeline-completed'; courseId: string }
  | {
    phase: 'error';
    failedPhase: string;
    error: string;
    stepStatus: StepStatus;
  };

export type PipelineAction =
  | { type: 'START_CHECKING' }
  | { type: 'START_FULL_PIPELINE' }
  | { type: 'START_SKIP_PIPELINE' }
  | { type: 'PLANETS_SUCCESS'; data: string }
  | { type: 'OPENAI_SUCCESS'; data: CourseAIResponse }
  | { type: 'COURSE_SUCCESS'; courseId: string }
  | { type: 'TASKS_SUCCESS' }
  | { type: 'SKIP_COURSE_SUCCESS'; courseId: string }
  | { type: 'ERROR'; error: string; currentPhase: string }
  | { type: 'RESET' }
  | { type: 'RETRY' };
