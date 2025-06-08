"use client";

import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import type { CourseAIResponse } from '@/types/api';
import type { PipelineStepResult } from '@/types/pipeline';

export type ProcessingStep = 'idle' | 'planets' | 'openai' | 'completed' | 'error';

export interface StepStatus {
  planets: 'pending' | 'loading' | 'success' | 'error';
  openai: 'pending' | 'loading' | 'success' | 'error';
}

export interface UseAddCourseReturn {
  currentStep: ProcessingStep;
  stepStatus: StepStatus;
  parsedData: CourseAIResponse | null;
  error: string | null;
  isProcessing: boolean;
  startProcessing: (courseCode: string) => Promise<void>;
  retry: () => void;
  reset: () => void;
}

async function fetchCourseFromPlanets(courseCode: string, term = '20252') {
  const response = await fetch('/api/course-pipeline', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      courseCode,
      term,
      step: 'planets'
    })
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
    logs: result.logs
  };
}

async function parseCourseWithAI(html: string, courseCode: string, term = '20252'): Promise<CourseAIResponse> {
  const response = await fetch('/api/course-pipeline', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      courseCode,
      term,
      step: 'openai',
      htmlData: html
    })
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

export function useAddCourse(): UseAddCourseReturn {
  const [currentStep, setCurrentStep] = useState<ProcessingStep>('idle');
  const [stepStatus, setStepStatus] = useState<StepStatus>({
    planets: 'pending',
    openai: 'pending'
  });
  const [parsedData, setParsedData] = useState<CourseAIResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isProcessing = currentStep === 'planets' || currentStep === 'openai';

  const reset = useCallback(() => {
    setCurrentStep('idle');
    setStepStatus({ planets: 'pending', openai: 'pending' });
    setParsedData(null);
    setError(null);
  }, []);

  const retry = useCallback(() => {
    setCurrentStep('idle');
    setStepStatus({ planets: 'pending', openai: 'pending' });
    setError(null);
  }, []);

  const startProcessing = useCallback(async (courseCode: string) => {
    if (!courseCode.trim()) {
      toast.error('Please enter a course code');
      return;
    }

    setError(null);
    setCurrentStep('planets');
    setStepStatus({ planets: 'loading', openai: 'pending' });

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
      setCurrentStep('completed');
      
      toast.success('Course processed successfully!');
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      setCurrentStep('error');
      
      // Update step status based on current step
      setStepStatus(prev => ({
        ...prev,
        [currentStep === 'planets' ? 'planets' : 'openai']: 'error'
      }));
      
      toast.error(errorMessage);
    }
  }, [currentStep]);

  return {
    currentStep,
    stepStatus,
    parsedData,
    error,
    isProcessing,
    startProcessing,
    retry,
    reset,
  };
}
