# SecondBrain ETS - AI Copilot Instructions

This is an AI-powered course management system for ETS university students that parses course plans and creates manageable tasks.

## Architecture Overview

### Core Data Flow

- **Course Processing Pipeline** (`src/pipelines/`): AI-driven course plan parsing workflow
  - `ServerCourseProcessingPipeline` orchestrates step-by-step processing
  - `OpenAIProcessor` handles AI text analysis
  - `PlanetsDataSource` fetches ETS course data
  - Pipeline communicates via `/api/course-pipeline` with real-time step updates

### State Management

- **Zustand Store Pattern**: Centralized global state management
  - **Tasks**: `useTaskStore` (`src/lib/stores/task-store.ts`)
    - All task CRUD operations
    - `useTaskOperations()` hook: Convenience wrapper for common operations
    - `useCourseTasksStore(courseId)`: Get tasks for specific course with reactivity
    - Optimistic updates: UI updates immediately, syncs with backend
  - **Pomodoro**: `usePomodoroStore` (`src/lib/stores/pomodoro-store.ts`)
    - Timer state management with built-in interval handling
    - No provider needed - access state from anywhere
    - Auto-initializes settings from localStorage

### Database Layer

- **Drizzle ORM** with PostgreSQL, schema in `src/server/db/schema.ts`
- **Table Naming**: All tables prefixed with `second-brain_` (see `drizzle.config.ts`)
- **Migrations**: Use `bun run db:generate && bun run db:push` for schema changes

## Development Patterns

### API Route Structure

```typescript
// Use withAuthSimple wrapper for authenticated endpoints
export const POST = withAuthSimple(async (request, user) => {
  // API logic here
});
```

### API Client Pattern

- **Always use the centralized `api` utility** (`src/lib/utils/api/api-client-util.ts`) instead of raw `fetch`
- **Available methods**: `api.get()`, `api.post()`, `api.put()`, `api.patch()`, `api.delete()`
- **Benefits**: Consistent error handling, automatic JSON parsing, centralized configuration
- **Stores can make API calls**: Zustand stores handle API operations directly for better state management

  ```typescript
  import { api } from "@/lib/utils/api/api-client-util";

  // In a store or hook
  const data = await api.post(
    "/api/tasks",
    { title: "New task" },
    "Failed to create task",
  );

  // Error handling is automatic, but you can add custom error messages
  try {
    await api.delete("/api/tasks/123");
  } catch (error) {
    toast.error("Custom error message");
  }
  ```

### Component Organization

- **Feature-based folders**: `/components/Course/`, `/components/Task/`, `/components/Pomodoro/`
- **Shared UI**: `/components/ui/` for reusable components (shadcn/ui)
- **Dialogs**: Global confirmation dialogs via `GlobalConfirmDialogProvider`

### Custom Hooks Pattern

- **Naming**: `use-[feature].ts` (kebab-case, not camelCase)
- **Data fetching**: Hooks like `use-course.ts` handle CRUD operations
- **Task operations**: Use `useTaskOperations()` from `use-task-store.ts` for all task CRUD
  - Replaces direct API calls with store-based operations
  - Automatic state synchronization across components
  - Built-in loading states and error handling

### Environment & Configuration

- **Type-safe env**: `src/env.js` using `@t3-oss/env-nextjs` with Zod validation
- **Build tool**: Use Bun commands (`bun dev`, `bun build`) not npm/yarn
- **Development**: `bun dev --turbo --hostname localhost` for local development

### Keyboard Shortcuts System

- **Global shortcuts**: Defined in `src/lib/keyboard-shortcuts.ts`
- **Command palette**: `Cmd/Ctrl+K` opens global command palette
- **Types**: Navigate to pages (including `/courses/add`), open dialogs, or toggle UI elements

## Key Workflows

### Adding New Features

1. Define types in `src/types/[feature].ts`
2. Create database schema in `src/server/db/schema.ts`
3. Generate migration: `bun run db:generate && bun run db:push`
4. Create API routes in `src/app/api/[feature]/`
5. Build custom hook in `src/hooks/use-[feature].ts`
6. Create components in `src/components/[Feature]/`

### Working with Tasks

- **Always use the task store** for task operations:

  ```typescript
  // Create task
  await createTask("course-id", {
    title: "Task title",
    notes: "Description",
    estimatedEffort: 2,
    dueDate: new Date(),
    type: "theorie",
    status: "todo",
  });

  // Update status (optimistic)
  await updateTaskStatus("task-id", "completed");

  // Delete task
  await deleteTask("task-id");
  ```

- **Query tasks** using store selectors for reactive updates

### AI Processing Integration

- Use `ServerCourseProcessingPipeline` for multi-step AI workflows
- Implement step-by-step processing with status updates
- Handle `PipelineStepRequest`/`PipelineStepResult` types for API communication

### Authentication Flow

- NextAuth.js with Drizzle adapter
- Discord and Google OAuth providers
- Use `withAuthSimple` wrapper for API route protection

### Exception Handling

```typescript
try {
  // risky operation
} catch (error) {
  console.log(error);
}
```

### Performance Tracing

```typescript
Sentry.startSpan(
  {
    op: "ui.click",
    name: "Course Processing Button",
  },
  (span) => {
    span.setAttribute("courseCode", courseCode);
    // operation here
  },
);
```
