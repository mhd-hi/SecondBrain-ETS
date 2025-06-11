'use client';

import { use } from 'react';
import { CoursesContext } from './courses-context';

export function useCourses() {
  const context = use(CoursesContext);
  if (context === undefined) {
    throw new Error('useCourses must be used within a CoursesProvider');
  }
  return context;
}
