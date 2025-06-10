"use client";

import { AddCourseDialog } from "@/components/shared/dialogs/AddCourseDialog";
import { Skeleton } from "@/components/ui/skeleton";
import CourseCard from "@/components/CourseCard";
import { TodaysFocus } from "@/components/Boards/TodaysFocus/TodaysFocus";
import { PomodoroContainer } from "@/components/Boards/FocusSession/PomodoroContainer";
import { handleConfirm } from "@/lib/dialog/util";
import { api, handleApiSuccess } from "@/lib/api/util";
import { ErrorHandlers, CommonErrorMessages } from "@/lib/error/util";
import { useCourses } from "@/contexts/courses-context";
import { WeeklyRoadmap } from "@/components/Boards/WeeklyRoadmap/WeeklyRoadmap";

export default function Home() {
  const { courses, isLoading, error, deleteCourse, refreshCourses } = useCourses();

  const handleDeleteCourse = async (courseId: string) => {
    await handleConfirm(
      "Are you sure you want to delete this course? This action cannot be undone.",
      async () => {
        try {
          await api.delete(`/api/courses/${courseId}`, CommonErrorMessages.COURSE_DELETE_FAILED);
          deleteCourse(courseId);
          handleApiSuccess("Course deleted successfully");
        } catch (error) {
          ErrorHandlers.api(error, CommonErrorMessages.COURSE_DELETE_FAILED, 'HomePage');
        }
      }
    );
  };

  if (error) {
    return <div className="text-center text-red-500">Error: {error}</div>;
  }

  return (
    <main className="container mx-auto px-8 flex min-h-screen flex-col gap-12 mt-2 mb-3.5">
      <h1 className="text-3xl font-bold text-foreground">
        Dashboard
      </h1>

      <section>
        <div className="flex gap-6">
          {/* Today's Focus - 2/3 width */}
          <div className="flex-1 w-2/3">
            <TodaysFocus />
          </div>

          {/* Pomodoro Container - 1/3 width */}
          <div className="w-1/3">
            <PomodoroContainer />
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <div className="border rounded-lg bg-muted/30 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold">Courses</h2>
            <AddCourseDialog onCourseAdded={refreshCourses} />
          </div>
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
