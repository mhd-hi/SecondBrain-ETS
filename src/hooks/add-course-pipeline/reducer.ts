import type { PipelineAction, PipelineState, StepStatus } from './types';

function deriveStepStatusFromError(failedPhase: string): StepStatus {
  const status: StepStatus = {
    'planets': 'pending',
    'openai': 'pending',
    'create-course': 'pending',
    'create-tasks': 'pending',
  };

  switch (failedPhase) {
    case 'planets-loading':
      status.planets = 'error';
      status.openai = 'skipped';
      status['create-course'] = 'skipped';
      status['create-tasks'] = 'skipped';
      break;
    case 'openai-loading':
      status.planets = 'success';
      status.openai = 'error';
      status['create-course'] = 'skipped';
      status['create-tasks'] = 'skipped';
      break;
    case 'create-course-loading':
    case 'skipped-pipeline-course-loading':
      status.planets =
        failedPhase === 'create-course-loading' ? 'success' : 'skipped';
      status.openai =
        failedPhase === 'create-course-loading' ? 'success' : 'skipped';
      status['create-course'] = 'error';
      status['create-tasks'] = 'skipped';
      break;
    case 'create-tasks-loading':
      status.planets = 'success';
      status.openai = 'success';
      status['create-course'] = 'success';
      status['create-tasks'] = 'error';
      break;
  }

  return status;
}

export function pipelineReducer(
  state: PipelineState,
  action: PipelineAction,
): PipelineState {
  switch (action.type) {
    case 'START_CHECKING':
      return { phase: 'checking-existence' };

    case 'START_FULL_PIPELINE':
      return { phase: 'planets-loading' };

    case 'START_SKIP_PIPELINE':
      return { phase: 'skipped-pipeline-course-loading' };

    case 'PLANETS_SUCCESS':
      return { phase: 'openai-loading', planetsData: action.data };

    case 'OPENAI_SUCCESS':
      if (state.phase !== 'openai-loading') {
        return state;
      }
      return { phase: 'create-course-loading', aiData: action.data };

    case 'COURSE_SUCCESS':
      if (state.phase === 'create-course-loading') {
        return {
          phase: 'create-tasks-loading',
          courseId: action.courseId,
          aiData: state.aiData,
        };
      }
      return state;

    case 'TASKS_SUCCESS':
      if (state.phase !== 'create-tasks-loading') {
        return state;
      }
      return {
        phase: 'completed',
        courseId: state.courseId,
        aiData: state.aiData,
      };

    case 'SKIP_COURSE_SUCCESS':
      return {
        phase: 'skipped-pipeline-completed',
        courseId: action.courseId,
      };

    case 'ERROR': {
      const stepStatus = deriveStepStatusFromError(action.currentPhase);
      return {
        phase: 'error',
        failedPhase: action.currentPhase,
        error: action.error,
        stepStatus,
      };
    }

    case 'RESET':
      return { phase: 'idle' };

    case 'RETRY':
      return { phase: 'idle' };

    default:
      return state;
  }
}
