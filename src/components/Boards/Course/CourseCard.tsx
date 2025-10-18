'use client';

import type { Course } from '@/types/course';
import { Palette } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { toast } from 'sonner';
import { DueDateDisplay } from '@/components/shared/atoms/due-date-display';
import { MoreActionsDropdown } from '@/components/shared/atoms/more-actions-dropdown';
import { TruncatedTextWithTooltip } from '@/components/shared/atoms/text-with-tooltip';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useCourse } from '@/hooks/use-course';
import {
  calculateProgress,
  getCompletedTasksCount,
  getNextTask,
  getTotalTasksCount,
  getUpcomingTask,
} from '@/lib/utils/task';
import { StatusTask } from '@/types/status-task';

type CourseCardProps = {
  course: Course;
  onDeleteCourse: (courseId: string) => void;
};

export default function CourseCard({ course, onDeleteCourse }: CourseCardProps) {
  const [showColorDialog, setShowColorDialog] = useState(false);
  const [selectedColor, setSelectedColor] = useState(course.color || '#3b82f6');
  const [pendingColor, setPendingColor] = useState(selectedColor);
  const { updateCourseColor } = useCourse(course.id);
  const tasks = course.tasks ?? [];
  const displayColor = selectedColor || course.color || '#3b82f6';

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

  const handleChangeColorClick = () => {
    setShowColorDialog(true);
    setPendingColor(selectedColor);
  };

  const handleColorInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPendingColor(e.target.value);
  };

  const handleConfirmColor = async () => {
    try {
      await updateCourseColor(pendingColor);
      setSelectedColor(pendingColor);
      setShowColorDialog(false);
      toast.success('Course color updated');
    } catch {
      toast.error('Failed to update course color');
    }
  };

  const handleCancelColor = () => {
    setShowColorDialog(false);
    setPendingColor(selectedColor);
  };

  const dropdownActions = [
    {
      label: 'Change color',
      onClick: handleChangeColorClick,
    },
    {
      label: 'Delete',
      onClick: handleDeleteClick,
      destructive: true,
    },
  ];

  const rawStyle: Record<string, string> = {
    'borderLeft': `4px solid ${selectedColor}`,
    // expose course color as a CSS variable so Tailwind classes can still work
    '--course-color': displayColor,
  };

  const cardStyle = rawStyle as React.CSSProperties;

  return (
    <div
      className="relative group flex flex-col rounded-lg border bg-card text-card-foreground shadow-sm p-4 gap-3 h-full min-h-[220px]"
      style={cardStyle}
    >
      <div className="absolute -top-[10px] -right-[10px] z-10">
        <MoreActionsDropdown
          actions={dropdownActions}
          triggerClassName="absolute -right-[1px] z-10 opacity-0 group-hover:opacity-100 transition-opacity"
        />
        <Dialog open={showColorDialog} onOpenChange={setShowColorDialog}>
          <DialogContent aria-describedby="color-course-description">
            <DialogDescription id="color-course-description">
              Pick a color for this course. This helps visually distinguish it in your dashboard.
            </DialogDescription>
            <DialogHeader>
              <DialogTitle>
                <span className="flex items-center gap-2">
                  <Palette className="w-5 h-5 text-muted-foreground" />
                  Change Course Color
                </span>
              </DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-4 mt-2">
              <span className="text-xs">

                {'Color: '}
                {pendingColor}
              </span>
              <input
                type="color"
                value={pendingColor}
                onChange={handleColorInput}
                className="w-8 h-8 border-none cursor-pointer"
                aria-label="Pick course color"
                style={{ background: 'none' }}
              />

              <div className="flex gap-2 justify-end mt-4">
                <Button size="sm" variant="outline" onClick={handleCancelColor}>Cancel</Button>
                <Button size="sm" onClick={handleConfirmColor}>Confirm</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex justify-between items-start">
        <h2 className="text-lg font-bold">
          <Link href={`/courses/${course.id}`} className="hover:underline transition-colors">
            {course.code}
          </Link>
        </h2>
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
            style={{ width: `${progressPercentage}%`, backgroundColor: displayColor }}
          />
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
            {nextTask.dueDate && nextTask.status !== StatusTask.COMPLETED && (
              <div className="flex items-center mb-2">
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
            <div className="flex items-center gap-1 mt-1 pt-1 border-t border-border">
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
            {upcomingTask.dueDate && upcomingTask.status !== StatusTask.COMPLETED && (
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
          style={{ color: displayColor }}
        >
          View course
        </Link>
      </div>
    </div>
  );
}
