'use client';

// Re-export consolidated error handling utilities
export {
  CommonErrorMessages,
  ErrorHandlers,
  handleApiError,
  handleApiSuccess,
} from '@/lib/error/util';

/**
 * Generic API request handler that handles loading state and errors
 */
export const handleApiRequest = async <T>(
  requestFn: () => Promise<T>,
  errorHandler: (error: unknown) => void,
  loadingMessage: string,
  setLoading: (loading: boolean) => void,
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

/**
 * Standard API response validation - checks if response is ok and parses JSON
 */
export const validateApiResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API request failed: ${response.status} ${response.statusText}. ${errorText}`);
  }
  return response.json() as Promise<T>;
};

/**
 * Generic fetch request with error handling and validation
 */
export const apiRequest = async <T>(
  url: string,
  options: RequestInit = {},
  errorMessage = 'Request failed',
): Promise<T> => {
  try {
    const response = await fetch(url, options);
    return await validateApiResponse<T>(response);
  } catch (error) {
    console.error(`API request to ${url} failed:`, error);
    // Use the consolidated error handler instead of direct toast
    const { handleApiError } = await import('@/lib/error/util');
    handleApiError(error, errorMessage);
    throw error;
  }
};

/**
 * Generic API request with loading state management
 */
export const apiRequestWithLoading = async <T>(
  url: string,
  options: RequestInit = {},
  setLoading: (loading: boolean) => void,
  errorMessage = 'Request failed',
): Promise<T> => {
  setLoading(true);
  try {
    return await apiRequest<T>(url, options, errorMessage);
  } finally {
    setLoading(false);
  }
};

/**
 * Common HTTP methods with error handling
 */
export const api = {
  get: <T>(url: string, errorMessage?: string) =>
    apiRequest<T>(url, { method: 'GET' }, errorMessage),

  post: <T>(url: string, data?: unknown, errorMessage?: string) =>
    apiRequest<T>(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: data ? JSON.stringify(data) : undefined,
    }, errorMessage),

  put: <T>(url: string, data?: unknown, errorMessage?: string) =>
    apiRequest<T>(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: data ? JSON.stringify(data) : undefined,
    }, errorMessage),

  delete: <T>(url: string, errorMessage?: string) =>
    apiRequest<T>(url, { method: 'DELETE' }, errorMessage),

  patch: <T>(url: string, data?: unknown, errorMessage?: string) =>
    apiRequest<T>(url, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: data ? JSON.stringify(data) : undefined,
    }, errorMessage),
};
