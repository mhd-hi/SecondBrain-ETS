'use client';

/**
 * @deprecated Use hooks from @/hooks/use-course-store.ts instead
 * This file is kept for backward compatibility but will be removed
 *
 * Migration guide:
 * - useCoursesContext() -> useCourses() or useCourseOperations()
 */

export { useCourseOperations, useCourses as useCoursesContext } from '@/hooks/use-course-store';
