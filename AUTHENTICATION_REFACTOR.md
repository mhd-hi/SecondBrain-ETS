# Authentication Refactoring Guide

## Overview

This guide shows how to refactor existing API routes to use the new authentication system that eliminates code duplication and improves security.

## Key Improvements

### 1. **Eliminated Code Duplication**
Before: Every route had 6+ lines of auth code
After: Single `withAuth()` or `withAuthSimple()` wrapper

### 2. **Enhanced Security**
- Automatic user ownership verification
- Consistent error handling
- Built-in authorization checks
- Protection against SQL injection via parameterized queries

### 3. **Better Type Safety**
- Authenticated user object always available
- Type-safe parameter extraction
- Better error types

## Migration Patterns

### Before (Old Pattern)
```typescript
export async function GET(request: Request) {
  try {
    // Repeated in every route ❌
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    
    // Manual ownership verification ❌
    const course = await db.select().from(courses).where(
      and(eq(courses.id, courseId), eq(courses.userId, userId))
    ).limit(1);

    if (!course.length) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }

    // Manual user filtering ❌
    return await db.select().from(tasks).where(
      and(eq(tasks.courseId, courseId), eq(tasks.userId, userId))
    );
  } catch (error) {
    // Inconsistent error handling ❌
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
```

### After (New Pattern)
```typescript
export const GET = withAuthSimple(
  async (request, user) => {
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('courseId');
    
    if (!courseId) {
      return NextResponse.json(
        { error: 'courseId parameter is required', code: 'MISSING_PARAMETER' },
        { status: 400 }
      );
    }

    // Automatic ownership verification ✅
    // Automatic user filtering ✅  
    // Consistent error handling ✅
    const courseTasks = await getUserCourseTasks(courseId, user.id);
    return NextResponse.json(courseTasks);
  }
);
```

## Available Wrappers

### 1. `withAuthSimple(handler)`
For routes without dynamic parameters:
```typescript
export const GET = withAuthSimple(
  async (request, user) => {
    // user.id is guaranteed to exist
    return NextResponse.json({ userId: user.id });
  }
);
```

### 2. `withAuth<TParams>(handler)`
For routes with dynamic parameters:
```typescript
export const PATCH = withAuth<{ taskId: string }>(
  async (request, { params, user }) => {
    const { taskId } = await params;
    const task = await getUserTask(taskId, user.id);
    return NextResponse.json(task);
  }
);
```

### 3. `withAuthAndErrorHandling<TParams>(handler, context)`
For routes that need custom error context:
```typescript
export const DELETE = withAuthAndErrorHandling<{ courseId: string }>(
  async (request, { params, user }) => {
    const { courseId } = await params;
    await deleteUserCourse(courseId, user.id);
    return NextResponse.json({ success: true });
  },
  'Delete course'
);
```

## Secure Database Functions

### Query Functions (with automatic user filtering)
```typescript
// Instead of manual queries
const tasks = await db.select().from(tasks).where(
  and(eq(tasks.userId, userId), eq(tasks.courseId, courseId))
);

// Use secure functions
const tasks = await getUserCourseTasks(courseId, user.id);
```

### Available Functions
- `getUserCourses(userId)` - Get all courses for user
- `getUserCourse(courseId, userId)` - Get single course with ownership check
- `getUserCourseTasks(courseId, userId)` - Get tasks for course
- `getUserTask(taskId, userId)` - Get single task with ownership check
- `createUserTask(userId, taskData)` - Create task with auto user assignment
- `updateUserTask(taskId, userId, updates)` - Update with ownership check
- `deleteUserTask(taskId, userId)` - Delete with ownership check

## Security Benefits

### 1. **Automatic User Isolation**
```typescript
// Old: Easy to forget user filtering
const tasks = await db.select().from(tasks); // ❌ Gets ALL tasks

// New: User filtering built-in
const tasks = await getUserTasks(user.id); // ✅ Only user's tasks
```

### 2. **Ownership Verification**
```typescript
// Old: Manual verification
const task = await db.select().from(tasks).where(eq(tasks.id, taskId));
if (!task.length || task[0].userId !== userId) {
  throw new Error('Not found');
}

// New: Automatic verification
const task = await getUserTask(taskId, user.id); // ✅ Throws if not owned
```

### 3. **Consistent Error Responses**
```typescript
// Old: Inconsistent errors
return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
return NextResponse.json({ message: "Not found" }, { status: 404 });

// New: Consistent structure
{ error: "Authentication required", code: "UNAUTHENTICATED" }
{ error: "Task not found or access denied", code: "UNAUTHORIZED" }
```

## Middleware Enhancements

The middleware now:
1. ✅ Protects more route patterns
2. ✅ Sets user headers for fast authentication
3. ✅ Logs unauthorized attempts
4. ✅ Provides better error responses
5. ✅ Excludes public routes properly

## Migration Checklist

For each API route:

1. [ ] Replace `auth()` calls with `withAuth*()` wrapper
2. [ ] Replace manual DB queries with secure functions
3. [ ] Update parameter extraction to use context
4. [ ] Remove try/catch blocks (handled by wrapper)
5. [ ] Update error responses to use standard format
6. [ ] Test ownership verification works
7. [ ] Verify route is covered by middleware

## Example Routes to Refactor

### High Priority (Security-Critical)
- [ ] `/api/tasks/[taskId]/route.ts`
- [ ] `/api/tasks/[taskId]/subtasks/[subtaskId]/status/route.ts` ✅ Done
- [ ] `/api/courses/[courseId]/route.ts`
- [ ] `/api/tasks/focus/route.ts`
- [ ] `/api/tasks/weekly/route.ts`

### Medium Priority
- [ ] `/api/drafts/route.ts`
- [ ] `/api/tasks/important/route.ts`
- [ ] `/api/tasks/batch/route.ts`

### Low Priority (Public routes)
- `/api/course-pipeline/route.ts` (may need auth later)
- `/api/parse-course/route.ts` (public)

## Testing

After refactoring, test:
1. ✅ Authenticated requests work
2. ✅ Unauthenticated requests return 401
3. ✅ Cross-user access returns 403
4. ✅ Error responses are consistent
5. ✅ Performance hasn't regressed
