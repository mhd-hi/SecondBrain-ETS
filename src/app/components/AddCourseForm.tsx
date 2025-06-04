'use client';

import { useState } from 'react';
import { useSecondBrainStore } from '@/store/useSecondBrainStore';
import { parseCourse } from '@/lib/api';
import { toast } from 'sonner';

export const AddCourseForm = () => {
  const [courseCode, setCourseCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const addCourse = useSecondBrainStore((state) => state.addCourse);
  const addDrafts = useSecondBrainStore((state) => state.addDrafts);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseCode.trim()) return;

    setIsLoading(true);
    try {
      const data = await parseCourse(courseCode);
      const courseId = `${data.courseCode}-${data.term}`;

      addCourse({
        id: courseId,
        code: data.courseCode,
        term: data.term,
      });

      addDrafts(
        courseId,
        data.drafts.map((draft) => ({
          ...draft,
          id: `${courseId}-${draft.week}-${draft.type}`,
          courseId,
        }))
      );

      setCourseCode('');
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      toast('Course imported successfully', {
        description: `Successfully imported ${data.courseCode} for term ${data.term}`,
      });
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error('Unknown error occurred');
      console.error('Error importing course:', error);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      toast('Failed to import course', {
        description: 'Please check the course code and try again',
        className: 'bg-destructive text-destructive-foreground',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-full max-w-md gap-2 rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900"
    >
      <input
        type="text"
        value={courseCode}
        onChange={(e) => setCourseCode(e.target.value.toUpperCase())}
        placeholder="Enter course code (e.g., MAT145)"
        className="flex-1 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500"
        aria-label="Course code"
      />
      <button
        type="submit"
        disabled={isLoading || !courseCode.trim()}
        className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-blue-500 dark:hover:bg-blue-600"
      >
        {isLoading ? 'Importing...' : 'Import Plan'}
      </button>
    </form>
  );
}; 