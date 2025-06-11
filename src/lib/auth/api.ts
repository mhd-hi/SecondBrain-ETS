import type { NextRequest } from 'next/server';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { auth } from '@/server/auth';

/**
 * Enhanced authentication utilities for API routes
 */

export type AuthenticatedUser = {
  id: string;
  email?: string;
  name?: string;
};

export type AuthError = {
  error: string;
  code: string;
};

/**
 * Get authenticated user from middleware headers (fast path) or session (fallback)
 */
export async function getAuthenticatedUser(): Promise<AuthenticatedUser | null> {
  try {
    // Try to get user from middleware headers first (faster)
    const headersList = await headers();
    const userId = headersList.get('x-user-id');
    if (userId) {
      return {
        id: userId,
        email: headersList.get('x-user-email') ?? undefined,
        name: headersList.get('x-user-name') ?? undefined,
      };
    }

    // Fallback to session auth (for routes not covered by middleware)
    const session = await auth();
    if (session?.user?.id) {
      return {
        id: session.user.id,
        email: session.user.email ?? undefined,
        name: session.user.name ?? undefined,
      };
    }

    return null;
  } catch (error) {
    console.error('Error getting authenticated user:', error);
    return null;
  }
}

/**
 * Require authentication and return user or throw error
 */
export async function requireAuth(): Promise<AuthenticatedUser> {
  const user = await getAuthenticatedUser();

  if (!user) {
    throw new AuthenticationError('Authentication required');
  }

  return user;
}

/**
 * Custom error classes for better error handling
 */
export class AuthenticationError extends Error {
  constructor(message = 'Authentication required') {
    super(message);
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends Error {
  constructor(message = 'Access denied') {
    super(message);
    this.name = 'AuthorizationError';
  }
}

/**
 * Standard error responses
 */
export function createAuthErrorResponse(error: Error): NextResponse {
  if (error instanceof AuthenticationError) {
    return NextResponse.json(
      { error: error.message, code: 'UNAUTHENTICATED' },
      { status: 401 },
    );
  }

  if (error instanceof AuthorizationError) {
    return NextResponse.json(
      { error: error.message, code: 'UNAUTHORIZED' },
      { status: 403 },
    );
  }

  // Generic error
  return NextResponse.json(
    { error: 'Internal server error', code: 'INTERNAL_ERROR' },
    { status: 500 },
  );
}

/**
 * Higher-order function to wrap API routes with authentication
 */
export function withAuth<TParams = Record<string, string>>(
  handler: (
    request: NextRequest,
    context: { params: Promise<TParams>; user: AuthenticatedUser }
  ) => Promise<NextResponse>,
) {
  return async (
    request: NextRequest,
    context: { params: Promise<TParams> },
  ): Promise<NextResponse> => {
    try {
      const user = await requireAuth();
      return await handler(request, { ...context, user });
    } catch (error) {
      console.error('Authentication error in API route:', error);
      return createAuthErrorResponse(error as Error);
    }
  };
}

/**
 * Higher-order function for simple authenticated API routes (no params)
 */
export function withAuthSimple(
  handler: (request: NextRequest, user: AuthenticatedUser) => Promise<NextResponse>,
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    try {
      const user = await requireAuth();
      return await handler(request, user);
    } catch (error) {
      console.error('Authentication error in API route:', error);
      return createAuthErrorResponse(error as Error);
    }
  };
}

/**
 * Higher-order function with additional error handling
 */
export function withAuthAndErrorHandling<TParams = Record<string, string>>(
  handler: (
    request: NextRequest,
    context: { params: Promise<TParams>; user: AuthenticatedUser }
  ) => Promise<NextResponse>,
  contextName = 'API route',
) {
  return async (
    request: NextRequest,
    context: { params: Promise<TParams> },
  ): Promise<NextResponse> => {
    try {
      const user = await requireAuth();
      return await handler(request, { ...context, user });
    } catch (error) {
      console.error('Error in', contextName, ':', error);

      if (error instanceof AuthenticationError || error instanceof AuthorizationError) {
        return createAuthErrorResponse(error);
      }

      // Generic error
      return NextResponse.json(
        {
          error: error instanceof Error ? error.message : 'Unknown error occurred',
          code: 'INTERNAL_ERROR',
        },
        { status: 500 },
      );
    }
  };
}

/**
 * Type-safe parameter extraction with authentication
 */
export async function getAuthenticatedParams<T>(
  context: { params: Promise<T> },
): Promise<{ params: T; user: AuthenticatedUser }> {
  const [params, user] = await Promise.all([
    context.params,
    requireAuth(),
  ]);

  return { params, user };
}
