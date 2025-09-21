import type { CourseExistenceAlertProps } from './AddCourseDialog.types';
import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export function CourseExistenceAlert({
  isCheckingExistence,
  existingCourse,
  hasCheckedExistence,
  currentStep,
  parsedData,
}: CourseExistenceAlertProps) {
  // Only show alerts when we've completed processing or are in idle state after existence check
  const shouldShow = currentStep === 'completed' || (currentStep === 'idle' && hasCheckedExistence);

  if (!shouldShow) {
    return null;
  }

  if (isCheckingExistence) {
    return (
      <Alert>
        <Loader2 className="h-4 w-4 animate-spin" />
        <AlertDescription>
          Checking if course already exists...
        </AlertDescription>
      </Alert>
    );
  }

  if (existingCourse) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>
          The course
          {' '}
          <strong>{existingCourse.code}</strong>
          {' '}
          has already been added.
        </AlertTitle>
        <AlertDescription>
          Please remove it first if you want to re-add it.
        </AlertDescription>
      </Alert>
    );
  }

  if (hasCheckedExistence && currentStep === 'idle') {
    return null;
  }

  if (currentStep === 'completed') {
    return (
      <Alert>
        <CheckCircle className="h-4 w-4" />
        <AlertTitle>
          Course
          {' '}
          {parsedData?.courseCode}
          {' '}
          has been created with
          {' '}
          {parsedData?.tasks?.length ?? 0}
          {' '}
          tasks.
        </AlertTitle>
        <AlertDescription className="mt-2">
          Please review the generated tasks to make sure they match your course plan.
        </AlertDescription>
      </Alert>
    );
  }

  return null;
}
