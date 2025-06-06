"use client";

import { useEffect, useState } from "react";
import { AddCourseForm } from "./components/AddCourseForm";
import type { Course } from "@/types/course";
import { Skeleton } from "@/components/ui/skeleton";
import CourseCard from "@/components/CourseCard";
import { toast } from "sonner";
import { WeeklyRoadmap } from "./dashboard/components/WeeklyRoadmap";
import { handleConfirm } from "@/lib/dialog/util";

export default function Home() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleDeleteCourse = async (courseId: string) => {
    await handleConfirm(
      "Are you sure you want to delete this course? This action cannot be undone.",
      async () => {
        setIsLoading(true);
        try {
          const response = await fetch(`/api/courses/${courseId}`, {
            method: "DELETE",
          });

          if (!response.ok) {
            const errorData = (await response.json()) as { error?: string };
            throw new Error(errorData.error ?? "Failed to delete course");
          }

          setCourses((prevCourses) =>
            prevCourses.filter((course) => course.id !== courseId),
          );

          toast.success("Course deleted successfully");
        } catch (err) {
          console.error("Error deleting course:", err);
          const errorMessage =
            err instanceof Error ? err.message : "An unknown error occurred";
          toast.error("Failed to delete course", {
            description: errorMessage,
          });
        } finally {
          setIsLoading(false);
        }
      }
    );
  };

  useEffect(() => {
    const fetchCourses = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch("/api/courses", {
          cache: "no-store",
        });
        if (!response.ok) {
          throw new Error("Failed to fetch courses");
        }
        const data = (await response.json()) as Course[];
        setCourses(data || []);
        console.log("Courses data received by page.tsx:", data);
      } catch (err) {
        console.error("Error fetching courses:", err);
        setError("Failed to load courses");
      } finally {
        setIsLoading(false);
      }
    };

    void fetchCourses();
  }, []);

  if (error) {
    return <div className="text-center text-red-500">Error: {error}</div>;
  }

  return (
    <main className="container flex min-h-screen flex-col gap-12 p-4">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
        Dashboard
      </h1>

      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">Courses</h2>
        <AddCourseForm />
        <div className="grid w-full max-w-6xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {isLoading ? (
            // Loading state: Display skeletons
            Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-48 w-full rounded-lg" />
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
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">Weekly Roadmap</h2>
        <WeeklyRoadmap />
      </section>
    </main>
  );
}
