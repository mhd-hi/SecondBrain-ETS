'use client';

import type { CourseAIResponse } from '@/types/api/ai';
import type { PipelineStepResult } from '@/types/server-pipelines/pipelines';
import { useCallback, useState } from 'react';
import { toast } from 'sonner';
import { checkCourseExists } from '@/hooks/use-course';
import { createPlanETSLink } from '@/hooks/use-custom-link';
import { assertValidCourseCode } from '@/lib/utils/course';
import { calculateDueDateTaskForTerm } from '@/lib/utils/task';
import normalizeTasks from '@/pipelines/add-course-data/steps/ai/normalize';

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
  // courseCode is the code like MAT145. term is PlanETS numeric format like '20252'
  startProcessing: (courseCode: string, term: string, firstDayOfClass: Date) => Promise<void>;
  retry: () => void;
  reset: () => void;
};

// term is expected in PlanETS numeric format like '20252' (see mapping in AddCourseDialog)
async function fetchCourseFromPlanETS(courseCode: string, term: string) {
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
  };
}

async function parseCourseWithAI(html: string, courseCode: string, term: string): Promise<CourseAIResponse> {
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

async function createCourse(courseCode: string, courseName: string, term: string): Promise<{ id: string }> {
  // Validate course code format before making API call
  const cleanCode = assertValidCourseCode(courseCode);

  const response = await fetch('/api/courses', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      code: cleanCode,
      name: courseName,
      term,
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

async function createTasks(
  courseId: string,
  parsedData: CourseAIResponse,
  term: string,
  firstDayOfClass: Date,
): Promise<void> {
  // First normalize the AI tasks (validation, sanitization, subtask creation, etc.)
  const normalizedTasks = normalizeTasks(parsedData.tasks);

  // Then apply due dates based on AI-provided week numbers and firstDayOfClass
  const tasksWithDueDates = normalizedTasks.map((task, index) => {
    const aiTask = parsedData.tasks[index];
    const week = typeof aiTask?.week === 'number' ? aiTask.week : 1;
    const dueDate = calculateDueDateTaskForTerm(term, week, firstDayOfClass);

    return {
      ...task,
      dueDate: dueDate.toISOString(),
    };
  });

  const response = await fetch('/api/tasks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      courseId,
      tasks: tasksWithDueDates,
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

  const startProcessing = useCallback(async (courseCode: string, term: string, firstDayOfClass: Date) => {
    if (!courseCode.trim()) {
      toast.error('Please enter a course code');
      return;
    }
    setError(null);

    const existenceResult = await checkCourseExists(courseCode.trim(), term);
    if (existenceResult.exists) {
      setCurrentStep('error');
      const errorMessage = `Course ${courseCode.trim()} already exists in your account.`;
      setError(errorMessage);
      return;
    }

    // Start UI processing steps
    setCurrentStep('planets');
    setStepStatus({
      'planets': 'loading',
      'openai': 'pending',
      'create-course': 'pending',
      'create-tasks': 'pending',
    });

    try {
      // Step 1: Fetch from Planets
      const planetsData = await fetchCourseFromPlanETS(courseCode.trim(), term);
      setStepStatus(prev => ({ ...prev, planets: 'success' }));

      // Step 2: Parse with OpenAI
      setCurrentStep('openai');
      setStepStatus(prev => ({ ...prev, openai: 'loading' }));
      const aiData = await parseCourseWithAI(planetsData.html, courseCode.trim(), term);
      setStepStatus(prev => ({ ...prev, openai: 'success' }));

      setParsedData(aiData);

      // Step 3: Create Course
      setCurrentStep('create-course');
      setStepStatus(prev => ({ ...prev, 'create-course': 'loading' }));

      const course = await createCourse(courseCode.trim(), aiData.courseCode, term);
      setStepStatus(prev => ({ ...prev, 'create-course': 'success' }));
      setCreatedCourseId(course.id);

      // Step 4: Create Tasks
      setCurrentStep('create-tasks');
      setStepStatus(prev => ({ ...prev, 'create-tasks': 'loading' }));

      await createTasks(course.id, aiData, term, firstDayOfClass);
      setStepStatus(prev => ({ ...prev, 'create-tasks': 'success' }));

      createPlanETSLink(course.id, courseCode.trim(), term).catch((err) => {
        console.error('Failed to create PlanETS link:', err);
      });

      setCurrentStep('completed');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      setCurrentStep('error');
      // Update step status based on current step
      const failedStep = currentStep === 'planets'
        ? 'planets'
        : currentStep === 'openai'
          ? 'openai'
          : currentStep === 'create-course'
            ? 'create-course'
            : 'create-tasks';

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
