'use client';

import type { CourseAIResponse } from '@/types/api';
import type { PipelineStepResult } from '@/types/pipeline';
import { useCallback, useState } from 'react';
import { toast } from 'sonner';
import { assertValidCourseCode } from '@/lib/course/util';
import { calculateTaskDueDate } from '@/lib/task/util';

export type ProcessingStep = 'idle' | 'planets' | 'openai' | 'create-course' | 'create-tasks' | 'completed' | 'error';

export type StepStatus = {
  'planets': 'pending' | 'loading' | 'success' | 'error';
  'openai': 'pending' | 'loading' | 'success' | 'error';
  'create-course': 'pending' | 'loading' | 'success' | 'error';
  'create-tasks': 'pending' | 'loading' | 'success' | 'error';
};

export type UseAddCourseReturn = {
  currentStep: ProcessingStep;
  stepStatus: StepStatus;
  parsedData: CourseAIResponse | null;
  createdCourseId: string | null;
  error: string | null;
  isProcessing: boolean;
  startProcessing: (courseCode: string) => Promise<void>;
  retry: () => void;
  reset: () => void;
};

async function fetchCourseFromPlanets(courseCode: string, term = '20252') {
  // Validate course code format before making API call
  const cleanCode = assertValidCourseCode(courseCode);

  const response = await fetch('/api/course-pipeline', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      courseCode: cleanCode,
      term,
      step: 'planets',
    }),
  });

  if (!response.ok) {
    const errorData = await response.json() as { error?: string };
    throw new Error(errorData.error ?? 'Failed to fetch planets data');
  }

  const result = await response.json() as PipelineStepResult;

  if (result.step.status === 'error') {
    throw new Error(result.step.error ?? 'Failed to fetch course data');
  }

  return {
    html: result.data as string,
    logs: result.logs,
  };
}

async function parseCourseWithAI(html: string, courseCode: string, term = '20252'): Promise<CourseAIResponse> {
  // Validate course code format before making API call
  const cleanCode = assertValidCourseCode(courseCode);

  const response = await fetch('/api/course-pipeline', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      courseCode: cleanCode,
      term,
      step: 'openai',
      htmlData: html,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json() as { error?: string };
    throw new Error(errorData.error ?? 'Failed to process with OpenAI');
  }

  const result = await response.json() as PipelineStepResult;

  if (result.step.status === 'error') {
    throw new Error(result.step.error ?? 'Failed to parse with AI');
  }
  return result.data as CourseAIResponse;
}

async function createCourse(courseCode: string, courseName: string): Promise<{ id: string }> {
  // Validate course code format before making API call
  const cleanCode = assertValidCourseCode(courseCode);

  const response = await fetch('/api/courses', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      code: cleanCode,
      name: courseName,
    }),
  });

  if (!response.ok) {
    const responseData = await response.json() as { error?: string };
    throw new Error(responseData.error ?? 'Failed to create course');
  }

  const course = await response.json() as { id: string };

  if (!course.id) {
    throw new Error('Invalid course response: missing id');
  }

  return course;
}

async function createTasks(courseId: string, parsedData: CourseAIResponse): Promise<void> {
  const response = await fetch('/api/tasks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      courseId,
      tasks: parsedData.tasks.map(task => ({
        ...task,
        dueDate: calculateTaskDueDate(task.week).toISOString(),
      })),
    }),
  });

  if (!response.ok) {
    const errorData = await response.json() as { error?: string };
    throw new Error(errorData.error ?? 'Failed to create tasks');
  }
}

export function useAddCourse(): UseAddCourseReturn {
  const [currentStep, setCurrentStep] = useState<ProcessingStep>('idle');
  const [stepStatus, setStepStatus] = useState<StepStatus>({
    'planets': 'pending',
    'openai': 'pending',
    'create-course': 'pending',
    'create-tasks': 'pending',
  });
  const [parsedData, setParsedData] = useState<CourseAIResponse | null>(null);
  const [createdCourseId, setCreatedCourseId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isProcessing = currentStep === 'planets' || currentStep === 'openai' || currentStep === 'create-course' || currentStep === 'create-tasks';

  const reset = useCallback(() => {
    setCurrentStep('idle');
    setStepStatus({
      'planets': 'pending',
      'openai': 'pending',
      'create-course': 'pending',
      'create-tasks': 'pending',
    });
    setParsedData(null);
    setCreatedCourseId(null);
    setError(null);
  }, []);

  const retry = useCallback(() => {
    setCurrentStep('idle');
    setStepStatus({
      'planets': 'pending',
      'openai': 'pending',
      'create-course': 'pending',
      'create-tasks': 'pending',
    });
    setError(null);
  }, []);

  const startProcessing = useCallback(async (courseCode: string) => {
    if (!courseCode.trim()) {
      toast.error('Please enter a course code');
      return;
    }
    setError(null);
    setCurrentStep('planets');
    setStepStatus({
      'planets': 'loading',
      'openai': 'pending',
      'create-course': 'pending',
      'create-tasks': 'pending',
    });

    try {
      // Step 1: Fetch from Planets
      const planetsData = await fetchCourseFromPlanets(courseCode.trim());
      setStepStatus(prev => ({ ...prev, planets: 'success' }));

      // Step 2: Parse with OpenAI
      setCurrentStep('openai');
      setStepStatus(prev => ({ ...prev, openai: 'loading' }));
      const aiData = await parseCourseWithAI(planetsData.html, courseCode.trim());
      setStepStatus(prev => ({ ...prev, openai: 'success' }));

      setParsedData(aiData);

      // Step 3: Create Course
      setCurrentStep('create-course');
      setStepStatus(prev => ({ ...prev, 'create-course': 'loading' }));

      const course = await createCourse(courseCode.trim(), aiData.courseCode);
      setStepStatus(prev => ({ ...prev, 'create-course': 'success' }));
      setCreatedCourseId(course.id);

      // Step 4: Create Tasks
      setCurrentStep('create-tasks');
      setStepStatus(prev => ({ ...prev, 'create-tasks': 'loading' }));

      await createTasks(course.id, aiData);
      setStepStatus(prev => ({ ...prev, 'create-tasks': 'success' }));

      setCurrentStep('completed');

      toast.success('Course and tasks created successfully!');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      setCurrentStep('error');
      // Update step status based on current step
      const failedStep = currentStep === 'planets'
        ? 'planets'
        : currentStep === 'openai'
          ? 'openai'
          : currentStep === 'create-course' ? 'create-course' : 'create-tasks';

      setStepStatus(prev => ({
        ...prev,
        [failedStep]: 'error',
      }));

      toast.error(errorMessage);
    }
  }, [currentStep]);
  return {
    currentStep,
    stepStatus,
    parsedData,
    createdCourseId,
    error,
    isProcessing,
    startProcessing,
    retry,
    reset,
  };
}
