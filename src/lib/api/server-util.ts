import { NextResponse } from 'next/server';

/**
 * Server-side API utilities for Next.js API routes
 */

/**
 * Standard error response handler for API routes
 */
export const handleApiError = (error: unknown, context: string, statusCode = 500) => {
  console.error(`${context}:`, error);
  
  const errorMessage = error instanceof Error ? error.message : 'Unknown error';
  const responseMessage = statusCode === 500 ? 'Internal server error' : errorMessage;
  
  return NextResponse.json(
    { error: responseMessage },
    { status: statusCode }
  );
};

/**
 * Validation error response
 */
export const validationError = (message: string) => {
  return NextResponse.json(
    { error: message },
    { status: 400 }
  );
};

/**
 * Success response
 */
export const successResponse = <T>(data: T, statusCode = 200) => {
  return NextResponse.json(data, { status: statusCode });
};

/**
 * Wrapper for API route handlers with consistent error handling
 */
export const withErrorHandling = <T extends unknown[]>(
  handler: (...args: T) => Promise<NextResponse>,
  context: string
) => {
  return async (...args: T): Promise<NextResponse> => {
    try {
      return await handler(...args);
    } catch (error) {
      return handleApiError(error, context);
    }
  };
};

/**
 * Validate required fields in request body
 */
export const validateRequiredFields = (
  data: Record<string, unknown>,
  requiredFields: string[]
): string | null => {
  for (const field of requiredFields) {
    if (!data[field]) {
      return `${field} is required`;
    }
  }
  return null;
};

export const validateRequiredQuery = (
  searchParams: URLSearchParams,
  requiredParams: string[]
): string | null => {
  for (const param of requiredParams) {
    if (!searchParams.get(param)) {
      return `${param} parameter is required`;
    }
  }
  return null;
};

/**
 * Common API route patterns
 */
export const apiRoutePatterns = {
  /**
   * GET with optional query parameters
   */
  get: <T>(
    fetcher: (params: URLSearchParams) => Promise<T>,
    context: string,
    requiredParams: string[] = []
  ) => withErrorHandling(async (request: Request) => {
    const { searchParams } = new URL(request.url);
    
    const validationError = validateRequiredQuery(searchParams, requiredParams);
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }
    
    const data = await fetcher(searchParams);
    return successResponse(data);
  }, context),
  /**
   * POST with request body validation
   */
  post: <T, R>(
    creator: (data: T) => Promise<R>,
    context: string,
    requiredFields: string[] = []
  ) => withErrorHandling(async (request: Request) => {
    const data = await request.json() as T;
    
    const validationError = validateRequiredFields(data as Record<string, unknown>, requiredFields);
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }
    
    const result = await creator(data);
    return successResponse(result, 201);
  }, context),

  /**
   * PATCH with ID validation
   */
  patch: <T, R>(
    updater: (id: string, data: T) => Promise<R>,
    context: string
  ) => withErrorHandling(async (request: Request) => {
    const data = await request.json() as { id: string } & T;
    
    if (!data.id) {
      return validationError('ID is required');
    }
    
    const { id, ...updates } = data;
    const result = await updater(id, updates as T);
    return successResponse(result);
  }, context),

  /**
   * DELETE with ID validation
   */
  delete: <R>(
    deleter: (id: string) => Promise<R>,
    context: string
  ) => withErrorHandling(async (request: Request) => {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return validationError('ID parameter is required');
    }
    
    const result = await deleter(id);
    return successResponse(result);
  }, context),
};
