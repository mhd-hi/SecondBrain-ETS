"use client";

import { useEffect, useState } from "react";
import { Sidebar } from "./sidebar";
import { api } from "@/lib/api/util";
import { ErrorHandlers } from "@/lib/error/util";

interface Course {
  id: string;
  code: string;
  name: string;
  inProgressCount: number;
}

export function SidebarWrapper() {
  const [courses, setCourses] = useState<Course[]>([]);

  const fetchCourses = async () => {
    try {
      const data = await api.get<Course[]>("/api/courses");
      setCourses(data || []);
    } catch (error) {
      ErrorHandlers.silent(error, 'SidebarWrapper fetchCourses');
    }
  };

  useEffect(() => {
    void fetchCourses();
  }, []);

  return <Sidebar courses={courses} onCourseAdded={fetchCourses} />;
}