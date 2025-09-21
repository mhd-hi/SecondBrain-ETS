'use client';

import { AlertCircle, CheckCircle, Database, Loader2, Plus, RefreshCw } from 'lucide-react';
import Image from 'next/image';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCourses } from '@/contexts/use-courses';
import { useAddCourse } from '@/hooks/use-add-course';
import { checkCourseExists } from '@/hooks/use-course';
import { useTerms } from '@/hooks/use-terms';
import { isValidCourseCode, normalizeCourseCode } from '@/lib/course/util';
import { PipelineErrorHandlers } from '@/lib/error/util';

type AddCourseDialogProps = {
  onCourseAdded?: () => void;
  trigger?: React.ReactNode;
};

export function AddCourseDialog({ onCourseAdded, trigger }: AddCourseDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [courseCode, setCourseCode] = useState('');
  const [term, setTerm] = useState<string>('');
  const [existingCourse, setExistingCourse] = useState<{ id: string; code: string; name: string } | null>(null);
  const [availableTerms, setAvailableTerms] = useState<Array<{ id: string; label: string }>>([]);
  const { terms: _fetchedTerms, loading: _termsLoading, error: _termsError, fetchTerms } = useTerms();
  const [isCheckingExistence, setIsCheckingExistence] = useState(false);
  const [hasCheckedExistence, setHasCheckedExistence] = useState(false);

  const { refreshCourses } = useCourses();

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
    setExistingCourse(null);
    setHasCheckedExistence(false);
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

  const checkCourseExistence = async (courseCode: string) => {
    setIsCheckingExistence(true);
    try {
      const cleanCode = normalizeCourseCode(courseCode);
      // Validate course code format client-side for better UX
      if (!isValidCourseCode(cleanCode)) {
        toast.error('Invalid course code format. Please use format like MAT145 or LOG210');
        setHasCheckedExistence(true);
        return;
      }

      const result = await checkCourseExists(cleanCode, term);
      setExistingCourse(result.course ?? null);
      setHasCheckedExistence(true);
    } catch (err) {
      console.error('Failed to check course existence:', err);
      // Don't show error to user as this is not critical
    } finally {
      setIsCheckingExistence(false);
    }
  };
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

    setExistingCourse(null); // Reset existence check
    setHasCheckedExistence(false);

    // Check if course already exists
    await checkCourseExistence(cleanCode);

    // If a course was found, don't proceed with processing
    if (existingCourse) {
      return;
    }

    // Course doesn't exist, proceed with normal processing
    const TERM_ID_RE = /^\d{4}[1-3]$/;
    if (!term) {
      toast.error('Please select a term');
      return;
    }

    let termToUse = term;
    if (!TERM_ID_RE.test(termToUse)) {
      // Try light normalization: remove leading zeros and test again
      const cleaned = termToUse.replace(/^0+/, '');
      if (TERM_ID_RE.test(cleaned)) {
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
  const handleGoToExistingCourse = () => {
    if (existingCourse) {
      handleDialogClose(false);
      router.push(`/courses/${existingCourse.id}`);
    }
  };
  const getStepIcon = (stepName: 'planets' | 'openai' | 'create-course' | 'create-tasks') => {
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

  const getStepLabel = (stepName: 'planets' | 'openai' | 'create-course' | 'create-tasks') => {
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

  const renderStepIndicator = (stepName: 'planets' | 'openai' | 'create-course' | 'create-tasks') => {
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
          <form onSubmit={(e) => {
            e.preventDefault();
            if (currentStep === 'idle' && courseCode.trim()) {
              void handleStartParsing();
            }
          }}
          >
            <div className="space-y-2">
              <Label htmlFor="courseCode">Course code: </Label>
              <div className="flex gap-2">
                <Input
                  id="courseCode"
                  value={courseCode}
                  onChange={(e) => {
                    const value = e.target.value.toUpperCase();
                    // Limit length to prevent excessively long inputs
                    if (value.length <= 10) {
                      setCourseCode(value);
                    }
                  }}
                  placeholder="(e.g. MAT145, LOG210)"
                  disabled={isProcessing}
                  maxLength={10}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && currentStep === 'idle' && courseCode.trim()) {
                      e.preventDefault();
                      void handleStartParsing();
                    }
                  }}
                />
                <select
                  aria-label="Term"
                  value={term}
                  onChange={e => setTerm(e.target.value)}
                  className="px-2 py-1 rounded border bg-white"
                  disabled={isProcessing}
                >
                  {availableTerms.length > 0 && (
                    availableTerms.map(t => (
                      <option key={t.id} value={t.id}>{t.label}</option>
                    ))
                  )}
                </select>
              </div>
            </div>
          </form>
          {/* Processing Steps */}
          {showSteps && (
            <div className="space-y-3">
              <div className="text-sm font-medium">Processing steps:</div>
              {renderStepIndicator('planets')}
              {renderStepIndicator('openai')}
              {renderStepIndicator('create-course')}
              {renderStepIndicator('create-tasks')}
            </div>
          )}
          {/* Course Existence Check */}
          {(currentStep === 'completed' || (currentStep === 'idle' && hasCheckedExistence)) && (
            <div className="space-y-3">
              {isCheckingExistence
                ? (
                  <Alert>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <AlertDescription>
                      Checking if course already exists...
                    </AlertDescription>
                  </Alert>
                )
                : existingCourse
                  ? (
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
                  )
                  : hasCheckedExistence && currentStep === 'idle'
                    ? <></>
                    : currentStep === 'completed' && (
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
                    )}
            </div>
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
          <div className="flex justify-end gap-2">
            {currentStep === 'idle' && !existingCourse && (
              <>
                <Button variant="outline" onClick={() => handleDialogClose(false)}>
                  Cancel
                </Button>
                <Button onClick={handleStartParsing} disabled={!courseCode.trim() || isCheckingExistence}>
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
              </>
            )}

            {currentStep === 'idle' && existingCourse && (
              <>
                <Button variant="outline" onClick={() => handleDialogClose(false)}>
                  Cancel
                </Button>
                <Button variant="outline" onClick={handleTryDifferentCourse}>
                  Try Different Course
                </Button>
                <Button onClick={handleGoToExistingCourse}>
                  Go to Course
                </Button>
              </>
            )}

            {currentStep === 'error' && (
              <>
                <Button variant="outline" onClick={() => handleDialogClose(false)}>
                  Cancel
                </Button>
                <Button variant="outline" onClick={handleRetry}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Retry
                </Button>
                <Button variant="outline" onClick={handleTryDifferentCourse}>
                  Try Different Course
                </Button>
              </>
            )}
            {' '}
            {currentStep === 'completed' && parsedData && createdCourseId && (
              <>
                <Button variant="outline" onClick={() => handleDialogClose(false)}>
                  Cancel
                </Button>
                {' '}
                <Button onClick={() => {
                  const courseId = createdCourseId;
                  handleDialogClose(false);
                  // Use setTimeout to ensure dialog state is reset before navigation
                  setTimeout(() => {
                    router.push(`/courses/${courseId}`);
                  }, 0);
                  // Note: refreshCourses() and onCourseAdded() are already called automatically in useEffect
                }}
                >
                  Go to Course
                </Button>
              </>
            )}

            {isProcessing && (
              <Button disabled>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
