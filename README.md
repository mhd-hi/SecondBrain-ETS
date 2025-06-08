# SecondBrain - Your Course Management Assistant

A Next.js application that helps students manage their course workload by intelligently parsing course plans and creating manageable tasks.

## Project Overview

SecondBrain uses AI to parse ETS course plans and break them down into manageable tasks, helping students stay organized and on track with their studies.

## Completed Sprints

### Sprint 1: Core Store & Add-Course Flow ✅
- Implemented Zustand store with IndexedDB persistence
- Created AddCourseForm component for course imports
- Built minimal dashboard UI
- Implemented `/api/parse-course` API route with OpenAI integration
- Added support for subtasks in course plan parsing

## Current Sprint

### Sprint 2: Review Queue & Task Management
**Goal:** Build the Review Queue interface to manage AI-generated task drafts.

#### Tasks:
1. **Review Queue Page**
   - Create `/app/review/[course]/page.tsx`
   - Implement CourseSidebar component
   - Build WeekAccordion for task grouping
   - Add DraftCard component for individual tasks

2. **Task Management Features**
   - Add "Accept All" and "Discard All" functionality
   - Implement per-week task management
   - Create task modification interface
   - Add progress tracking

3. **UI/UX Improvements**
   - Implement responsive design
   - Add loading states
   - Improve error handling
   - Enhance accessibility

## Tech Stack

- [Next.js](https://nextjs.org)
- [NextAuth.js](https://next-auth.js.org)
- [Drizzle](https://orm.drizzle.team)
- [Tailwind CSS](https://tailwindcss.com)
- [Zustand](https://github.com/pmndrs/zustand)
- [OpenAI API](https://openai.com)

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   bun install
   ```
3. Set up environment variables:
   ```env
   OPENAI_API_KEY=your_api_key_here
   ```
4. Run the development server:
   ```bash
   bun run dev
   ```

## Development

- `bun dev` - Start development server
- `bun build` - Build for production
- `bun lint` - Run ESLint
- `bun typecheck` - Run TypeScript compiler check

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request
