'use client';

import CourseCard from '@/components/Boards/Course/CourseCard';
import { AddCourseDialog } from '@/components/shared/dialogs/AddCourseDialog';
import { Skeleton } from '@/components/ui/skeleton';
import { useCoursesContext } from '@/contexts/use-courses';
import { handleApiSuccess } from '@/lib/utils';
import { api } from '@/lib/utils/api/api-client-util';
import { handleConfirm } from '@/lib/utils/dialog-util';
import { CommonErrorMessages, ErrorHandlers } from '@/lib/utils/errors/error';

export function CourseListTile() {
  const { courses, isLoading, error, deleteCourse, refreshCourses } = useCoursesContext();

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
  <div className="grid w-full gap-3" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
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
