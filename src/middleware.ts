import { NextResponse } from 'next/server';
import { auth } from './middleware/auth';

// Define routes that require authentication with more comprehensive patterns
const protectedApiRoutes = [
  '/api/courses',
  '/api/tasks',
  '/api/cron/cleanup-courses', // Protect cron jobs
  '/api/pomodoro',
  '/api/course-pipeline',
  '/api/parse-course',
  '/api/links',
];

// Define public API routes that should not be protected
const publicApiRoutes = [
  '/api/auth',
];

// Define public pages that don't require authentication
const publicPages = [
  '/api/auth/signin',
  '/api/auth/signout',
  '/api/auth/callback',
  '/api/auth/csrf',
  '/api/auth/session',
  '/api/auth/providers',
  '/auth/error',
  '/auth/signin',
];

/**
 * Check if a path should be protected (API routes)
 */
function isProtectedApiRoute(pathname: string): boolean {
  // Check if it's explicitly public first
  if (publicApiRoutes.some(route => pathname.startsWith(route))) {
    return false;
  }

  // Check if it matches any protected route pattern
  return protectedApiRoutes.some(route => pathname.startsWith(route));
}

/**
 * Check if a path is a public page that doesn't require authentication
 */
function isPublicPage(pathname: string): boolean {
  return publicPages.some(route => pathname.startsWith(route));
}

/**
 * Check if the path is a page route (not API route)
 */
function isPageRoute(pathname: string): boolean {
  return !pathname.startsWith('/api/');
}

// eslint-disable-next-line ts/no-explicit-any
export default auth((req: any) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth?.user;

  // Allow public pages without authentication
  if (isPublicPage(nextUrl.pathname)) {
    return NextResponse.next();
  }

  // Handle API routes
  if (!isPageRoute(nextUrl.pathname)) {
    const shouldBeProtected = isProtectedApiRoute(nextUrl.pathname);

    // Block unauthenticated users from protected API routes
    if (shouldBeProtected && !isLoggedIn) {
      console.warn('Unauthorized API access attempt to:', nextUrl.pathname);
      return NextResponse.json(
        {
          error: 'Authentication required',
          code: 'UNAUTHENTICATED',
          path: nextUrl.pathname,
        },
        { status: 401 },
      );
    }

    // For authenticated requests to protected API routes, add user info to headers
    if (shouldBeProtected && isLoggedIn && req.auth?.user?.id) {
      const requestHeaders = new Headers(req.headers);
      requestHeaders.set('x-user-id', req.auth.user.id);
      requestHeaders.set('x-user-email', req.auth.user.email ?? '');
      requestHeaders.set('x-user-name', req.auth.user.name ?? '');
      requestHeaders.set('x-auth-timestamp', new Date().toISOString());

      if (process.env.NODE_ENV === 'development') {
        console.warn('Authenticated API request to', nextUrl.pathname, 'by user', req.auth.user.id);
      }

      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    }

    // Continue for other API routes
    return NextResponse.next();
  }
  // Handle page routes - redirect unauthenticated users to signin
  if (!isLoggedIn) {
    console.warn('Unauthenticated page access attempt to:', nextUrl.pathname);
    const signInUrl = new URL('/auth/signin', nextUrl.origin);
    signInUrl.searchParams.set('callbackUrl', nextUrl.href);
    return NextResponse.redirect(signInUrl);
  }

  // For authenticated page requests, add user info to headers for server components
  if (req.auth?.user?.id) {
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set('x-user-id', req.auth.user.id);
    requestHeaders.set('x-user-email', req.auth.user.email ?? '');
    requestHeaders.set('x-user-name', req.auth.user.name ?? '');
    requestHeaders.set('x-auth-timestamp', new Date().toISOString());

    if (process.env.NODE_ENV === 'development') {
      console.warn('Authenticated page request to', nextUrl.pathname, 'by user', req.auth.user.id);
    }

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  // Continue with the request for all other cases
  return NextResponse.next();
});

// Configure which routes the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
