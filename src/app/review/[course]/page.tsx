"use client";

import { useEffect, useState, useCallback } from 'react';
import { use } from 'react';
import CourseSidebar from '@/components/CourseSidebar';
import { toast } from 'sonner';
import type { Course, Task } from '@/types/course';
import { TaskStatus } from '@/types/course';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"

interface ReviewQueueProps {
  params: Promise<{
    course: string;
  }>;
}

interface CourseResponse extends Course {
  tasks: Task[];
}

interface ApiResponse {
  tasks: Task[]
}

export default function ReviewQueue({ params }: ReviewQueueProps) {
  const router = useRouter()
  const unwrappedParams = use(params);
  const courseId = unwrappedParams.course;
  const [course, setCourse] = useState<Course | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCourse = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/courses/${unwrappedParams.course}`);
      if (!response.ok) {
        throw new Error('Failed to fetch course');
      }
      const data = await response.json() as CourseResponse;
      setCourse(data);
      setTasks(data.tasks.filter((task) => task.status === TaskStatus.DRAFT));
    } catch (err) {
      console.error('Error fetching course:', err);
      setError('Failed to load course data');
      toast.error('Error loading course', {
        description: 'Please try refreshing the page',
      });
    } finally {
      setIsLoading(false);
    }
  }, [unwrappedParams.course]);

  useEffect(() => {
    void fetchCourse();
  }, [unwrappedParams.course, fetchCourse]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/tasks?courseId=${unwrappedParams.course}`)
      if (!response.ok) {
        throw new Error("Failed to fetch tasks")
      }
      const data = (await response.json()) as ApiResponse
      setTasks(data.tasks.filter(task => task.status === TaskStatus.DRAFT))
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
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
      const response = await fetch(`/api/courses/${courseId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch course');
      }
      const data = await response.json() as Course;
      setCourse(data);
    } catch (err) {
      console.error('Error refreshing course:', err);
      toast.error('Échec du rafraîchissement', {
        description: 'Une erreur est survenue lors du rafraîchissement des données',
      });
    }
  };

  // Handlers for global accept/discard
  const handleAcceptAllCourse = async () => {
    try {
      const promises = tasks.map(task =>
        fetch(`/api/tasks/${task.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: TaskStatus.PENDING }),
        })
      );

      await Promise.all(promises);
      toast.success(`${tasks.length} tâches ajoutées`, {
        description: `Toutes les tâches de ${course?.code ?? 'ce cours'} ont été acceptées`,
      });
      router.push('/');
    } catch (error) {
      console.error('Error accepting all tasks:', error);
      toast.error('Échec de l\'acceptation', {
        description: 'Une erreur est survenue lors de l\'acceptation des tâches',
      });
    }
  };

  const handleDiscardAllCourse = async () => {
    try {
      const promises = tasks.map(task =>
        fetch(`/api/tasks/${task.id}`, {
          method: 'DELETE',
        })
      );

      await Promise.all(promises);
      toast.success('Brouillons supprimés', {
        description: `Tous les brouillons de ${course?.code ?? 'ce cours'} ont été supprimés`,
      });
      await handleTaskUpdate();
    } catch (error) {
      console.error('Error discarding all tasks:', error);
      toast.error('Échec de la suppression', {
        description: 'Une erreur est survenue lors de la suppression des brouillons',
      });
    }
  };

  const handleAccept = async (id: string) => {
    try {
      const response = await fetch(`/api/tasks/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: TaskStatus.PENDING }),
      });

      if (!response.ok) {
        throw new Error('Failed to accept task');
      }

      toast.success('Task accepted', {
        description: 'The task has been accepted successfully',
      });
      await fetchCourse();
    } catch (error) {
      console.error('Error accepting task:', error);
      toast.error('Failed to accept task', {
        description: 'An error occurred while accepting the task',
      });
    }
  };

  const handleDiscard = async (id: string) => {
    try {
      const response = await fetch(`/api/tasks/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to discard task');
      }

      toast.success('Task discarded', {
        description: 'The task has been discarded successfully',
      });
      await fetchCourse();
    } catch (error) {
      console.error('Error discarding task:', error);
      toast.error('Failed to discard task', {
        description: 'An error occurred while discarding the task',
      });
    }
  };

  if (!course) {
    return (
      <div className="flex h-screen">
        <CourseSidebar selectedCourseId={unwrappedParams.course} />
        <main className="flex-1 p-8">
          <div className="space-y-4">
            <Skeleton className="h-8 w-1/4" />
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-32 w-full" />
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      <CourseSidebar selectedCourseId={unwrappedParams.course} />
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">{course.name}</h1>
          
          {/* Global Buttons */}
          <div className="flex gap-2 mb-6">
            <Button
              onClick={handleAcceptAllCourse}
              variant="default"
              className="bg-green-600 hover:bg-green-700"
              disabled={isLoading}
            >
              {isLoading ? "Loading..." : "Accepter tous les brouillons"}
            </Button>
            <Button
              onClick={handleDiscardAllCourse}
              variant="destructive"
              disabled={isLoading}
            >
              {isLoading ? "Loading..." : "Supprimer tous les brouillons"}
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
                            <div className="space-y-2 mt-4 pt-4 border-t">
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
      </main>
    </div>
  );
}
