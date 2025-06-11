'use client';

import { useCourses } from '@/contexts/use-courses';
import { Sidebar } from './sidebar';

export function SidebarWrapper() {
  const { coursesListItems, refreshCourses } = useCourses();

  return <Sidebar courses={coursesListItems} onCourseAdded={refreshCourses} />;
}
