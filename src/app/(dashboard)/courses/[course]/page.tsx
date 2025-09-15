'use client';
import type { Task } from '@/types/task';
// (keep only the first occurrence of these imports)

import { Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { use, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { BulkActionsDropdown } from '@/components/shared/atoms/bulk-actions-dropdown';
import { SearchBar } from '@/components/shared/atoms/SearchBar';
import { AddTaskDialog } from '@/components/shared/dialogs/AddTaskDialog';
import { TaskCard } from '@/components/Task/TaskCard';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useCourse } from '@/hooks/use-course';
import { useCourses } from '@/hooks/use-courses';
import { api } from '@/lib/api/util';
import { ErrorHandlers } from '@/lib/error/util';
import { batchUpdateTaskStatus, getOverdueTasks } from '@/lib/task/util';
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

  const overdueTasks = getOverdueTasks(filteredTasks, [TaskStatus.IN_PROGRESS, TaskStatus.COMPLETED]);

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
          {!isLoading && course && (
            <h2 className="text-3xl font-bold">{course.code}</h2>
          )}
        </div>
        <div>
          <BulkActionsDropdown overdueCount={overdueTasks.length} onCompleteAll={handleCompleteOverdueTasks} />
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
