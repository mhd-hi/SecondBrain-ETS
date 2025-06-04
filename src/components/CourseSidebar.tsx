'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { Course, Draft } from '@/types/course';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface CourseSidebarProps {
  selectedCourseId: string;
}

export default function CourseSidebar({ selectedCourseId }: CourseSidebarProps) {
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
        console.log('Fetched courses:', data);
        if (!Array.isArray(data)) {
          console.error('Invalid courses data:', data);
          throw new Error('Invalid courses data received');
        }
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

  if (isLoading) {
    return (
      <nav className="w-64 border-r bg-background p-4 h-full">
        <h2 className="text-lg font-semibold mb-4">My Courses</h2>
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      </nav>
    );
  }

  if (error) {
    return (
      <nav className="w-64 border-r bg-background p-4 h-full">
        <h2 className="text-lg font-semibold mb-4">My Courses</h2>
        <div className="text-destructive">{error}</div>
      </nav>
    );
  }

  if (courses.length === 0) {
    return (
      <nav className="w-64 border-r bg-background p-4 h-full">
        <h2 className="text-lg font-semibold mb-4">My Courses</h2>
        <div className="text-muted-foreground">No courses found</div>
      </nav>
    );
  }

  return (
    <nav className="w-64 border-r bg-background p-4 h-full">
      <h2 className="text-lg font-semibold mb-4">My Courses</h2>
      <ScrollArea className="h-[calc(100vh-8rem)]">
        <ul className="space-y-2">
          {courses.map((course) => {
            const pending = course.tasks?.filter((task: Draft) => task.isDraft).length ?? 0;
            const isSelected = course.id === selectedCourseId;

            return (
              <li key={course.id}>
                <Link
                  href={`/review/${course.id}`}
                  className={cn(
                    "flex justify-between items-center px-3 py-2 rounded-lg transition-colors",
                    isSelected
                      ? "bg-accent text-accent-foreground"
                      : "hover:bg-accent/50 text-foreground"
                  )}
                >
                  <span className="font-medium">{course.code}</span>
                  {pending > 0 && (
                    <span className="text-sm font-medium text-destructive">
                      ({pending})
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </ScrollArea>
    </nav>
  );
} 