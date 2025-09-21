import type { ActionButtonsProps } from '@/types/dialog/add-course-dialog';
import { Loader2, Plus, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function ActionButtons({
  currentStep,
  existingCourse,
  isCheckingExistence,
  courseCode,
  isProcessing,
  parsedData,
  createdCourseId,
  onStartParsing,
  onRetry,
  onTryDifferentCourse,
  onGoToExistingCourse,
  onDialogClose,
  onGoToCourse,
}: ActionButtonsProps) {
  // Idle state without existing course - show Cancel and Add Course buttons
  if (currentStep === 'idle' && !existingCourse) {
    return (
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => onDialogClose(false)}>
          Cancel
        </Button>
        <Button onClick={onStartParsing} disabled={!courseCode.trim() || isCheckingExistence}>
          {isCheckingExistence
            ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Checking...
              </>
            )
            : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                Add Course
              </>
            )}
        </Button>
      </div>
    );
  }

  // Idle state with existing course - show Cancel, Try Different Course, and Go to Course buttons
  if (currentStep === 'idle' && existingCourse) {
    return (
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => onDialogClose(false)}>
          Cancel
        </Button>
        <Button variant="outline" onClick={onTryDifferentCourse}>
          Try Different Course
        </Button>
        <Button onClick={onGoToExistingCourse}>
          Go to Course
        </Button>
      </div>
    );
  }

  // Error state - show Cancel, Retry, and Try Different Course buttons
  if (currentStep === 'error') {
    return (
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => onDialogClose(false)}>
          Cancel
        </Button>
        <Button variant="outline" onClick={onRetry}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry
        </Button>
        <Button variant="outline" onClick={onTryDifferentCourse}>
          Try Different Course
        </Button>
      </div>
    );
  }

  // Completed state - show Cancel and Go to Course buttons
  if (currentStep === 'completed' && parsedData && createdCourseId) {
    return (
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => onDialogClose(false)}>
          Cancel
        </Button>
        <Button onClick={onGoToCourse}>
          Go to Course
        </Button>
      </div>
    );
  }

  // Processing state - show disabled Processing button
  if (isProcessing) {
    return (
      <div className="flex justify-end gap-2">
        <Button disabled>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Processing...
        </Button>
      </div>
    );
  }

  // Default fallback - show Cancel button
  return (
    <div className="flex justify-end gap-2">
      <Button variant="outline" onClick={() => onDialogClose(false)}>
        Cancel
      </Button>
    </div>
  );
}
