'use client';

import type { Task } from '@/types/task';
import { Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { use, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { CourseSelector } from '@/components/shared/atoms/CourseSelector';
import { SearchBar } from '@/components/shared/atoms/SearchBar';
import { AddTaskDialog } from '@/components/shared/dialogs/AddTaskDialog';
import { TaskBanner } from '@/components/Task/TaskBanner';
import { TaskCard } from '@/components/Task/TaskCard';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useCourse } from '@/hooks/use-course';
import { useCourses } from '@/hooks/use-courses';
import { api } from '@/lib/api/util';
import { ErrorHandlers } from '@/lib/error/util';
import { batchAcceptTasks, batchUpdateTaskStatus, getCurrentSession, getOverdueTasks, getSessionWeeks } from '@/lib/task/util';
import { TaskStatus } from '@/types/task';

type CoursePageProps = {
  params: Promise<{
    course: string;
  }>;
};

export default function CoursePage({ params }: CoursePageProps) {
  const router = useRouter();
  const unwrappedParams = use(params);
  const courseId = unwrappedParams.course;

  // Search state
  const [searchQuery, setSearchQuery] = useState('');

  // Use custom hooks instead of duplicate state management
  const { courses, fetchCourses } = useCourses();
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

  const handleUpdateTask = async (taskId: string, updates: Partial<Task>) => {
    try {
      await api.patch(`/api/tasks/${taskId}`, updates);

      // Update local state instead of refetching
      setTasks(prevTasks =>
        prevTasks.map(task =>
          task.id === taskId
            ? { ...task, ...updates }
            : task,
        ),
      );
    } catch (error) {
      ErrorHandlers.api(error, 'Failed to update task');
    }
  };

  const handleUpdateSubtaskStatus = async (taskId: string, subtaskId: string, newStatus: TaskStatus) => {
    try {
      // Find the current task and its subtasks
      const currentTask = tasks.find(task => task.id === taskId);
      if (!currentTask?.subtasks) {
        return;
      }

      // Update the subtask status
      const updatedSubtasks = currentTask.subtasks.map(subtask =>
        subtask.id === subtaskId
          ? { ...subtask, status: newStatus }
          : subtask,
      );

      // Update the task with new subtasks
      await api.patch(`/api/tasks/${taskId}`, { subtasks: updatedSubtasks });

      // Update local state
      setTasks(prevTasks =>
        prevTasks.map(task =>
          task.id === taskId
            ? { ...task, subtasks: updatedSubtasks }
            : task,
        ),
      );
    } catch (error) {
      ErrorHandlers.api(error, 'Failed to update subtask status');
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

  const draftTasks = filteredTasks.filter(task => task.status === TaskStatus.DRAFT);

  const overdueTasks = getOverdueTasks(filteredTasks, [TaskStatus.IN_PROGRESS, TaskStatus.COMPLETED]);

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

      await api.post('/api/tasks/batch', {
        action: 'delete',
        taskIds,
      });

      toast.success('Draft tasks deleted', {
        description: `All draft tasks for ${course?.code ?? 'this course'} have been deleted`,
      });
      await fetchCourse();
    } catch (error) {
      ErrorHandlers.api(error, 'Failed to delete draft tasks');
    }
  };

  const handleCompleteOverdueTasks = async () => {
    try {
      const currentOverdueTasks = getOverdueTasks(tasks, [TaskStatus.IN_PROGRESS, TaskStatus.COMPLETED]);

      if (currentOverdueTasks.length === 0) {
        toast.success('No overdue tasks found');
        return;
      }

      const taskIds = currentOverdueTasks.map(task => task.id);

      await batchUpdateTaskStatus(taskIds, TaskStatus.COMPLETED);

      toast.success('Overdue tasks completed', {
        description: `${currentOverdueTasks.length} overdue tasks have been marked as completed`,
      });
      await fetchCourse();
    } catch (error) {
      ErrorHandlers.api(error, 'Failed to complete overdue tasks');
    }
  };

  // Group tasks by week
  const tasksByWeek = filteredTasks.reduce((acc, task) => {
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
      <main className="container mx-auto px-8 flex min-h-screen flex-col gap-6 mt-2 mb-3.5">
        <div className="space-y-4">
          <Skeleton className="h-8 w-1/4" />
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="container mx-auto px-8 flex min-h-screen flex-col mt-2 mb-3.5">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          {!isLoading && courses.length > 0 && (
            <CourseSelector
              courses={courses}
              selectedCourse={course}
              onCourseSelect={courseId => router.push(`/courses/${courseId}`)}
            />
          )}
        </div>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <SearchBar
          placeholder="Search tasks by title, notes, or subtasks..."
          value={searchQuery}
          onChange={setSearchQuery}
          className="flex-1"
        />
        {course && (
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
        )}
      </div>

      <TaskBanner
        tasks={draftTasks}
        variant="draft"
        isLoading={isLoading}
        actions={[
          {
            label: 'Accept All',
            onClick: handleAcceptAllDrafts,
            className: 'text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200 dark:text-green-400 dark:hover:text-green-300 dark:hover:bg-green-950 dark:border-green-800',
          },
          {
            label: 'Delete All',
            onClick: handleDeleteAllDrafts,
            className: 'text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-950 dark:border-red-800',
          },
        ]}
      />

      <TaskBanner
        tasks={overdueTasks}
        variant="overdue"
        isLoading={isLoading}
        actions={[
          {
            label: 'Complete All',
            onClick: handleCompleteOverdueTasks,
            className: 'text-yellow-600 hover:text-yellow-700 hover:bg-yellow-100 border-yellow-300 dark:text-yellow-400 dark:hover:text-yellow-300 dark:hover:bg-yellow-900 dark:border-yellow-700',
          },
        ]}
      />

      {isLoading
        ? (
          <div className="space-y-4">
            <div className="text-center text-muted-foreground mb-4">
              Loading tasks...
            </div>
            <div className="grid gap-4">
              {[1, 2, 3].map(i => (
                <Skeleton key={i} className="h-24" />
              ))}
            </div>
          </div>
        )
        : filteredTasks.length > 0
          ? (
            <div className="space-y-8 will-change-scroll">
              {Object.entries(tasksByWeek)
                .sort(([a], [b]) => Number(a) - Number(b))
                .map(([week, weekTasks]) => (
                  <div key={week} className="space-y-4">
                    <h3 className="text-lg font-semibold mb-3">
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
                            onUpdateTaskStatus={(taskId, newStatus) => handleUpdateTask(taskId, { status: newStatus })}
                            onUpdateSubtaskStatus={handleUpdateSubtaskStatus}
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
              <div className="text-center text-muted-foreground">
                No tasks found matching &quot;
                {searchQuery}
                &quot;. Try a different search term.
              </div>
            )
            : (
              <div className="text-center text-muted-foreground">
                No tasks found. Add a task to get started.
              </div>
            )}
    </main>
  );
}
