import type { ProcessingStepsProps, StepName } from './AddCourseDialog.types';
import { AlertCircle, CheckCircle, Database, Loader2 } from 'lucide-react';
import Image from 'next/image';

export function ProcessingSteps({ currentStep, stepStatus }: ProcessingStepsProps) {
  const getStepIcon = (stepName: StepName) => {
    if (stepName === 'planets') {
      return '/assets/logo_planets.png';
    }
    if (stepName === 'openai') {
      return '/assets/logo_openai.png';
    }
    if (stepName === 'create-course') {
      return '/favicon-16x16.png';
    }
    if (stepName === 'create-tasks') {
      return '/favicon-16x16.png';
    }
    return '/favicon-16x16.png'; // Default fallback
  };

  const getStepLabel = (stepName: StepName) => {
    if (stepName === 'planets') {
      return 'Fetch Course Data';
    }
    if (stepName === 'openai') {
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

    const isDatabaseStep = stepName === 'create-course' || stepName === 'create-tasks';

    return (
      <div key={stepName} className="flex items-center gap-3 p-3 rounded-lg border bg-card">
        <div className="relative flex-shrink-0">
          {isDatabaseStep
            ? (
              <div className={`w-12 h-12 rounded border flex items-center justify-center bg-muted ${status === 'loading' ? 'animate-pulse' : ''}`}>
                <Database className="h-6 w-6 text-muted-foreground" />
              </div>
            )
            : (
              <div className={`w-12 h-12 rounded border flex items-center justify-center bg-muted p-2 ${status === 'loading' ? 'animate-pulse' : ''}`}>
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
            <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          )}
          {status === 'success' && (
            <div className="absolute -top-1 -right-1 bg-green-500 rounded-full p-1">
              <CheckCircle className="h-4 w-4 text-white" />
            </div>
          )}
          {status === 'error' && (
            <div className="absolute -top-1 -right-1 bg-red-500 rounded-full p-1">
              <AlertCircle className="h-4 w-4 text-white" />
            </div>
          )}
        </div>

        <div className="flex-1">
          <div className="font-medium text-sm">{label}</div>
          <div className="text-xs text-muted-foreground">
            {status === 'pending' && 'Waiting...'}
            {status === 'loading' && 'Processing...'}
            {status === 'success' && 'Completed'}
            {status === 'error' && 'Failed'}
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
      {renderStepIndicator('openai')}
      {renderStepIndicator('create-course')}
      {renderStepIndicator('create-tasks')}
    </div>
  );
}
