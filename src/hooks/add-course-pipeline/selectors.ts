import type { PipelineState, StepStatus } from './types';

export function deriveStepStatus(state: PipelineState): StepStatus {
  if (state.phase === 'error') {
    return state.stepStatus;
  }

  const status: StepStatus = {
    'planets': 'pending',
    'openai': 'pending',
    'create-course': 'pending',
    'create-tasks': 'pending',
  };

  switch (state.phase) {
    case 'idle':
    case 'checking-existence':
      break;

    case 'planets-loading':
      status.planets = 'loading';
      break;

    case 'openai-loading':
      status.planets = 'success';
      status.openai = 'loading';
      break;

    case 'create-course-loading':
      status.planets = 'success';
      status.openai = 'success';
      status['create-course'] = 'loading';
      break;

    case 'create-tasks-loading':
      status.planets = 'success';
      status.openai = 'success';
      status['create-course'] = 'success';
      status['create-tasks'] = 'loading';
      break;

    case 'completed':
      status.planets = 'success';
      status.openai = 'success';
      status['create-course'] = 'success';
      status['create-tasks'] = 'success';
      break;

    case 'skipped-pipeline-course-loading':
      status.planets = 'skipped';
      status.openai = 'skipped';
      status['create-course'] = 'loading';
      break;

    case 'skipped-pipeline-completed':
      status.planets = 'skipped';
      status.openai = 'skipped';
      status['create-course'] = 'success';
      status['create-tasks'] = 'skipped';
      break;
  }

  return status;
}

export function deriveCurrentStep(state: PipelineState): string {
  switch (state.phase) {
    case 'idle':
    case 'checking-existence':
      return 'idle';
    case 'planets-loading':
      return 'planets';
    case 'openai-loading':
      return 'openai';
    case 'create-course-loading':
    case 'skipped-pipeline-course-loading':
      return 'create-course';
    case 'create-tasks-loading':
      return 'create-tasks';
    case 'completed':
    case 'skipped-pipeline-completed':
      return 'completed';
    case 'error':
      return 'error';
  }
}

export function deriveIsProcessing(state: PipelineState): boolean {
  return (
    state.phase === 'planets-loading' ||
    state.phase === 'openai-loading' ||
    state.phase === 'create-course-loading' ||
    state.phase === 'create-tasks-loading' ||
    state.phase === 'skipped-pipeline-course-loading'
  );
}

export function deriveParsedData(state: PipelineState) {
  return state.phase === 'completed' ||
    state.phase === 'create-tasks-loading' ||
    state.phase === 'create-course-loading'
    ? state.aiData
    : null;
}

export function deriveCreatedCourseId(state: PipelineState) {
  return state.phase === 'completed' || state.phase === 'create-tasks-loading'
    ? state.courseId
    : state.phase === 'skipped-pipeline-completed'
      ? state.courseId
      : null;
}

export function deriveError(state: PipelineState) {
  return state.phase === 'error' ? state.error : null;
}
