"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Plus, Loader2, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import Image from 'next/image';
import { useAddCourse } from '@/hooks/use-add-course';
import { calculateTaskDueDate } from '@/lib/task/util';

interface AddCourseDialogProps {
    onCourseAdded?: () => void;
    trigger?: React.ReactNode;
}

export function AddCourseDialog({ onCourseAdded, trigger }: AddCourseDialogProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [courseCode, setCourseCode] = useState('');
    
    const {
        currentStep,
        stepStatus,
        parsedData,
        error,
        isProcessing,
        startProcessing,
        retry,
        reset,
    } = useAddCourse();

    const router = useRouter();

    const resetDialog = () => {
        setCourseCode('');
        reset();
    };    const handleDialogClose = (open: boolean) => {
        setIsOpen(open);
        if (!open) {
            resetDialog();
        }
    };

    const handleStartParsing = async () => {
        if (!courseCode.trim()) {
            toast.error('Please enter a course code');
            return;
        }

        await startProcessing(courseCode);
    };

    const handleRetry = () => {
        retry();
    };    const handleTryDifferentCourse = () => {
        resetDialog();
    };

    const handleReviewCourse = async () => {
        if (!parsedData) return;

        try {
            // Create course (or get existing one)
            const courseResponse = await fetch('/api/courses', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    code: parsedData.courseCode,
                    name: parsedData.courseCode,
                }),
            });

            if (!courseResponse.ok) {
                const responseData = await courseResponse.json() as { error?: string };
                throw new Error(responseData.error ?? 'Failed to create course');
            }

            const course = await courseResponse.json() as { id: string };

            if (!course.id) {
                throw new Error('Invalid course response: missing id');
            }

            // Create tasks
            const tasksResponse = await fetch('/api/tasks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    courseId: course.id,
                    tasks: parsedData.tasks.map(task => ({
                        ...task,
                        dueDate: calculateTaskDueDate(task.week).toISOString()
                    })),
                }),
            });

            if (!tasksResponse.ok) {
                const errorData = await tasksResponse.json() as { error?: string };
                throw new Error(errorData.error ?? 'Failed to create tasks');
            }            toast.success('Course created successfully!', {
                description: 'Redirecting to course page...',
            });            // Close dialog and redirect
            setIsOpen(false);
            router.push(`/courses/${course.id}`);

            if (onCourseAdded) {
                onCourseAdded();
            }

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to create course';
            toast.error(errorMessage);
        }
    };

    const getStepIcon = (stepName: 'planets' | 'openai') => {
        if (stepName === 'planets') return '/assets/logo_planets.png';
        if (stepName === 'openai') return '/assets/logo_openai.png';
        return '/assets/logo_planets.png'; // Default fallback
    };

    const getStepLabel = (stepName: 'planets' | 'openai') => {
        if (stepName === 'planets') return 'Fetch Course Data';
        if (stepName === 'openai') return 'Parse with AI';
        return stepName;
    };

    const renderStepIndicator = (stepName: 'planets' | 'openai') => {
        const logo = getStepIcon(stepName);
        const label = getStepLabel(stepName);
        const status = stepStatus[stepName];        return (
            <div key={stepName} className="flex items-center gap-3 p-3 rounded-lg border bg-card">
                <div className="relative flex-shrink-0">
                    <Image
                        src={logo}
                        alt={`${label} logo`}
                        width={48}
                        height={48}
                        className={`rounded ${status === 'loading' ? 'animate-pulse' : ''}`}
                    />
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
                </DialogHeader>
                <div className="space-y-4">                    {/* Course Code Input */}
                    <div className="space-y-2">
                        <Label htmlFor="courseCode">Course Code</Label>
                        <Input
                            id="courseCode"
                            value={courseCode}
                            onChange={(e) => setCourseCode(e.target.value.toUpperCase())}
                            placeholder="Enter course code (e.g., MAT145)"
                            disabled={isProcessing}
                        />
                    </div>

                    {/* Processing Steps */}
                    {showSteps && (
                        <div className="space-y-3">
                            <div className="text-sm font-medium text-muted-foreground">Processing Steps:</div>
                            {renderStepIndicator('planets')}
                            {renderStepIndicator('openai')}
                        </div>
                    )}

                    {/* Error Display */}
                    {error && (
                        <div className="p-3 rounded-lg border border-destructive bg-destructive/5">
                            <div className="flex items-center gap-2 text-destructive text-sm">
                                <AlertCircle className="h-4 w-4" />
                                <span className="font-medium">Error</span>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">{error}</p>

                            {/* Error-specific help text */}
                            {error.includes('fetch course data') && (
                                <p className="text-xs text-muted-foreground mt-2">
                                    This usually means the course code is invalid or the course is not available for the current term.
                                </p>
                            )}
                            {error.includes('parse course content') && (
                                <p className="text-xs text-muted-foreground mt-2">
                                    There was an issue processing the course content. Please try again.
                                </p>
                            )}
                        </div>
                    )}                    {/* Action Buttons */}
                    <div className="flex justify-end gap-2">
                        {currentStep === 'idle' && (
                            <>
                                <Button variant="outline" onClick={() => handleDialogClose(false)}>
                                    Cancel
                                </Button>
                                <Button onClick={handleStartParsing} disabled={!courseCode.trim()}>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Course
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

                        {currentStep === 'completed' && parsedData && (
                            <>
                                <Button variant="outline" onClick={() => handleDialogClose(false)}>
                                    Cancel
                                </Button>
                                <Button onClick={handleReviewCourse}>
                                    Review Course
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
