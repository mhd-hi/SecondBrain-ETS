import { auth } from "@/server/auth";
import { NextResponse } from "next/server";

// Define routes that require authentication with more comprehensive patterns
const protectedApiRoutes = [
  "/api/courses",
  "/api/tasks", 
  "/api/drafts",
  "/api/upload",
  "/api/cron/cleanup-courses", // Protect cron jobs
];

// Define public API routes that should not be protected
const publicApiRoutes = [
  "/api/auth",
  "/api/course-pipeline", // May need authentication later, but currently public
  "/api/parse-course",
];

/**
 * Check if a path should be protected
 */
function isProtectedRoute(pathname: string): boolean {
  // Check if it's explicitly public first
  if (publicApiRoutes.some(route => pathname.startsWith(route))) {
    return false;
  }
  
  // Check if it matches any protected route pattern
  return protectedApiRoutes.some(route => pathname.startsWith(route));
}

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth?.user;
  
  // Check if this is a protected API route
  const shouldBeProtected = isProtectedRoute(nextUrl.pathname);

  // Block unauthenticated users from protected routes
  if (shouldBeProtected && !isLoggedIn) {
    console.warn(`Unauthorized access attempt to: ${nextUrl.pathname}`);
    return NextResponse.json(
      { 
        error: "Authentication required",
        code: "UNAUTHENTICATED",
        path: nextUrl.pathname 
      },
      { status: 401 }
    );
  }

  // For authenticated requests to protected routes, add user info to headers
  if (shouldBeProtected && isLoggedIn && req.auth?.user?.id) {
    // Clone the request headers and add user information
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set('x-user-id', req.auth.user.id);
    requestHeaders.set('x-user-email', req.auth.user.email ?? '');
    requestHeaders.set('x-user-name', req.auth.user.name ?? '');
    
    // Add timestamp for debugging
    requestHeaders.set('x-auth-timestamp', new Date().toISOString());

    // Log successful authentication for debugging (remove in production)
    if (process.env.NODE_ENV === 'development') {
      console.log(`Authenticated request to ${nextUrl.pathname} by user ${req.auth.user.id}`);
    }

    // Create a new response with the updated headers
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
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
