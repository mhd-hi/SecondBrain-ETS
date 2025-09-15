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
