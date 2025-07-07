'use client';

import CourseCard from '@/components/Boards/Course/CourseCard';
import { AddCourseDialog } from '@/components/shared/dialogs/AddCourseDialog';
import { Skeleton } from '@/components/ui/skeleton';
import { useCourses } from '@/contexts/use-courses';
import { api, handleApiSuccess } from '@/lib/api/util';
import { handleConfirm } from '@/lib/dialog/util';
import { CommonErrorMessages, ErrorHandlers } from '@/lib/error/util';

export function CoursesTile() {
  const { courses, isLoading, error, deleteCourse, refreshCourses } = useCourses();

  const handleDeleteCourse = async (courseId: string) => {
    await handleConfirm(
      'Are you sure you want to delete this course? This action cannot be undone.',
      async () => {
        try {
          await api.delete(`/api/courses/${courseId}`, CommonErrorMessages.COURSE_DELETE_FAILED);
          deleteCourse(courseId);
          handleApiSuccess('Course deleted successfully');
        } catch (error) {
          ErrorHandlers.api(error, CommonErrorMessages.COURSE_DELETE_FAILED, 'CoursesTile');
        }
      },
      undefined,
      {
        title: 'Delete Course',
        confirmText: 'Delete',
        cancelText: 'Cancel',
        variant: 'destructive',
      },
    );
  };

  if (error) {
    return (
      <div className="border rounded-lg bg-muted/30 p-6">
        <div className="text-center text-red-500">
          Error:
          {' '}
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="border rounded-lg bg-muted/30 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold">Courses</h2>
        <AddCourseDialog onCourseAdded={refreshCourses} />
      </div>
      <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {isLoading
          ? (
            Array.from({ length: 6 }).map((_, index) => (
              // eslint-disable-next-line react/no-array-index-key
              <Skeleton key={index} className="h-40 w-full rounded-lg" />
            ))
          )
          : (courses ?? []).length > 0
            ? (
              (courses ?? []).map(course => (
                <CourseCard
                  key={course.id}
                  course={course}
                  onDeleteCourse={handleDeleteCourse}
                />
              ))
            )
            : (
              <div className="text-muted-foreground col-span-full text-center">
                No courses found. Add a new course to get started!
              </div>
            )}
      </div>
    </div>
  );
}
