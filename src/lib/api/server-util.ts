import { NextResponse } from 'next/server';

/**
 * Server-side API utilities for Next.js API routes
 */

/**
 * Standard error response handler for API routes
 */
export const handleApiError = (error: unknown, context: string, statusCode = 500) => {
  console.error(context, ':', error);

  const errorMessage = error instanceof Error ? error.message : 'Unknown error';
  const responseMessage = statusCode === 500 ? 'Internal server error' : errorMessage;

  return NextResponse.json(
    { error: responseMessage },
    { status: statusCode },
  );
};

/**
 * Validation error response
 */
export const validationError = (message: string) => {
  return NextResponse.json(
    { error: message },
    { status: 400 },
  );
};

/**
 * Success response
 */
export const successResponse = <T>(data: T, statusCode = 200) => {
  return NextResponse.json(data, { status: statusCode });
};

/**
 * Common validation helpers
 */
export const validateRequiredQuery = (
  searchParams: URLSearchParams,
  requiredParams: string[],
): string | null => {
  for (const param of requiredParams) {
    if (!searchParams.get(param)) {
      return `${param} parameter is required`;
    }
  }
  return null;
};
