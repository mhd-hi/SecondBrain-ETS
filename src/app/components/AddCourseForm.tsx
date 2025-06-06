'use client';

import { useState } from 'react';
import { parseCourse } from '@/lib/api';
import { toast } from '@/components/ui/sonner';
import { useRouter } from 'next/navigation';
import type { Course } from '@/types/course';
import { calculateTaskDueDate } from '@/lib/task/util';

export const AddCourseForm = () => {
  const [courseCode, setCourseCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseCode.trim()) {
      toast.error('Course code required', {
        description: 'Please enter a valid course code.',
      });
      return;
    }

    setIsLoading(true);

    try {
      const data = await parseCourse(courseCode);
      
      // Create course
      const courseResponse = await fetch('/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: data.courseCode,
          name: data.courseCode,
        }),
      });

      const responseData = await courseResponse.json() as { id?: string; error?: string };

      if (!courseResponse.ok) {
        console.error('Course creation failed:', responseData);
        
        // Handle empty error response
        if (!responseData?.error) {
          throw new Error('Failed to create course: Unknown error');
        }

        if (responseData.error === 'Course already exists') {
          // Fetch the existing course
          const existingCourseResponse = await fetch(`/api/courses?code=${encodeURIComponent(data.courseCode)}`);
          if (!existingCourseResponse.ok) {
            throw new Error('Failed to fetch existing course');
          }
          const existingCourses = await existingCourseResponse.json() as Course[];
          const existingCourse = existingCourses[0];
          
          if (existingCourse) {
            toast.error('Cours déjà existant', {
              description: 'Ce cours existe déjà dans votre liste.',
              className: 'bg-destructive text-destructive-foreground',
            });
            // Navigate to the course review page
            router.push(`/review/${existingCourse.id}`);
            return;
          }
        }
        throw new Error(responseData.error);
      }

      if (!responseData.id) {
        throw new Error('Invalid course response: missing id');
      }

      const course = { id: responseData.id };

      // Create tasks
      const tasksResponse = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId: course.id,
          tasks: data.tasks.map(draft => ({
            ...draft,
            dueDate: calculateTaskDueDate(draft.week).toISOString()
          })),
        }),
      });

      if (!tasksResponse.ok) {
        const errorData = await tasksResponse.json() as { error?: string };
        console.error('Task creation failed:', errorData);
        throw new Error(errorData.error ?? 'Failed to create tasks');
      }

      setCourseCode('');
      toast.success('Course created successfully', {
        description: 'Redirecting to review page...',
      });
      
      // Redirect to review page
      router.push(`/review/${course.id}`);
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error('Une erreur inconnue est survenue');
      console.error('Error importing course:', error);
      toast.error('Échec de l\'importation', {
        description: error.message,
        className: 'bg-destructive text-destructive-foreground',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-full max-w-md gap-2 rounded-lg border border-border bg-card p-4 shadow-sm"
    >
      <input
        type="text"
        value={courseCode}
        onChange={(e) => setCourseCode(e.target.value.toUpperCase())}
        placeholder="Entrez le code du cours (ex: MAT145)"
        className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm placeholder-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
        aria-label="Code du cours"
      />
      <button
        type="submit"
        disabled={isLoading || !courseCode.trim()}
        className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isLoading ? 'Importation...' : 'Importer le plan'}
      </button>
    </form>
  );
};