'use client';

import { useCourses } from '@/contexts/use-courses';
import { Sidebar } from './sidebar';

export function SidebarWrapper() {
  const { coursesListItems, isLoading, refreshCourses } = useCourses();

  return <Sidebar courses={coursesListItems} isLoading={isLoading} onCourseAdded={refreshCourses} />;
}
