"use client";

import { useEffect } from 'react';
import { use } from 'react';
import { toast } from 'sonner';
import { type Task, TaskStatus } from '@/types/task';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useRouter } from "next/navigation";
import { AddTaskDialog } from "@/app/dashboard/components/AddTaskDialog";
import { CourseSelector } from '@/components/CourseSelector';
import { TaskStatusChanger } from '@/components/TaskStatusChanger';
import { MoreActionsDropdown } from "@/components/shared/atoms/more-actions-dropdown";
import { DueDateDisplay } from "@/components/shared/atoms/due-date-display";
import { api } from "@/lib/api/util";
import { ErrorHandlers } from '@/lib/error/util';
import { getCurrentSession, getSessionWeeks, batchAcceptTasks } from '@/lib/task/util';
import { useCourses } from '@/hooks/use-courses';
import { useCourse } from '@/hooks/use-course';

interface CoursePageProps {
  params: Promise<{
    course: string;
  }>;
}

export default function CoursePage({ params }: CoursePageProps) {
  const router = useRouter();
  const unwrappedParams = use(params);
  const courseId = unwrappedParams.course;
  
  // Use custom hooks instead of duplicate state management
  const { courses, fetchCourses } = useCourses();
  const { course, tasks, isLoading, error, fetchCourse, setTasks } = useCourse(courseId);

  useEffect(() => {
    void fetchCourses();
    void fetchCourse();
  }, [fetchCourses, fetchCourse]);

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

  // Get only DRAFT tasks for the accept/delete all buttons
  const draftTasks = tasks.filter(task => task.status === TaskStatus.DRAFT);
  const hasDraftTasks = draftTasks.length > 0;

  // Handlers for accept all and delete all DRAFT tasks
  const handleAcceptAllDrafts = async () => {
    try {
      const currentSession = getCurrentSession() ?? 'winter'; // Default to winter if between sessions
      const sessionWeeks = getSessionWeeks(currentSession);

      // Use the new utility function to batch accept tasks
      await batchAcceptTasks(draftTasks, sessionWeeks);

      toast.success(`${draftTasks.length} tasks accepted`, {
        description: `All draft tasks for ${course?.code ?? 'this course'} have been accepted`,
      });
      await fetchCourse();
    } catch (error) {
      ErrorHandlers.api(error, 'Failed to accept draft tasks');
    }
  };

  const handleDeleteAllDrafts = async () => {
    try {
      const taskIds = draftTasks.map(task => task.id);

      // Use batch API to delete all tasks in a single request
      await api.post('/api/tasks/batch', {
        action: 'delete',
        taskIds
      });

      toast.success('Draft tasks deleted', {
        description: `All draft tasks for ${course?.code ?? 'this course'} have been deleted`,
      });
      await fetchCourse();
    } catch (error) {
      ErrorHandlers.api(error, 'Failed to delete draft tasks');
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

      {/* Accept/Delete All Buttons - Only show when there are draft tasks */}
      {hasDraftTasks && (
        <div className="flex gap-2 mb-6">
          <Button
            onClick={handleAcceptAllDrafts}
            variant="default"
            className="bg-green-600 hover:bg-green-700"
            disabled={isLoading}
          >
            {isLoading ? "Loading..." : `Accept all draft tasks (${draftTasks.length})`}
          </Button>
          <Button
            onClick={handleDeleteAllDrafts}
            variant="destructive"
            disabled={isLoading}
          >
            {isLoading ? "Loading..." : `Delete all draft tasks (${draftTasks.length})`}
          </Button>
        </div>
      )}

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