"use client";

import { Sidebar } from "./sidebar";
import { useCourses } from "@/contexts/courses-context";

export function SidebarWrapper() {
  const { coursesListItems, refreshCourses } = useCourses();

  return <Sidebar courses={coursesListItems} onCourseAdded={refreshCourses} />;
}