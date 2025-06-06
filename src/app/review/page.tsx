"use client";

import { useEffect } from 'react';
import type { Course } from '@/types/course';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CourseSelector } from '@/components/CourseSelector';
import { ErrorState } from '@/components/ui/error-state';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';
import { useCourses } from '@/hooks/use-courses';

export default function ReviewPage() {
  const { courses, isLoading, error, fetchCourses } = useCourses();

  useEffect(() => {
    void fetchCourses();
  }, [fetchCourses]);

  if (error) {
    return <ErrorState message={error} />;
  }

  return (
    <div className="container mx-auto p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Review Tasks</h1>
          <p className="text-muted-foreground mt-2">Select a course to review its tasks</p>
        </div>
        
        {!isLoading && courses.length > 0 && (
          <CourseSelector
            courses={courses}
            buttonClassName="w-[200px]"
            dropdownWidth="200px"
          />
        )}
      </div>

      {isLoading ? (
        <LoadingSkeleton type="card" />
      ) : courses.length === 0 ? (
        <div className="text-center text-muted-foreground">
          No courses found. Add a course to get started.
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Select a course from the dropdown above to review its tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              You can review and manage tasks for each course, including drafts and todo tasks.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 