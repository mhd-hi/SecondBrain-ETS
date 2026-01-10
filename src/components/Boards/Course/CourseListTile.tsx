'use client';

import type { Course } from '@/types/course';
import CourseCard from '@/components/Boards/Course/CourseCard';
import { AddCourseDialog } from '@/components/shared/dialogs/AddCourseDialog';
import { Skeleton } from '@/components/ui/skeleton';
import { deleteCourseById } from '@/hooks/use-course';
import { useCourses } from '@/hooks/use-course-store';
import { handleApiSuccess } from '@/lib/utils';
import { handleConfirm } from '@/lib/utils/dialog-util';
import { CommonErrorMessages, ErrorHandlers } from '@/lib/utils/errors/error';

export function CourseListTile() {
  const { courses, isLoading, refreshCourses } = useCourses();

  const handleDeleteCourse = async (courseId: string) => {
    await handleConfirm(
      'Are you sure you want to delete this course? This action cannot be undone.',
        async () => {
          try {
            await deleteCourseById(courseId);
            await refreshCourses();
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

  return (
    <div className="border rounded-lg bg-muted/30 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Courses</h2>
        <AddCourseDialog onCourseAdded={refreshCourses} />
      </div>
      <div className="grid w-full gap-3" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
        {isLoading
          ? (
            Array.from({ length: 5 }).map((_, index) => (
              // eslint-disable-next-line react/no-array-index-key
              <Skeleton key={index} className="h-40 w-full rounded-lg" />
            ))
          )
          : (courses ?? []).length > 0
            ? (
              (courses ?? []).map((course: Course) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  onDeleteCourse={handleDeleteCourse}
                />
              ))
            )
            : (
              <div className="text-muted-foreground col-span-full text-center">
                No courses found!
                <br />
                📚 Add a new course to get started.
              </div>
            )}
      </div>
    </div>
  );
}
