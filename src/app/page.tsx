"use client";

import { useEffect, useState } from "react";
import { AddCourseDialog } from "@/components/shared/dialogs/AddCourseDialog";
import type { Course } from "@/types/course";
import { Skeleton } from "@/components/ui/skeleton";
import CourseCard from "@/components/CourseCard";
import { WeeklyRoadmap } from "./dashboard/components/WeeklyRoadmap/WeeklyRoadmap";
import { handleConfirm } from "@/lib/dialog/util";
import { api, handleApiSuccess } from "@/lib/api/util";
import { withLoadingState } from "@/lib/loading/util";
import { ErrorHandlers, CommonErrorMessages } from "@/lib/error/util";

export default function Home() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCourses = async () => {
    setError(null);
    try {
      const data = await withLoadingState(
        () => api.get<Course[]>("/api/courses", CommonErrorMessages.COURSE_FETCH_FAILED),
        setIsLoading
      );
      setCourses(data || []);
      console.log("Courses data received by page.tsx:", data);
    } catch (error) {
      ErrorHandlers.silent(error, 'HomePage fetchCourses');
      setError("Failed to load courses");
    }
  };

  const handleDeleteCourse = async (courseId: string) => {
    await handleConfirm(
      "Are you sure you want to delete this course? This action cannot be undone.",
      async () => {
        try {
          await withLoadingState(
            async () => {
              await api.delete(`/api/courses/${courseId}`, CommonErrorMessages.COURSE_DELETE_FAILED);
              setCourses((prevCourses) =>
                prevCourses.filter((course) => course.id !== courseId)
              );
              handleApiSuccess("Course deleted successfully");
            },
            setIsLoading
          );
        } catch (error) {
          ErrorHandlers.api(error, CommonErrorMessages.COURSE_DELETE_FAILED, 'HomePage');
        }
      }
    );
  };

  useEffect(() => {
    void fetchCourses();
  }, []);

  if (error) {
    return <div className="text-center text-red-500">Error: {error}</div>;
  }

  return (
    <main className="container mx-auto px-8 py-8 flex min-h-screen flex-col gap-12 mt-2 mb-3.5">
      <h1 className="text-3xl font-bold text-foreground">
        Dashboard
      </h1>

      <section className="space-y-6">
        <AddCourseDialog onCourseAdded={fetchCourses} />
        <div className="border rounded-lg bg-muted/30 p-6">
          <h2 className="text-2xl font-semibold mb-6">Courses</h2>
          <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {isLoading ? (
              // Loading state: Display skeletons
              Array.from({ length: 6 }).map((_, index) => (
                <Skeleton key={index} className="h-40 w-full rounded-lg" />
              ))
            ) : // Display course cards or a message if no courses
            (courses ?? []).length > 0 ? (
              (courses ?? []).map((course) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  onDeleteCourse={handleDeleteCourse}
                />
              ))
            ) : (
              <div className="text-muted-foreground col-span-full text-center">
                No courses found. Add a new course to get started!
              </div>
            )}
          </div>
        </div>
      </section>

      <section>
        <WeeklyRoadmap />
      </section>
    </main>
  );
}
