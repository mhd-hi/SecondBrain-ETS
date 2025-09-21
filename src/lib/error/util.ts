'use client';

import { toast } from 'sonner';

export const handleApiSuccess = (message: string) => {
  toast.success(message);
};

export const ErrorHandlers = {
  /**
   * API error handler with consistent logging and user notification
   */
  api: (error: unknown, userMessage: string, context?: string) => {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const logContext = context ? `[${context}]` : '';

    console.error(logContext, 'API Error:', error);
    toast.error(userMessage);

    return errorMessage;
  },

  /**
   * Form validation error handler
   */
  validation: (error: unknown, fieldName?: string) => {
    const message = fieldName
      ? `Invalid ${fieldName}. Please check your input.`
      : 'Please check your input and try again.';

    console.error('Validation Error:', error);
    toast.error(message);
  },

  /**
   * Network error handler
   */
  network: (error: unknown) => {
    console.error('Network Error:', error);
    toast.error('Network error. Please check your connection and try again.');
  },
  /**
   * Generic error handler with customizable message
   */
  generic: (error: unknown, userMessage = 'Something went wrong') => {
    console.error('Error:', error);
    toast.error(userMessage);
  },
  /**
   * Silent error handler (logs but doesn't show toast)
   */
  silent: (error: unknown, context?: string) => {
    const logContext = context ? `[${context}]` : '';
    console.error(logContext, 'Silent Error:', error);
  },
};

/**
 * Common error messages for consistency across the app
 */
export const CommonErrorMessages = {
  // CRUD operations
  FETCH_FAILED: 'Failed to load data. Please try again.',
  CREATE_FAILED: 'Failed to create. Please try again.',
  UPDATE_FAILED: 'Failed to update. Please try again.',
  DELETE_FAILED: 'Failed to delete. Please try again.',

  // Course-specific
  COURSE_FETCH_FAILED: 'Failed to load courses. Please try again.',
  COURSE_CREATE_FAILED: 'Failed to create course. Please try again.',
  COURSE_UPDATE_FAILED: 'Failed to update course. Please try again.',
  COURSE_DELETE_FAILED: 'Failed to delete course. Please try again.',

  // Task-specific
  TASK_FETCH_FAILED: 'Failed to load tasks. Please try again.',
  TASK_CREATE_FAILED: 'Failed to create task. Please try again.',
  TASK_UPDATE_FAILED: 'Failed to update task. Please try again.',
  TASK_DELETE_FAILED: 'Failed to delete task. Please try again.',

  // General
  NETWORK_ERROR: 'Network error. Please check your connection.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  SERVER_ERROR: 'Server error. Please try again later.',
  UNKNOWN_ERROR: 'Something went wrong. Please try again.',

  // Pipeline-specific
  PIPELINE_PLANETS_ERROR: 'PlanETS error, please try another session or course.',
  PIPELINE_COURSE_NOT_FOUND: 'Course not found or not available for the current term',
  PIPELINE_PARSING_ERROR: 'Unable to process course information. Please try again',
  PIPELINE_INVALID_FORMAT: 'Invalid course code format. Please use format like MAT145 or LOG210',
} as const;

/**
 * Determine if an error is retryable (network errors, timeouts, 5xx errors)
 */
const isRetryableError = (error: unknown): boolean => {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();

    return message.includes('network')
      || message.includes('timeout')
      || message.includes('fetch')
      || (message.includes('5') && message.includes('0')); // 500, 502, 503, etc.
  }
  return false;
};

/**
 * Enhanced async operation handler with retry capability
 */
export const handleAsyncOperation = async <T>(
  operation: () => Promise<T>,
  errorMessage: string,
  context?: string,
  retries = 0,
): Promise<T | null> => {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      // If this isn't the last attempt and it's a network error, retry
      if (attempt < retries && isRetryableError(error)) {
        await new Promise(resolve => setTimeout(resolve, 2 ** attempt * 1000)); // Exponential backoff
        continue;
      }

      // If it's the final attempt or non-retryable error, handle it
      ErrorHandlers.api(error, errorMessage, context);
      return null;
    }
  }

  return null;
};

/**
 * Legacy API error handler for backward compatibility
 * @deprecated Use ErrorHandlers.api instead
 */
export const handleApiError = (error: unknown, errorMessage: string) => {
  ErrorHandlers.api(error, errorMessage);
};

/**
 * Pipeline-specific error handling utilities
 */
export const PipelineErrorHandlers = {
  /**
   * Error categories for pipeline operations
   */
  ErrorCategory: {
    PLANETS_ERROR: 'PLANETS_ERROR',
    COURSE_NOT_FOUND: 'COURSE_NOT_FOUND',
    PARSING_ERROR: 'PARSING_ERROR',
    INVALID_FORMAT: 'INVALID_FORMAT',
    UNKNOWN: 'UNKNOWN',
  } as const,

  /**
   * Classify a pipeline error based on error message patterns
   */
  classifyError: (errorMessage: string): 'PLANETS_ERROR' | 'COURSE_NOT_FOUND' | 'PARSING_ERROR' | 'INVALID_FORMAT' | 'UNKNOWN' => {
    if (!errorMessage) {
      return 'UNKNOWN';
    }

    const normalizedError = errorMessage.toLowerCase().trim();

    // PlanETS-related errors
    const planetsPatterns = [
      'failed to fetch planets data',
      'planets fetch failed',
      'content div not found in planets page',
      'no html content found in divcontenustraining',
      'content div',
      'planets error',
    ];

    if (planetsPatterns.some(pattern => normalizedError.includes(pattern))) {
      return 'PLANETS_ERROR';
    }

    // Course not found errors
    const courseNotFoundPatterns = [
      'failed to fetch course data',
      'course not found',
      'not available for the current term',
    ];

    if (courseNotFoundPatterns.some(pattern => normalizedError.includes(pattern))) {
      return 'COURSE_NOT_FOUND';
    }

    // Parsing errors
    const parsingPatterns = [
      'failed to parse course content',
      'parsing error',
      'unable to process',
    ];

    if (parsingPatterns.some(pattern => normalizedError.includes(pattern))) {
      return 'PARSING_ERROR';
    }

    // Format validation errors
    const formatPatterns = [
      'invalid course code format',
      'invalid format',
    ];

    if (formatPatterns.some(pattern => normalizedError.includes(pattern))) {
      return 'INVALID_FORMAT';
    }

    return 'UNKNOWN';
  },

  /**
   * Get a user-friendly error message for pipeline errors
   */
  getSafeErrorMessage: (errorMessage: string): string => {
    const category = PipelineErrorHandlers.classifyError(errorMessage);

    switch (category) {
      case 'PLANETS_ERROR':
        return CommonErrorMessages.PIPELINE_PLANETS_ERROR;
      case 'COURSE_NOT_FOUND':
        return CommonErrorMessages.PIPELINE_COURSE_NOT_FOUND;
      case 'PARSING_ERROR':
        return CommonErrorMessages.PIPELINE_PARSING_ERROR;
      case 'INVALID_FORMAT':
        return CommonErrorMessages.PIPELINE_INVALID_FORMAT;
      default:
        return CommonErrorMessages.UNKNOWN_ERROR;
    }
  },

  /**
   * Handle pipeline errors with proper classification and user-friendly messages
   */
  handle: (error: unknown, context = 'Pipeline Error') => {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const userFriendlyMessage = PipelineErrorHandlers.getSafeErrorMessage(errorMessage);

    return ErrorHandlers.api(error, userFriendlyMessage, context);
  },
} as const;
