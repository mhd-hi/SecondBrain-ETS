"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Course } from '@/types/course';
import { TaskStatus } from '@/types/task';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";

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
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Review Tasks</h1>
          <p className="text-muted-foreground mt-2">Select a course to review its tasks</p>
        </div>
        
        {!isLoading && courses.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-[200px] justify-between">
                Select Course
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[200px]">
              {courses.map((course) => {
                const pendingTasks = course.tasks?.filter(task => task.status === TaskStatus.DRAFT).length ?? 0;
                return (
                  <DropdownMenuItem
                    key={course.id}
                    onClick={() => router.push(`/review/${course.id}`)}
                    className="flex items-center justify-between"
                  >
                    <span>{course.code}</span>
                    {pendingTasks > 0 && (
                      <span className="text-xs text-destructive">
                        {pendingTasks} pending
                      </span>
                    )}
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

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
        <Card>
          <CardHeader>
            <CardTitle>Select a course from the dropdown above to review its tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              You can review and manage tasks for each course, including drafts and pending tasks.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 