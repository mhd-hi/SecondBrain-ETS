"use client";

import type { Course } from '@/types/course';
import { getCourseColor } from '@/lib/utils';
import { MoreActionsDropdown } from "@/components/shared/atoms/more-actions-dropdown";
import { DueDateDisplay } from "@/components/shared/atoms/due-date-display";
import Link from 'next/link';
import {
  getNextTask,
  getUpcomingTask,
  calculateProgress,
  getCompletedTasksCount,
  getTotalTasksCount
} from '@/lib/task/util';
import { TruncatedTextWithTooltip } from "@/components/shared/atoms/text-with-tooltip";

interface CourseCardProps {
  course: Course;
  onDeleteCourse: (courseId: string) => void;
}

export default function CourseCard({ course, onDeleteCourse }: CourseCardProps) {
  // Ensure course.tasks is an array
  const tasks = course.tasks ?? [];
  const courseColor = getCourseColor(course.id);

  // Calculate progress and task counts
  const progressPercentage = calculateProgress(tasks);
  const completedTasks = getCompletedTasksCount(tasks);
  const totalTasks = getTotalTasksCount(tasks);

  // Get next and upcoming tasks
  const nextTask = getNextTask(tasks);
  const upcomingTask = getUpcomingTask(tasks);

  const handleDeleteClick = () => {
    onDeleteCourse(course.id);
  };

  const dropdownActions = [
    {
      label: "Delete",
      onClick: handleDeleteClick,
      destructive: true,
    },
  ];

  return (
    <div
      className="relative group flex flex-col rounded-lg border bg-card text-card-foreground shadow-sm p-6 gap-4"
      style={{ borderLeft: `4px solid ${courseColor}` }}
    >
      <MoreActionsDropdown 
        actions={dropdownActions}
        triggerClassName="absolute -top-[10px] -right-[10px] z-10 opacity-0 group-hover:opacity-100"
      />

      <div className="flex justify-between items-start">
        <h2 className="text-xl font-bold">{course.code}</h2>
      </div>

      <div>
        <p className="text-sm font-medium mb-2">Progress</p>
        <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
          <div
            className="h-2.5 rounded-full transition-all duration-300"
            style={{ width: `${progressPercentage}%`, backgroundColor: courseColor }}
          ></div>
        </div>
        <p className="text-right text-sm text-muted-foreground mt-1">
          {completedTasks} of {totalTasks} tasks
        </p>
      </div>

      <div className="space-y-2 text-sm mt-auto">
        {nextTask && (
          <div>
            <TruncatedTextWithTooltip 
              text={nextTask.title}
              className="text-sm text-muted-foreground line-clamp-2 leading-tight"
              maxLines={2}
            />
            {nextTask.dueDate && (
              <div className="ml-3">
                <DueDateDisplay date={nextTask.dueDate} className="text-xs" />
              </div>
            )}
          </div>
        )}

        {upcomingTask && upcomingTask !== nextTask && (
          <div>
            <TruncatedTextWithTooltip 
              text={upcomingTask.title}
              className="text-sm text-muted-foreground line-clamp-2 leading-tight"
              maxLines={2}
            />
            {upcomingTask.dueDate && (
              <div className="ml-3">
                <DueDateDisplay date={upcomingTask.dueDate} className="text-xs" />
              </div>
            )}
          </div>
        )}

        {/* Display message when no upcoming tasks are found */}
        {!nextTask && !upcomingTask && (
          <p className="text-gray-700 dark:text-gray-300">No upcoming tasks.</p>
        )}

        {/* Display specific message if next task exists but no upcoming exam/homework is found */}
        {nextTask && !upcomingTask && (
          <p className="text-gray-700 dark:text-gray-300 mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">No upcoming exams or homework.</p>
        )}

      </div>

      <div className="flex justify-end mt-4">
        <Link 
          href={`/courses/${course.id}`}
          className="text-sm text-muted-foreground hover:text-accent-foreground transition-colors"
          style={{ color: courseColor }}
        >
          View course
        </Link>
      </div>
    </div>
  );
}