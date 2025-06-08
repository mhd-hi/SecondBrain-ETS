"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Plus, Loader2, CheckCircle, AlertCircle, RefreshCw, Database } from 'lucide-react';
import Image from 'next/image';
import { useAddCourse } from '@/hooks/use-add-course';

interface AddCourseDialogProps {
    onCourseAdded?: () => void;
    trigger?: React.ReactNode;
}

export function AddCourseDialog({ onCourseAdded, trigger }: AddCourseDialogProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [courseCode, setCourseCode] = useState('');
    const [existingCourse, setExistingCourse] = useState<{ id: string; code: string; name: string } | null>(null);
    const [isCheckingExistence, setIsCheckingExistence] = useState(false);
    const [hasCheckedExistence, setHasCheckedExistence] = useState(false); const {
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

    const router = useRouter(); const resetDialog = () => {
        setCourseCode('');
        setExistingCourse(null);
        setHasCheckedExistence(false);
        reset();
    }; const checkCourseExistence = async (courseCode: string) => {
        setIsCheckingExistence(true);
        try {
            const response = await fetch('/api/courses');
            if (response.ok) {
                const courses = await response.json() as Array<{ id: string; code: string; name: string }>;
                const existing = courses.find(course => course.code.toLowerCase() === courseCode.toLowerCase());
                setExistingCourse(existing ?? null);
                setHasCheckedExistence(true);
            }
        } catch (err) {
            console.error('Failed to check course existence:', err);
            // Don't show error to user as this is not critical
        } finally {
            setIsCheckingExistence(false);
        }
    }; const handleDialogClose = (open: boolean) => {
        setIsOpen(open);
        if (!open) {
            resetDialog();
        }
    }; const handleStartParsing = async () => {
        if (!courseCode.trim()) {
            toast.error('Please enter a course code');
            return;
        }

        setExistingCourse(null); // Reset existence check
        setHasCheckedExistence(false);

        // First check if course already exists
        await checkCourseExistence(courseCode);

        // Check the result after the async operation
        const response = await fetch('/api/courses');
        if (response.ok) {
            const courses = await response.json() as Array<{ id: string; code: string; name: string }>;
            const existing = courses.find(course => course.code.toLowerCase() === courseCode.toLowerCase());

            if (existing) {
                // Course exists, don't process further
                return;
            }
        }

        // Course doesn't exist, proceed with normal processing
        await startProcessing(courseCode);
    };

    const handleRetry = () => {
        retry();
    }; const handleTryDifferentCourse = () => {
        resetDialog();
    };

    const handleGoToExistingCourse = () => {
        if (existingCourse) {
            setIsOpen(false);
            router.push(`/courses/${existingCourse.id}`);
        }
    };    const getStepIcon = (stepName: 'planets' | 'openai' | 'create-course' | 'create-tasks') => {
        if (stepName === 'planets') return '/assets/logo_planets.png';
        if (stepName === 'openai') return '/assets/logo_openai.png';
        if (stepName === 'create-course') return '/favicon-16x16.png';
        if (stepName === 'create-tasks') return '/favicon-16x16.png';
        return '/favicon-16x16.png'; // Default fallback
    };

    const getStepLabel = (stepName: 'planets' | 'openai' | 'create-course' | 'create-tasks') => {
        if (stepName === 'planets') return 'Fetch Course Data';
        if (stepName === 'openai') return 'Parse with AI';
        if (stepName === 'create-course') return 'Create Course';
        if (stepName === 'create-tasks') return 'Create Tasks';
        return stepName;
    };    const renderStepIndicator = (stepName: 'planets' | 'openai' | 'create-course' | 'create-tasks') => {
        const logo = getStepIcon(stepName);
        const label = getStepLabel(stepName);
        const status = stepStatus[stepName];
        
        const isDatabaseStep = stepName === 'create-course' || stepName === 'create-tasks';

        return (
            <div key={stepName} className="flex items-center gap-3 p-3 rounded-lg border bg-card">
                <div className="relative flex-shrink-0">
                    {isDatabaseStep ? (
                        <div className={`w-12 h-12 rounded border flex items-center justify-center bg-muted ${status === 'loading' ? 'animate-pulse' : ''}`}>
                            <Database className="h-6 w-6 text-muted-foreground" />
                        </div>
                    ) : (
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
        <Dialog open={isOpen} onOpenChange={handleDialogClose}>
            <DialogTrigger asChild>
                {trigger ?? (
                    <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Course
                    </Button>
                )}
            </DialogTrigger>            <DialogContent
                className="sm:max-w-md"
                aria-describedby="add-course-description"
            >
                <DialogHeader>
                    <DialogTitle>Add Course</DialogTitle>
                    <DialogDescription id="add-course-description">
                        Enter a course code to automatically fetch syllabus data and generate tasks.
                    </DialogDescription>
                </DialogHeader>                <div className="space-y-4">                    {/* Course Code Input */}
                    <form onSubmit={(e) => {
                        e.preventDefault();
                        if (currentStep === 'idle' && courseCode.trim()) {
                            void handleStartParsing();
                        }
                    }}>
                        <div className="space-y-2">
                            <Label htmlFor="courseCode">Course Code</Label>
                            <Input
                                id="courseCode"
                                value={courseCode}
                                onChange={(e) => setCourseCode(e.target.value.toUpperCase())}
                                placeholder="Enter course code (e.g., MAT145)"
                                disabled={isProcessing}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && currentStep === 'idle' && courseCode.trim()) {
                                        e.preventDefault();
                                        void handleStartParsing();
                                    }
                                }}
                            />
                        </div>
                    </form>                    {/* Processing Steps */}
                    {showSteps && (
                        <div className="space-y-3">
                            <div className="text-sm font-medium text-muted-foreground">Processing Steps:</div>
                            {renderStepIndicator('planets')}
                            {renderStepIndicator('openai')}
                            {renderStepIndicator('create-course')}
                            {renderStepIndicator('create-tasks')}
                        </div>
                    )}
                    {/* Course Existence Check */}
                    {(currentStep === 'completed' || (currentStep === 'idle' && hasCheckedExistence)) && (
                        <div className="space-y-3">                            {isCheckingExistence ? (
                            <Alert>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                <AlertDescription>
                                    Checking if course already exists...
                                </AlertDescription>
                            </Alert>) : existingCourse ? (
                                <Alert variant="destructive">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertTitle>                                        
                                        The course <strong>{existingCourse.code}</strong> has already been added.
                                    </AlertTitle>
                                    <AlertDescription>
                                    </AlertDescription>
                                </Alert>
                            ) : hasCheckedExistence && currentStep === 'idle' ? <></> : currentStep === 'completed' && (
                                <Alert>
                                    <CheckCircle className="h-4 w-4" />
                                    <AlertTitle>Course {parsedData?.courseCode} has been created with {parsedData?.tasks?.length ?? 0} tasks.</AlertTitle>
                                </Alert>
                            )}
                        </div>
                    )}                    {/* Error Display */}
                    {error && (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Error</AlertTitle>
                            <AlertDescription>
                                {error}
                                {/* Error-specific help text */}
                                {error.includes('fetch course data') && (
                                    <div className="mt-2 text-xs">
                                        This usually means the course code is invalid or the course is not available for the current term.
                                    </div>
                                )}
                                {error.includes('parse course content') && (
                                    <div className="mt-2 text-xs">
                                        There was an issue processing the course content. Please try again.
                                    </div>
                                )}
                            </AlertDescription>
                        </Alert>
                    )}{/* Action Buttons */}
                    <div className="flex justify-end gap-2">
                        {currentStep === 'idle' && !existingCourse && (
                            <>
                                <Button variant="outline" onClick={() => handleDialogClose(false)}>
                                    Cancel
                                </Button>
                                <Button onClick={handleStartParsing} disabled={!courseCode.trim() || isCheckingExistence}>
                                    {isCheckingExistence ? (
                                        <>
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                            Checking...
                                        </>
                                    ) : (
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
                        )}                        {currentStep === 'completed' && parsedData && createdCourseId && (
                            <>
                                <Button variant="outline" onClick={() => handleDialogClose(false)}>
                                    Cancel
                                </Button>                                <Button onClick={() => {
                                    setIsOpen(false);
                                    router.push(`/courses/${createdCourseId}`);
                                    if (onCourseAdded) {
                                        onCourseAdded();
                                    }
                                }}>
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
