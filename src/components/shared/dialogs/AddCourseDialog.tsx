'use client';

import { AlertCircle, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useCoursesContext } from '@/contexts/use-courses';
import { useAddCourse } from '@/hooks/use-add-course';
import { useTerms } from '@/hooks/use-terms';
import { isValidCourseCode, normalizeCourseCode } from '@/lib/course/util';
import { isValidTermId } from '@/lib/term/util';
import { PipelineErrorHandlers } from '@/lib/utils/error';
import { ActionButtons } from './ActionButtons';
import { CourseInputForm } from './CourseInputForm';
import { ProcessingSteps } from './ProcessingSteps';

type AddCourseDialogProps = {
  onCourseAdded?: () => void;
  trigger?: React.ReactNode;
};

export function AddCourseDialog({ onCourseAdded, trigger }: AddCourseDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [courseCode, setCourseCode] = useState('');
  const [term, setTerm] = useState<string>('');
  const [availableTerms, setAvailableTerms] = useState<Array<{ id: string; label: string }>>([]);
  const { terms: _fetchedTerms, loading: _termsLoading, error: _termsError, fetchTerms } = useTerms();

  const { refreshCourses } = useCoursesContext();

  const {
    currentStep,
    stepStatus,
    parsedData,
    createdCourseId,
    error,
    isProcessing,
    startProcessing,
    retry,
    reset,
  } = useAddCourse();
  const router = useRouter();

  const resetDialog = useCallback(() => {
    setCourseCode('');
    reset();
  }, [reset]);

  // Automatically refresh courses when course creation is completed
  useEffect(() => {
    if (currentStep === 'completed' && createdCourseId) {
      // Refresh global courses state immediately
      void refreshCourses();
      // Also call the local callback if provided
      if (onCourseAdded) {
        onCourseAdded();
      }
    }
  }, [currentStep, createdCourseId, refreshCourses, onCourseAdded]);

  const handleDialogClose = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      // Small delay to ensure dialog is properly closed before reset
      setTimeout(() => {
        resetDialog();
      }, 100);
    }
  };

  const handleStartParsing = async () => {
    if (!courseCode.trim()) {
      toast.error('Please enter a course code');
      return;
    }

    const cleanCode = normalizeCourseCode(courseCode);

    // Validate course code format
    if (!isValidCourseCode(cleanCode)) {
      toast.error('Invalid course code format. Please use format like MAT145 or LOG210');
      return;
    }

    // Course doesn't exist, proceed with normal processing
    if (!term) {
      toast.error('Please select a term');
      return;
    }

    let termToUse = term;
    if (!isValidTermId(termToUse)) {
      // Try light normalization: remove leading zeros and test again
      const cleaned = termToUse.replace(/^0+/, '');
      if (isValidTermId(cleaned)) {
        termToUse = cleaned;
      } else {
        toast.error('Selected term id looks invalid. Please pick a valid term.');
        return;
      }
    }

    await startProcessing(cleanCode, termToUse);
  };

  const handleRetry = () => {
    retry();
  };
  const handleTryDifferentCourse = () => {
    resetDialog();
  };

  const handleGoToCourse = () => {
    const courseId = createdCourseId;
    handleDialogClose(false);
    // Use setTimeout to ensure dialog state is reset before navigation
    setTimeout(() => {
      router.push(`/courses/${courseId}`);
    }, 0);
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (open) {
          // Reset dialog state when opening
          resetDialog();
          // Fetch available terms (previous, current, next) so we can populate the dropdown
          (async () => {
            try {
              const got = await fetchTerms();
              setAvailableTerms(got);
              // default term to current session (middle item) if present (prev/current/next)
              const middle = got.length === 3 ? got[1] : got[Math.floor(got.length / 2)];
              if (middle) {
                setTerm(middle.id);
              }
            } catch (err) {
              console.error('Failed to fetch terms:', err);
            }
          })();
        }
        handleDialogClose(open);
      }}
    >
      <DialogTrigger asChild>
        {trigger ?? (
          <Button>
            <Plus className="h-4 w-4 mr-2 rounded-sm" />
            Add Course
          </Button>
        )}
      </DialogTrigger>
      <DialogContent
        className="sm:max-w-md"
        aria-describedby="add-course-description"
      >
        <DialogHeader>
          <DialogTitle>Add New Course</DialogTitle>
          <DialogDescription id="add-course-description">
            Enter a course code to automatically fetch its syllabus data and generate a structured learning plan.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {/* Course Code Input */}
          <CourseInputForm
            courseCode={courseCode}
            setCourseCode={setCourseCode}
            term={term}
            setTerm={setTerm}
            availableTerms={availableTerms}
            isProcessing={isProcessing}
            currentStep={currentStep}
            onSubmit={handleStartParsing}
          />

          {/* Processing Steps */}
          <ProcessingSteps currentStep={currentStep} stepStatus={stepStatus} />

          {/* Success Display */}
          {currentStep === 'completed' && parsedData && createdCourseId && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Course Created Successfully!</AlertTitle>
              <AlertDescription>
                AI-generated tasks have been created. Please review the tasks and adjust them as needed.
              </AlertDescription>
            </Alert>
          )}

          {/* Error Display */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                {PipelineErrorHandlers.getSafeErrorMessage(error)}
              </AlertDescription>
            </Alert>
          )}

          {/* Action Buttons */}
          <ActionButtons
            currentStep={currentStep}
            existingCourse={null}
            isCheckingExistence={false}
            courseCode={courseCode}
            isProcessing={isProcessing}
            parsedData={parsedData}
            createdCourseId={createdCourseId}
            onStartParsing={handleStartParsing}
            onRetry={handleRetry}
            onTryDifferentCourse={handleTryDifferentCourse}
            onGoToExistingCourse={() => {}} // No longer needed since existence check is in pipeline
            onDialogClose={handleDialogClose}
            onGoToCourse={handleGoToCourse}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
