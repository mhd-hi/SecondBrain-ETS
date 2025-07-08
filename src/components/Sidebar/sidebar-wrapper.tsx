'use client';

import { useCourses } from '@/contexts/use-courses';
import { AppSidebar } from './sidebar';

export function SidebarWrapper() {
  const { coursesListItems, isLoading, refreshCourses } = useCourses();

  return <AppSidebar courses={coursesListItems} isLoading={isLoading} onCourseAdded={refreshCourses} />;
}
