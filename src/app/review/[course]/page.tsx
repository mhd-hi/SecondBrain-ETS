"use client";

import { useEffect, useState, useCallback } from 'react';
import { use } from 'react';
import CourseSidebar from '@/components/CourseSidebar';
import WeekAccordion from '@/components/WeekAccordion';
import { toast } from 'sonner';
import type { Course, Draft } from '@/types/course';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useRouter } from "next/navigation"

interface ReviewQueueProps {
  params: Promise<{
    course: string;
  }>;
}

interface CourseResponse extends Course {
  tasks: Draft[];
}

interface ApiResponse {
  drafts: Draft[]
}

export default function ReviewQueue({ params }: ReviewQueueProps) {
  const router = useRouter()
  const unwrappedParams = use(params);
  const courseId = unwrappedParams.course;
  const [course, setCourse] = useState<Course | null>(null);
  const [drafts, setDrafts] = useState<Draft[]>([]);
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
      setDrafts(data.tasks.filter((task) => task.isDraft));
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
      const response = await fetch(`/api/drafts?courseId=${unwrappedParams.course}`)
      if (!response.ok) {
        throw new Error("Failed to fetch drafts")
      }
      const data = (await response.json()) as ApiResponse
      setDrafts(data.drafts)
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

  // Group drafts by week
  const draftsByWeek = drafts.reduce((acc, draft) => {
    const week = draft.week;
    acc[week] ??= [];
    acc[week]?.push(draft);
    return acc;
  }, {} as Record<number, Draft[]>);

  const handleDraftUpdate = async () => {
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
      const promises = drafts.map(draft =>
        fetch(`/api/tasks/${draft.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ isDraft: false }),
        })
      );

      await Promise.all(promises);
      toast.success(`${drafts.length} tâches ajoutées`, {
        description: `Toutes les tâches de ${course?.code ?? 'ce cours'} ont été acceptées`,
      });
      await handleDraftUpdate();
    } catch (error) {
      console.error('Error accepting all drafts:', error);
      toast.error('Échec de l\'acceptation', {
        description: 'Une erreur est survenue lors de l\'acceptation des tâches',
      });
    }
  };

  const handleDiscardAllCourse = async () => {
    try {
      const promises = drafts.map(draft =>
        fetch(`/api/tasks/${draft.id}`, {
          method: 'DELETE',
        })
      );

      await Promise.all(promises);
      toast.success('Brouillons supprimés', {
        description: `Tous les brouillons de ${course?.code ?? 'ce cours'} ont été supprimés`,
      });
      await handleDraftUpdate();
    } catch (error) {
      console.error('Error discarding all drafts:', error);
      toast.error('Échec de la suppression', {
        description: 'Une erreur est survenue lors de la suppression des brouillons',
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
            >
              Accepter tous les brouillons
            </Button>
            <Button
              onClick={handleDiscardAllCourse}
              variant="destructive"
            >
              Supprimer tous les brouillons
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="mb-8">
            <div className="flex gap-4">
              <Input
                type="text"
                placeholder="Search drafts..."
                className="flex-1"
              />
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Loading..." : "Search"}
              </Button>
            </div>
          </form>

          <ScrollArea className="h-[calc(100vh-12rem)]">
            <div className="grid gap-4">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-24" />
                ))
              ) : drafts.length > 0 ? (
                drafts.map((draft) => (
                  <div
                    key={draft.id}
                    className="rounded-lg border bg-card p-4 shadow-sm"
                  >
                    <h3 className="font-semibold">{draft.title}</h3>
                    {draft.notes && (
                      <p className="mt-2 text-sm text-muted-foreground">
                        {draft.notes}
                      </p>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center text-muted-foreground">
                  No drafts found
                </div>
              )}
            </div>
          </ScrollArea>

          {Object.entries(draftsByWeek)
            .sort(([a], [b]) => Number(a) - Number(b))
            .map(([week, weekDrafts]) => (
              <WeekAccordion
                key={week}
                courseId={unwrappedParams.course}
                week={Number(week)}
                drafts={weekDrafts}
                onDraftUpdate={fetchCourse}
              />
            ))}
        </div>
      </main>
    </div>
  );
}
