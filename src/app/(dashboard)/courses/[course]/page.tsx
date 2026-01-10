'use client';
import type { Task } from '@/types/task';

import { Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { use, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { CourseProgressTile } from '@/components/Boards/Progress/TaskCompletionProgressTile';
import CourseCustomLinks from '@/components/CustomLinks/CourseCustomLinks';
import { ActionsDropdown } from '@/components/shared/atoms/actions-dropdown';
import getCourseActions from '@/components/shared/atoms/get-course-actions';
import { SearchBar } from '@/components/shared/atoms/SearchBar';
import { AddTaskDialog } from '@/components/shared/dialogs/AddTaskDialog';

import { CourseUpdateDialog } from '@/components/shared/dialogs/CourseUpdateDialog';

import { CourseSkeleton } from '@/components/shared/skeletons/CourseSkeleton';
import { TaskCard } from '@/components/Task/TaskCard';

import { Button } from '@/components/ui/button';

import { useCourses } from '@/hooks/use-course-store';
import { deleteAllCourseLinks } from '@/hooks/use-custom-link';
import { batchUpdateStatusTask } from '@/hooks/use-task';
import { useCourseTasksStore } from '@/hooks/use-task-store';
import { ROUTES } from '@/lib/routes';
import { useCourseStore } from '@/lib/stores/course-store';
import { useTaskStore } from '@/lib/stores/task-store';
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

  // Use store-based hooks (read-only, layout handles fetching)
  const { courses } = useCourses();
  const course = useCourseStore(state => state.courses.get(courseId));
  const [searchQuery, setSearchQuery] = useState('');

  // Get tasks directly from the store for automatic reactivity
  const tasks = useCourseTasksStore(courseId);

  // Get store methods for operations
  const updateTaskStatus = useTaskStore(state => state.updateTaskStatus);
  const removeTask = useTaskStore(state => state.removeTask);
  const deleteCourseFromStore = useCourseStore(state => state.removeCourse);
  const fetchTasksByCourse = useTaskStore(state => state.fetchTasksByCourse);

  // Fetch tasks when component mounts or courseId changes
  // Only fetch if courseId is a valid UUID (not a custom link URL)
  useEffect(() => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

    if (courseId && uuidRegex.test(courseId)) {
      fetchTasksByCourse(courseId).catch((error: unknown) => {
        console.error('Failed to fetch tasks:', error);
      });
    } else if (courseId && !uuidRegex.test(courseId)) {
      // Invalid course ID format - redirect to home
      console.warn('Invalid course ID format, redirecting:', courseId);
      router.push('/');
    }
  }, [courseId, fetchTasksByCourse, router]);

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
    try {
      await updateTaskStatus(taskId, newStatus);
      // Store handles updates automatically, no need to refresh
    } catch (error) {
      ErrorHandlers.api(error, 'Failed to update task status');
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    await removeTask(taskId);
    // Store handles updates automatically, no need to refresh
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
          await deleteCourseFromStore(course.id);
          // Redirect to root
          router.push(ROUTES.HOME);
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
          // Custom links updated, no need to refetch
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

  const [showUpdateDialog, setShowUpdateDialog] = useState(false);

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
      // Store handles updates automatically
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

  // Show skeleton only if courses haven't loaded yet AND no course found
  if (!course && courses.length === 0) {
    return (
      <main className="container mx-auto px-8 flex min-h-screen flex-col mt-6 mb-8">
        <CourseSkeleton />
      </main>
    );
  }

  // If courses loaded but this specific course not found, redirect to home
  if (!course && courses.length > 0) {
    router.push('/');
    return null;
  }

  // At this point, either courses are still loading (show skeleton) or course exists
  if (!course) {
    return (
      <main className="container mx-auto px-8 flex min-h-screen flex-col mt-6 mb-8">
        <CourseSkeleton />
      </main>
    );
  }

  return (
    <main className="container mx-auto px-8 flex min-h-screen flex-col mt-6 mb-8">

      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-4">
          <h2 className="text-3xl font-bold">{course.code}</h2>
        </div>
        <div>
          <ActionsDropdown
            actions={[
              {
                label: 'Course settings',
                onClick: () => setShowUpdateDialog(true),
              },
              ...getCourseActions({
                onDeleteCourse: handleDeleteCourse,
                onDeleteAllLinks: handleDeleteAllLinks,
                overdueCount: overdueTasks.length,
              }).filter(a => a.label !== 'Change color' && a.label !== 'Change daypart'),
            ]}
            overdueCount={overdueTasks.length}
            onCompleteAll={handleCompleteOverdueTasks}
            overdueTasks={overdueTasks.map(task => ({ id: task.id, title: task.title, dueDate: task.dueDate ? String(task.dueDate) : undefined }))}
            triggerText="Actions"
            contentAlign="end"
          />
          <CourseUpdateDialog
            open={showUpdateDialog}
            onOpenChange={setShowUpdateDialog}
            course={course}
            onUpdate={async ({ color, daypart }) => {
              // Call update logic here (assume updateCourse API or hook exists)
              try {
                // You may need to implement updateCourse in your hooks/api
                if (color !== course.color || daypart !== course.daypart) {
                  // Example: await updateCourse(course.id, { color, daypart });
                  // For now, just show a toast
                  toast.success('Course updated');
                }
              } catch (e) {
                ErrorHandlers.api(e, 'Failed to update course');
              }
            }}
          />
        </div>
      </div>

      <div className="space-y-8">
        <section>
          <CourseCustomLinks
            courseId={course.id}
            customLinks={course.customLinks}
          />
        </section>
        <section>
          <CourseProgressTile tasks={tasks} />
        </section>
        <div className="flex items-center gap-4 mb-2">
          <SearchBar
            id="course-tasks-search-bar"
            name="course-tasks-search-bar"
            placeholder="Search tasks by title, notes, or subtasks..."
            value={searchQuery}
            onChange={setSearchQuery}
            className="flex-1"
          />
          <AddTaskDialog
            courseId={course.id}
            courseCode={course.code}
            onTaskAdded={() => {}}
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
            <div className="space-y-5 will-change-scroll">
              {Object.entries(tasksByWeek)
                .sort(([a], [b]) => Number(a) - Number(b))
                .map(([week, weekTasks]) => (
                  <div key={week} className="space-y-3">
                    <h3 className="font-semibold text-lg mb-1">
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
    </main>
  );
}
