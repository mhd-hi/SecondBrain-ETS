'use client';

import type { Course } from '@/types/course';
import Link from 'next/link';
import { DueDateDisplay } from '@/components/shared/atoms/due-date-display';
import { MoreActionsDropdown } from '@/components/shared/atoms/more-actions-dropdown';
import { TruncatedTextWithTooltip } from '@/components/shared/atoms/text-with-tooltip';
import {
  calculateProgress,
  getCompletedTasksCount,
  getNextTask,
  getTotalTasksCount,
  getUpcomingTask,
} from '@/lib/task/util';
import { getCourseColor } from '@/lib/utils';
import { TaskStatus } from '@/types/task';

type CourseCardProps = {
  course: Course;
  onDeleteCourse: (courseId: string) => void;
};

export default function CourseCard({ course, onDeleteCourse }: CourseCardProps) {
  // Ensure course.tasks is an array
  const tasks = course.tasks ?? [];
  const courseColor = getCourseColor(course);

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
      label: 'Delete',
      onClick: handleDeleteClick,
      destructive: true,
    },
  ];

  return (
    <div
      className="relative group flex flex-col rounded-lg border bg-card text-card-foreground shadow-sm p-4 gap-3 h-full min-h-[220px]"
      style={{ borderLeft: `4px solid ${courseColor}` }}
    >
      <MoreActionsDropdown
        actions={dropdownActions}
        triggerClassName="absolute -top-[10px] -right-[10px] z-10 opacity-0 group-hover:opacity-100"
      />

      <div className="flex justify-between items-start">
        <h2 className="text-lg font-bold">{course.code}</h2>
      </div>

      <div>
        <div className="flex justify-between items-center mb-1">
          <p className="text-xs font-medium">Progress</p>
          <p className="text-right text-xs text-muted-foreground">
            {completedTasks}
            {' of '}
            {totalTasks}
            {' '}
            tasks
          </p>
        </div>
        <div className="w-full bg-muted rounded-full h-2 mb-2">
          <div
            className="h-2 rounded-full transition-all duration-300"
            style={{ width: `${progressPercentage}%`, backgroundColor: courseColor }}
          >
          </div>
        </div>
      </div>

      <div className="space-y-1 text-xs flex-1">
        {nextTask && (
          <div>
            <div className="flex items-center gap-1">
              <span className="text-xs font-bold text-foreground">Next:</span>
              <Link
                href={`/courses/${course.id}#task-${nextTask.id}`}
                className="flex-1 hover:underline transition-colors"
              >
                <TruncatedTextWithTooltip
                  text={nextTask.title}
                  className="text-xs text-muted-foreground line-clamp-1 leading-tight hover:text-foreground"
                  maxLines={1}
                />
              </Link>
            </div>
            {nextTask.dueDate && nextTask.status !== TaskStatus.COMPLETED && (
              <div className="flex items-center">
                <DueDateDisplay
                  date={nextTask.dueDate}
                  className="text-xs"
                />
              </div>
            )}
          </div>
        )}

        {upcomingTask && upcomingTask !== nextTask && (
          <div>
            <div className="flex items-center gap-1">
              <span className="text-xs font-bold text-foreground">Upcoming:</span>
              <Link
                href={`/courses/${course.id}#task-${upcomingTask.id}`}
                className="flex-1 hover:underline transition-colors"
              >
                <TruncatedTextWithTooltip
                  text={upcomingTask.title}
                  className="text-xs text-muted-foreground line-clamp-1 leading-tight hover:text-foreground"
                  maxLines={1}
                />
              </Link>
            </div>
            {upcomingTask.dueDate && upcomingTask.status !== TaskStatus.COMPLETED && (
              <div className="flex items-center">
                <DueDateDisplay
                  date={upcomingTask.dueDate}
                  className="text-xs"
                />
              </div>
            )}
          </div>
        )}

        {/* Display message when no upcoming tasks are found */}
        {!nextTask && !upcomingTask && (
          <p className="text-xs text-muted-foreground">No upcoming tasks.</p>
        )}

        {/* Display specific message if next task exists but no upcoming exam/homework is found */}
        {nextTask && !upcomingTask && (
          <p className="text-xs text-muted-foreground mt-1 pt-1 border-t border-border">No upcoming exams or homework.</p>
        )}

      </div>

      <div className="flex justify-end mt-auto">
        <Link
          href={`/courses/${course.id}`}
          className="text-xs text-muted-foreground hover:text-accent-foreground transition-colors hover:underline"
          style={{ color: courseColor }}
        >
          View course
        </Link>
      </div>
    </div>
  );
}
