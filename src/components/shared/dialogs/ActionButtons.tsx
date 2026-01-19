import type { ActionButtonsProps } from '@/types/dialog/add-course-dialog';
import { Loader2, Plus, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function ActionButtons({
  currentStep,
  existingCourse,
  isCheckingExistence,
  courseCode,
  isProcessing,
  createdCourseId,
  onStartParsing,
  onRetry,
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
        <Button
          onClick={onStartParsing}
          // No longer disable for userContext over limit
          disabled={!courseCode.trim() || isCheckingExistence}
        >
          {isCheckingExistence
? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Checking...
            </>
          )
: (
            <>
              <Plus className="mr-2 h-4 w-4" />
              Add Course
            </>
          )}
        </Button>
      </div>
    );
  }

  // Idle state with existing course - show Cancel, and Go to Course buttons
  if (currentStep === 'idle' && existingCourse) {
    return (
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => onDialogClose(false)}>
          Cancel
        </Button>
        <Button onClick={onGoToExistingCourse}>Go to Course</Button>
      </div>
    );
  }

  // Error state
  if (currentStep === 'error') {
    return (
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => onDialogClose(false)}>
          Cancel
        </Button>
        <Button variant="outline" onClick={onRetry}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Retry
        </Button>
      </div>
    );
  }

  // Completed state - show Cancel and Go to Course buttons
  if (currentStep === 'completed' && createdCourseId) {
    return (
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => onDialogClose(false)}>
          Cancel
        </Button>
        <Button onClick={onGoToCourse}>Go to Course</Button>
      </div>
    );
  }

  // Processing state - show disabled Processing button
  if (isProcessing) {
    return (
      <div className="flex justify-end gap-2">
        <Button disabled>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
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
