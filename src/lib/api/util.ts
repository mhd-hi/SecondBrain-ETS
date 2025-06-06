'use client';

import { toast } from 'sonner';

/**
 * Generic API error handler that shows a toast notification
 */
export const handleApiError = (error: unknown, errorMessage: string) => {
  console.error(error);
  toast.error(errorMessage);
};

/**
 * Generic API success handler that shows a toast notification
 */
export const handleApiSuccess = (message: string) => {
  toast.success(message);
};

/**
 * Generic API request handler that handles loading state and errors
 */
export const handleApiRequest = async <T>(
  requestFn: () => Promise<T>,
  errorHandler: (error: unknown) => void,
  loadingMessage: string,
  setLoading: (loading: boolean) => void
) => {
  setLoading(true);
  try {
    const result = await requestFn();
    return result;
  } catch (error) {
    errorHandler(error);
    throw error;
  } finally {
    setLoading(false);
  }
}; 