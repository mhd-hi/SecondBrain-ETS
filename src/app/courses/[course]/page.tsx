"use client";

import { useEffect, useState, useCallback } from 'react';
import { use } from 'react';
import { toast } from 'sonner';
import type { Course } from '@/types/course';
import { type Task } from '@/types/task';
import { calculateTaskDueDate } from '@/lib/task/util';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useRouter } from "next/navigation";
import { AddTaskDialog } from "@/app/dashboard/components/AddTaskDialog";
import { CourseSelector } from '@/components/CourseSelector';
import { TaskStatusChanger } from '@/components/TaskStatusChanger';
import { MoreActionsDropdown } from "@/components/shared/atoms/more-actions-dropdown";
import { DueDateDisplay } from "@/components/shared/atoms/due-date-display";
import { api } from "@/lib/api/util";
import { withLoadingAndErrorHandling } from "@/lib/loading/util";
import { ErrorHandlers } from "@/lib/error/util";

interface CoursePageProps {
  params: Promise<{
    course: string;
  }>;
}

interface CourseResponse extends Course {
  tasks: Task[];
}

export default function CoursePage({ params }: CoursePageProps) {
  const router = useRouter();
  const unwrappedParams = use(params);
  const courseId = unwrappedParams.course;
  const [course, setCourse] = useState<Course | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCourses = useCallback(async () => {
    try {
      const data = await api.get<Course[]>('/api/courses');
      setCourses(data);
    } catch (error) {
      ErrorHandlers.api(error, 'Failed to load courses');
    }
  }, []);

  const fetchCourse = useCallback(async () => {
    await withLoadingAndErrorHandling(
      async () => {
        const data = await api.get<CourseResponse>(`/api/courses/${courseId}`);

        // Convert dueDate strings to Date objects and handle invalid dates
        const tasksWithValidatedDates: Task[] = data.tasks.map(task => {
            let dueDate: Date;
            // Attempt to create Date from fetched dueDate
            const fetchedDate = task.dueDate ? new Date(task.dueDate) : undefined;

            // If fetched dueDate is invalid or missing, calculate based on week
            if (!fetchedDate || isNaN(fetchedDate.getTime())) {
                // Fallback: calculate dueDate based on week if original is invalid or missing
                dueDate = calculateTaskDueDate(task.week);
            } else {
                // Otherwise, use the valid fetched date
                dueDate = fetchedDate;
            }

            return {
                ...task,
                dueDate: dueDate, // Ensure dueDate is always a Date
            } as Task; // Cast to Task to match state type
        });

        setCourse(data);
        setTasks(tasksWithValidatedDates);
      },
      setIsLoading,
      (error) => {
        setError('Failed to load course data');
        ErrorHandlers.api(error, 'Failed to load course');
      }
    );
  }, [courseId]);

  useEffect(() => {
    void fetchCourses();
    void fetchCourse();
  }, [courseId, fetchCourse, fetchCourses]);

  const handleUpdateTask = async (taskId: string, updates: Partial<Task>) => {
    try {
      await api.patch(`/api/tasks/${taskId}`, updates);

      // Update local state instead of refetching
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === taskId 
            ? { ...task, ...updates }
            : task
        )
      );

      toast.success('Task updated successfully');
    } catch (error) {
      ErrorHandlers.api(error, 'Failed to update task');
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await api.delete(`/api/tasks/${taskId}`);
      toast.success('Task deleted successfully');
      await fetchCourse();
    } catch (error) {
      ErrorHandlers.api(error, 'Failed to delete task');
    }
  };

  // Group tasks by week
  const tasksByWeek = tasks.reduce((acc, task) => {
    const week = task.week;
    acc[week] ??= [];
    acc[week]?.push(task);
    return acc;
  }, {} as Record<number, Task[]>);

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive">Error</h1>
          <p className="mt-2 text-muted-foreground">{error}</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => router.push("/")}
          >
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="container mx-auto p-8">
        <div className="space-y-4">
          <Skeleton className="h-8 w-1/4" />
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          {!isLoading && courses.length > 0 && (
            <CourseSelector
              courses={courses}
              selectedCourse={course}
              onCourseSelect={(courseId) => router.push(`/courses/${courseId}`)}
            />
          )}
        </div>

        {course && (
          <AddTaskDialog
            courseId={course.id}
            courseCode={course.code}
            onTaskAdded={fetchCourse}
          />
        )}
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <div className="text-center text-muted-foreground mb-4">
            Loading tasks...
          </div>
          <div className="grid gap-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
        </div>
      ) : tasks.length > 0 ? (
        <div className="space-y-8">
          {Object.entries(tasksByWeek)
            .sort(([a], [b]) => Number(a) - Number(b))
            .map(([week, weekTasks]) => (
              <div key={week} className="space-y-4">
                <h3 className="text-lg font-semibold">Week {week}</h3>
                <div className="grid gap-4">
                  {weekTasks.map((task) => (
                    <div
                      key={task.id}
                      className="relative group p-4 rounded-lg border bg-card text-card-foreground shadow-sm"
                    >
                      <MoreActionsDropdown
                        actions={[
                          {
                            label: "Delete",
                            onClick: () => void handleDeleteTask(task.id),
                            destructive: true,
                          },
                        ]}
                        triggerClassName="absolute -top-[10px] -right-[10px] z-10 opacity-0 group-hover:opacity-100"
                      />
                      
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1 flex-grow">
                          <h4 className="font-medium">{task.title}</h4>
                          <p className="text-sm text-muted-foreground">{task.notes}</p>
                          {task.dueDate && (
                            <DueDateDisplay date={task.dueDate} />
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <TaskStatusChanger
                            currentStatus={task.status}
                            onStatusChange={(newStatus) => handleUpdateTask(task.id, { status: newStatus })}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
        </div>
      ) : (
        <div className="text-center text-muted-foreground">
          No tasks found. Add a task to get started.
        </div>
      )}
    </div>
  );
}