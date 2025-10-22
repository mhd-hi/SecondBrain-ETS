# SecondBrain ETS - AI Copilot Instructions

This is an AI-powered course management system for ETS university students that parses course plans and creates manageable tasks using OpenAI.

## Architecture Overview

### Core Data Flow
- **Course Processing Pipeline** (`src/pipelines/`): AI-driven course plan parsing workflow
  - `ServerCourseProcessingPipeline` orchestrates step-by-step processing
  - `OpenAIProcessor` handles AI text analysis
  - `PlanetsDataSource` fetches ETS course data
  - Pipeline communicates via `/api/course-pipeline` with real-time step updates

### State Management
- **React Context Pattern**: All global state uses React Context providers
  - `CoursesProvider` (`src/contexts/courses-context.tsx`): Main course data
  - `PomodoroProvider` (`src/contexts/pomodoro-provider.tsx`): Timer functionality
  - Always wrap components in provider hierarchy defined in `app/layout.tsx`

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

### Component Organization
- **Feature-based folders**: `/components/Course/`, `/components/Task/`, `/components/Pomodoro/`
- **Shared UI**: `/components/ui/` for reusable components (shadcn/ui)
- **Dialogs**: Global confirmation dialogs via `GlobalConfirmDialogProvider`

### Custom Hooks Pattern
- **Naming**: `use-[feature].ts` (kebab-case, not camelCase)
- **Data fetching**: Hooks like `use-course.ts`, `use-task.ts` handle CRUD operations
- **Context consumption**: `use-courses.ts` exports `useCoursesContext()`

### Environment & Configuration
- **Type-safe env**: `src/env.js` using `@t3-oss/env-nextjs` with Zod validation
- **Build tool**: Use Bun commands (`bun dev`, `bun build`) not npm/yarn
- **Development**: `bun dev --turbo --hostname localhost` for local development

### Keyboard Shortcuts System
- **Global shortcuts**: Defined in `src/lib/keyboard-shortcuts.ts`
- **Command palette**: `Cmd/Ctrl+K` opens global command palette
- **Types**: Navigate to pages, open dialogs, or toggle UI elements

## Key Workflows

### Adding New Features
1. Define types in `src/types/[feature].ts`
2. Create database schema in `src/server/db/schema.ts`
3. Generate migration: `bun run db:generate && bun run db:push`
4. Create API routes in `src/app/api/[feature]/`
5. Build custom hook in `src/hooks/use-[feature].ts`
6. Create components in `src/components/[Feature]/`

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
Sentry.startSpan({
  op: 'ui.click',
  name: 'Course Processing Button',
}, (span) => {
  span.setAttribute('courseCode', courseCode);
  // operation here
});
```
