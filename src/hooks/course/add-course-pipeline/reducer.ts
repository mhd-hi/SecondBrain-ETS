import type { PipelineAction, PipelineState, StepStatus } from './types';

function deriveStepStatusFromError(failedPhase: string): StepStatus {
  const status: StepStatus = {
    'planets': 'pending',
    'ai': 'pending',
    'create-course': 'pending',
    'create-tasks': 'pending',
  };

  switch (failedPhase) {
    case 'planets-loading':
      status.planets = 'error';
      status.ai = 'skipped';
      status['create-course'] = 'skipped';
      status['create-tasks'] = 'skipped';
      break;
    case 'ai-loading':
      status.planets = 'success';
      status.ai = 'error';
      status['create-course'] = 'skipped';
      status['create-tasks'] = 'skipped';
      break;
    case 'create-course-loading':
    case 'skipped-pipeline-course-loading':
      status.planets =
        failedPhase === 'create-course-loading' ? 'success' : 'skipped';
      status.ai =
        failedPhase === 'create-course-loading' ? 'success' : 'skipped';
      status['create-course'] = 'error';
      status['create-tasks'] = 'skipped';
      break;
    case 'create-tasks-loading':
      status.planets = 'success';
      status.ai = 'success';
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
      return { phase: 'ai-loading', planetsData: action.data };

    case 'AI_SUCCESS':
      if (state.phase !== 'ai-loading') {
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
