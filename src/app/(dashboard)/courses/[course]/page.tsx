'use client';
import type { Task } from '@/types/task';

import { Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { use, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { CourseProgressTile } from '@/components/Boards/Progress/TaskCompletionProgressTile';
import CourseCustomLinks from '@/components/CustomLinks/CourseCustomLinks';
import { BulkActionsDropdown } from '@/components/shared/atoms/bulk-actions-dropdown';

import { SearchBar } from '@/components/shared/atoms/SearchBar';
import { AddTaskDialog } from '@/components/shared/dialogs/AddTaskDialog';

import { CourseSkeleton } from '@/components/shared/skeletons/CourseSkeleton';
import { TaskCard } from '@/components/Task/TaskCard';

import { Button } from '@/components/ui/button';

import { Skeleton } from '@/components/ui/skeleton';
import { useCoursesContext } from '@/contexts/use-courses';
import { useCourse } from '@/hooks/use-course';
import { deleteAllCourseLinks } from '@/hooks/use-custom-link';
import { batchUpdateStatusTask, deleteTask, updateStatusTask } from '@/hooks/use-task';
import { api } from '@/lib/utils/api/api-client-util';
import { getWeekNumberFromDueDate } from '@/lib/utils/date-util';
import { handleConfirm } from '@/lib/utils/dialog-util';
import { ErrorHandlers } from '@/lib/utils/errors/error';
import { getOverdueTasks } from '@/lib/utils/task/task-util';
import { StatusTask } from '@/types/status-task';

type CoursePageProps = {
  params: Promise<{
    course: string;
  }>;
};

export default function CoursePage({ params }: CoursePageProps) {
  const router = useRouter();
  const unwrappedParams = use(params);
  const courseId = unwrappedParams.course;

  const [searchQuery, setSearchQuery] = useState('');

  // Use custom hooks instead of duplicate state management
  const { courses, fetchCourses, refreshCourses, deleteCourse } = useCoursesContext();
  const { course, tasks, isLoading, error, fetchCourse, setTasks } = useCourse(courseId);

  useEffect(() => {
    void fetchCourses();
    void fetchCourse();
  }, [fetchCourses, fetchCourse]);

  // Simple anchor scrolling
  useEffect(() => {
    if (!isLoading && window.location.hash) {
      const element = document.querySelector(window.location.hash);
      element?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [isLoading, tasks]);

  // Filter tasks based on search query
  const filteredTasks = useMemo(() => {
    if (!searchQuery.trim()) {
      return tasks;
    }

    const query = searchQuery.toLowerCase();
    return tasks.filter((task) => {
      // Search in task title
      if (task.title.toLowerCase().includes(query)) {
        return true;
      }

      // Search in task notes
      if (task.notes?.toLowerCase().includes(query)) {
        return true;
      }

      // Search in subtask titles
      if (task.subtasks?.some(subtask =>
        subtask.title.toLowerCase().includes(query)
        || subtask.notes?.toLowerCase().includes(query),
      )) {
        return true;
      }

      // Search in course code
      if (task.course?.code.toLowerCase().includes(query)) {
        return true;
      }

      return false;
    });
  }, [tasks, searchQuery]);

  const handleUpdateStatusTask = async (taskId: string, newStatus: StatusTask) => {
    // Optimistic update - update UI immediately
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === taskId ? { ...task, status: newStatus } : task,
      ),
    );

    try {
      await updateStatusTask(taskId, newStatus);

      // Ensure global course list (used by sidebar) reflects any overdue count changes
      void refreshCourses();
    } catch (error) {
      // Rollback optimistic update on error
      setTasks(prevTasks =>
        prevTasks.map(task =>
          task.id === taskId
            ? { ...task, status: tasks.find(t => t.id === taskId)?.status || StatusTask.TODO }
            : task,
        ),
      );
      ErrorHandlers.api(error, 'Failed to update task status');
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    await deleteTask(taskId, fetchCourse);
    void refreshCourses();
  };

  const handleDeleteCourse = async () => {
    if (!course) {
      return;
    }

    try {
      // Confirm deletion using the existing dialog util
      await handleConfirm(
        'Are you sure you want to delete this course? This action cannot be undone.',
        async () => {
          await api.delete(`/api/courses/${course.id}`, 'Failed to delete course');
          // Remove from local courses context
          deleteCourse(course.id);
          // Redirect to root
          router.push('/');
          // Show toast with course code
          toast.success(`Course ${course.code} deleted successfully`);
        },
        undefined,
        {
          title: 'Delete Course',
          confirmText: 'Delete',
          cancelText: 'Cancel',
          variant: 'destructive',
        },
      );
    } catch (error) {
      // Use centralized error handling
      ErrorHandlers.api(error, 'Failed to delete course', 'CoursePage');
    }
  };

  const handleDeleteAllLinks = async () => {
    if (!course) {
      return;
    }

    try {
      await handleConfirm(
        'Are you sure you want to delete all custom links for this course? This action cannot be undone.',
        async () => {
          const result = await deleteAllCourseLinks(course.id);
          toast.success(result.message);
          // Refresh course to update the custom links
          void fetchCourse();
        },
        undefined,
        {
          title: 'Delete All Links',
          confirmText: 'Delete All',
          cancelText: 'Cancel',
          variant: 'destructive',
        },
      );
    } catch (error) {
      ErrorHandlers.api(error, 'Failed to delete all custom links', 'CoursePage');
    }
  };

  const overdueTasks = getOverdueTasks(filteredTasks, [StatusTask.IN_PROGRESS, StatusTask.COMPLETED]);

  const handleCompleteOverdueTasks = async () => {
    try {
      const currentOverdueTasks = getOverdueTasks(tasks, [StatusTask.IN_PROGRESS, StatusTask.COMPLETED]);

      if (currentOverdueTasks.length === 0) {
        toast.success('No overdue tasks found');
        return;
      }

      const taskIds = currentOverdueTasks.map(task => task.id);

      await batchUpdateStatusTask(taskIds, StatusTask.COMPLETED);

      toast.success('Overdue tasks completed', {
        description: `${currentOverdueTasks.length} overdue tasks have been marked as completed`,
      });
      await fetchCourse();
      // Batch operation changed task statuses; update global courses used by sidebar
      await refreshCourses();
    } catch (error) {
      ErrorHandlers.api(error, 'Failed to complete overdue tasks');
    }
  };

  // Group tasks by week calculated from dueDate
  const tasksByWeek = filteredTasks.reduce((acc, task) => {
    const week = getWeekNumberFromDueDate(task.dueDate);
    acc[week] ??= [];
    acc[week]?.push(task);
    return acc;
  }, {} as Record<number, Task[]>);

  // Sort tasks within each week by dueDate
  Object.keys(tasksByWeek).forEach((week) => {
    tasksByWeek[Number(week)]?.sort((a, b) =>
      new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime(),
    );
  });

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive">Error</h1>
          <p className="mt-2 text-muted-foreground">{error}</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => router.push('/')}
          >
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <main className="container mx-auto px-8 flex min-h-screen flex-col mt-2 mb-3.5">
        <CourseSkeleton />
      </main>
    );
  }

  return (
    <main className="container mx-auto px-8 flex min-h-screen flex-col mt-6 mb-8">

      <div className="flex items-center justify-between mb-10">
        <div className="flex items-center gap-4">
          {isLoading
            ? (
              <Skeleton className="h-9 w-24" />
            )
            : course && (
              <h2 className="text-3xl font-bold">{course.code}</h2>
            )}
        </div>
        <div>
          <BulkActionsDropdown
            overdueCount={overdueTasks.length}
            onCompleteAll={handleCompleteOverdueTasks}
            onDeleteCourse={handleDeleteCourse}
            onDeleteAllLinks={handleDeleteAllLinks}
          />
        </div>
      </div>

      {isLoading
        ? (
          <CourseSkeleton />
        )
        : (
          <div className="space-y-8">

            <section>
              <CourseCustomLinks
                courseId={course.id}
                customLinks={course.customLinks}
                onCustomLinksChange={fetchCourse}
              />
            </section>

            <section>
              <CourseProgressTile tasks={tasks} />
            </section>

            <div className="flex items-center gap-4 mb-2">
              <SearchBar
                placeholder="Search tasks by title, notes, or subtasks..."
                value={searchQuery}
                onChange={setSearchQuery}
                className="flex-1"
              />
              <AddTaskDialog
                courseId={course.id}
                courseCode={course.code}
                onTaskAdded={fetchCourse}
                courses={courses}
                trigger={(
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Task
                  </Button>
                )}
              />
            </div>

            {/* Tasks content */}
            {filteredTasks.length > 0
              ? (
                <div className="space-y-8 will-change-scroll">
                  {Object.entries(tasksByWeek)
                    .sort(([a], [b]) => Number(a) - Number(b))
                    .map(([week, weekTasks]) => (
                      <div key={week} className="space-y-4">
                        <h3 className="font-semibold text-lg mb-3">
                          {'Week '}
                          {week}
                        </h3>
                        <div className="space-y-3">
                          {weekTasks.map(task => (
                            <div
                              id={`task-${task.id}`}
                              key={task.id}
                              className="transform-gpu transition-all duration-200 rounded-lg"
                            >
                              <TaskCard
                                task={task}
                                onDeleteTask={handleDeleteTask}
                                onUpdateStatusTask={handleUpdateStatusTask}
                                onTaskAdded={fetchCourse}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                </div>
              )
              : searchQuery.trim()
                ? (
                  <div className="text-center text-muted-foreground py-12">
                    No tasks found matching &quot;
                    {searchQuery}
                    &quot;. Try a different search term.
                  </div>
                )
                : (
                  <div className="text-center text-muted-foreground py-12">
                    No tasks found. Add a task to get started.
                  </div>
                )}
          </div>
        )}
    </main>
  );
}
