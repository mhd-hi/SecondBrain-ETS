import type {
  ProcessingStepsProps,
  StepName,
} from '@/types/dialog/add-course-dialog';
import {
  AlertCircle,
  CheckCircle,
  Database,
  Loader2,
  MinusCircle,
} from 'lucide-react';
import Image from 'next/image';

export function ProcessingSteps({
  currentStep,
  stepStatus,
}: ProcessingStepsProps) {
  const getStepIcon = (stepName: StepName) => {
    if (stepName === 'planets') {
      return '/assets/logo_planets.png';
    }
    if (stepName === 'ai') {
      return '/assets/logo_openai.png';
    }
    if (stepName === 'create-course') {
      return '/favicon-16x16.png';
    }
    if (stepName === 'create-tasks') {
      return '/favicon-16x16.png';
    }
    return '/favicon-16x16.png';
  };

  const getStepLabel = (stepName: StepName) => {
    if (stepName === 'planets') {
      return 'Fetch Course Data';
    }
    if (stepName === 'ai') {
      return 'Parse with AI';
    }
    if (stepName === 'create-course') {
      return 'Create Course';
    }
    if (stepName === 'create-tasks') {
      return 'Create Tasks';
    }
    return stepName;
  };

  const renderStepIndicator = (stepName: StepName) => {
    const logo = getStepIcon(stepName);
    const label = getStepLabel(stepName);
    const status = stepStatus[stepName];

    const isDatabaseStep =
      stepName === 'create-course' || stepName === 'create-tasks';

    return (
      <div
        key={stepName}
        className="bg-card flex items-center gap-3 rounded-lg border p-3"
      >
        <div className="relative shrink-0">
          {isDatabaseStep
? (
            <div
              className={`bg-muted flex h-12 w-12 items-center justify-center rounded border ${status === 'loading' ? 'animate-pulse' : ''}`}
            >
              <Database className="text-muted-foreground h-6 w-6" />
            </div>
          )
: (
            <div
              className={`bg-muted flex h-12 w-12 items-center justify-center rounded border p-2 ${status === 'loading' ? 'animate-pulse' : ''}`}
            >
              <Image
                src={logo}
                alt={`${label} logo`}
                width={32}
                height={32}
                className="rounded object-contain"
              />
            </div>
          )}
          {status === 'loading' && (
            <div className="bg-background/80 absolute inset-0 flex items-center justify-center rounded">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          )}
          {status === 'success' && (
            <div className="absolute -top-1 -right-1 rounded-full bg-green-500 p-1">
              <CheckCircle className="h-4 w-4 text-white" />
            </div>
          )}
          {status === 'error' && (
            <div className="absolute -top-1 -right-1 rounded-full bg-red-500 p-1">
              <AlertCircle className="h-4 w-4 text-white" />
            </div>
          )}
          {status === 'skipped' && (
            <div className="absolute -top-1 -right-1 rounded-full bg-gray-400 p-1">
              <MinusCircle className="h-4 w-4 text-white" />
            </div>
          )}
        </div>

        <div className="flex-1">
          <div className="text-sm font-medium">{label}</div>
          <div className="text-muted-foreground text-xs">
            {status === 'pending' && 'Waiting...'}
            {status === 'loading' && 'Processing...'}
            {status === 'success' && 'Completed'}
            {status === 'error' && 'Failed'}
            {status === 'skipped' && 'Skipped'}
          </div>
        </div>
      </div>
    );
  };

  const showSteps = currentStep !== 'idle';

  if (!showSteps) {
    return null;
  }

  return (
    <div className="space-y-3">
      <div className="text-sm font-medium">Processing steps:</div>
      {renderStepIndicator('planets')}
      {renderStepIndicator('ai')}
      {renderStepIndicator('create-course')}
      {renderStepIndicator('create-tasks')}
    </div>
  );
}
