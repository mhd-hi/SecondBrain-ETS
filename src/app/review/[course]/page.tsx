"use client";

import { useEffect } from 'react';
import { use } from 'react';
import { toast } from 'sonner';
import { TaskStatus, type Task } from '@/types/task';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"
import { CourseSelector } from '@/components/CourseSelector';
import { api } from '@/lib/api/util';
import { ErrorHandlers } from '@/lib/error/util';
import { getCurrentSession, getSessionWeeks, calculateTaskDueDate } from '@/lib/task/util';
import { useCourses } from '@/hooks/use-courses';
import { useCourse } from '@/hooks/use-course';

interface ReviewQueueProps {
  params: Promise<{
    course: string;
  }>;
}

export default function ReviewQueue({ params }: ReviewQueueProps) {
  const router = useRouter()
  const unwrappedParams = use(params);
  const courseId = unwrappedParams.course;
  
  // Use custom hooks instead of duplicate state management
  const { courses, fetchCourses } = useCourses();
  const { course, isLoading, error, fetchCourse, getFilteredTasks } = useCourse(courseId);
  
  // Get only DRAFT tasks for review
  const tasks = getFilteredTasks(TaskStatus.DRAFT);

  useEffect(() => {
    void fetchCourses();
    void fetchCourse();
  }, [fetchCourses, fetchCourse]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // Search functionality can be implemented here if needed
  }

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
    )
  }

  // Group tasks by week
  const tasksByWeek = tasks.reduce((acc, task) => {
    const week = task.week;
    acc[week] ??= [];
    acc[week]?.push(task);
    return acc;
  }, {} as Record<number, Task[]>);

  const handleTaskUpdate = async () => {
    try {
      await fetchCourse();
    } catch (error) {
      ErrorHandlers.api(error, 'Failed to refresh course data');
    }
  };

  // Handlers for global accept/discard
  const handleAcceptAllCourse = async () => {
    try {
      const currentSession = getCurrentSession() ?? 'winter'; // Default to winter if between sessions
      const sessionWeeks = getSessionWeeks(currentSession);

      const promises = tasks.map(task => {
        return api.patch(`/api/tasks/${task.id}`, { 
          status: TaskStatus.TODO,
          dueDate: calculateTaskDueDate(task.week, sessionWeeks).toISOString()
        });
      });

      await Promise.all(promises);
      toast.success(`${tasks.length} tâches ajoutées`, {
        description: `Toutes les tâches de ${course?.code ?? 'ce cours'} ont été acceptées`,
      });
      router.push('/');
    } catch (error) {
      ErrorHandlers.api(error, 'Échec de l\'acceptation des tâches');
    }
  };

  const handleDiscardAllCourse = async () => {
    try {
      const promises = tasks.map(task => api.delete(`/api/tasks/${task.id}`));

      await Promise.all(promises);
      toast.success('Brouillons supprimés', {
        description: `Tous les brouillons de ${course?.code ?? 'ce cours'} ont été supprimés`,
      });
      await handleTaskUpdate();
    } catch (error) {
      ErrorHandlers.api(error, 'Échec de la suppression des brouillons');
    }
  };

  const handleAccept = async (id: string) => {
    try {
      const task = tasks.find(t => t.id === id);
      if (!task) {
        throw new Error('Task not found');
      }

      const currentSession = getCurrentSession() ?? 'winter'; // Default to winter if between sessions
      const sessionWeeks = getSessionWeeks(currentSession);

      await api.patch(`/api/tasks/${id}`, { 
        status: TaskStatus.TODO,
        dueDate: calculateTaskDueDate(task.week, sessionWeeks).toISOString()
      });

      toast.success('Task accepted', {
        description: 'The task has been accepted successfully',
      });
      await fetchCourse();
    } catch (error) {
      ErrorHandlers.api(error, 'Failed to accept task');
    }
  };

  const handleDiscard = async (id: string) => {
    try {
      await api.delete(`/api/tasks/${id}`);

      toast.success('Task discarded', {
        description: 'The task has been discarded successfully',
      });
      await fetchCourse();
    } catch (error) {
      ErrorHandlers.api(error, 'Failed to discard task');
    }
  };

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
              onCourseSelect={(courseId) => router.push(`/review/${courseId}`)}
            />
          )}
        </div>
      </div>
      
      {/* Global Buttons */}
      <div className="flex gap-2 mb-6">
        <Button
          onClick={handleAcceptAllCourse}
          variant="default"
          className="bg-green-600 hover:bg-green-700"
          disabled={isLoading}
        >
          {isLoading ? "Loading..." : "Accept all tasks"}
        </Button>
        <Button
          onClick={handleDiscardAllCourse}
          variant="destructive"
          disabled={isLoading}
        >
          {isLoading ? "Loading..." : "Delete all tasks"}
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="mb-8">
        <div className="flex gap-4">
          <Input
            type="text"
            placeholder="Search tasks..."
            className="flex-1"
            disabled={isLoading}
          />
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Loading..." : "Search"}
          </Button>
        </div>
      </form>

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
              <section key={week} className="space-y-4">
                <h2 className="text-2xl font-semibold">Week {week}</h2>
                <div className="grid gap-4">
                  {weekTasks.map((task) => (
                    <div
                      key={task.id}
                      className="text-card-foreground rounded-lg border bg-card p-4 shadow-sm"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold">{task.title}</h3>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleAccept(task.id)}
                            className="text-green-600 hover:text-green-700"
                          >
                            Accept
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDiscard(task.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            Discard
                          </Button>
                        </div>
                      </div>
                      {task.notes && (
                        <p className="text-sm text-muted-foreground mb-4">
                          {task.notes}
                        </p>
                      )}
                      {task.subtasks && task.subtasks.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="text-sm font-medium">Subtasks:</h4>
                          <div className="space-y-2">
                            {task.subtasks.map((subtask, index) => (
                              <div
                                key={index}
                                className="text-sm bg-muted/50 p-2 rounded"
                              >
                                <div className="font-medium">{subtask.title}</div>
                                {subtask.notes && (
                                  <p className="text-muted-foreground">
                                    {subtask.notes}
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            ))}
        </div>
      ) : (
        <div className="text-center text-muted-foreground">
          No tasks found
        </div>
      )}
    </div>
  );
}
