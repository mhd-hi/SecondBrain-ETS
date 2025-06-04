"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Course } from '@/types/course';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function ReviewPage() {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch('/api/courses');
        if (!response.ok) {
          throw new Error('Failed to fetch courses');
        }
        const data = await response.json() as Course[];
        setCourses(data);
      } catch (err) {
        console.error('Error fetching courses:', err);
        setError('Failed to load courses');
      } finally {
        setIsLoading(false);
      }
    };

    void fetchCourses();
  }, []);

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive">Error</h1>
          <p className="mt-2 text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Review Tasks</h1>
      <p className="text-muted-foreground mb-8">Select a course to review its tasks</p>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      ) : courses.length === 0 ? (
        <div className="text-center text-muted-foreground">
          No courses found. Add a course to get started.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => {
            const pendingTasks = course.tasks?.filter(task => task.isDraft).length ?? 0;
            
            return (
              <Card
                key={course.id}
                className="cursor-pointer transition-colors hover:bg-accent"
                onClick={() => router.push(`/review/${course.id}`)}
              >
                <CardHeader>
                  <CardTitle className="flex justify-between items-center">
                    <span>{course.code}</span>
                    {pendingTasks > 0 && (
                      <span className="text-sm font-medium text-destructive">
                        {pendingTasks} pending
                      </span>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{course.name}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
} 