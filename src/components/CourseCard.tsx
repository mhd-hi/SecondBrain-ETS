"use client";

import type { Course } from '@/types/course';
import { TaskStatus } from '@/types/task';
import { getCourseColor } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import Link from 'next/link';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useRef, useEffect, useState } from 'react';

// Helper function to format date for display
const formatDate = (date: Date | null | undefined): string => {
  if (!date) return '';
  // Explicitly convert to Date object if it's not already
  const dateObj = date instanceof Date ? date : new Date(date);
  if (isNaN(dateObj.getTime())) return ''; // Return empty string if date is invalid
  const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
  return dateObj.toLocaleDateString(undefined, options);
};

interface CourseCardProps {
  course: Course;
  onDeleteCourse: (courseId: string) => void;
}

export default function CourseCard({ course, onDeleteCourse }: CourseCardProps) {
  // Ensure course.tasks is an array
  const tasks = course.tasks ?? []; // Use nullish coalescing operator
  const courseColor = getCourseColor(course.id);

  // Calculate progress
  const completedTasks = tasks.filter(task => task.status === TaskStatus.COMPLETED).length;
  const totalTasks = tasks.length;
  const progressPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  // Find next and upcoming tasks - Filter and sort by dueDate, handling potential invalid dates
  const sortedTasks = tasks
    .filter(task => task.status !== TaskStatus.COMPLETED && task.dueDate != null)
    .sort((a, b) => {
      // Attempt to create Date objects and get time, handling invalid dates
      const dateA = a.dueDate instanceof Date ? a.dueDate : new Date(a.dueDate);
      const dateB = b.dueDate instanceof Date ? b.dueDate : new Date(b.dueDate);

      const timeA = isNaN(dateA.getTime()) ? Number.MAX_SAFE_INTEGER : dateA.getTime();
      const timeB = isNaN(dateB.getTime()) ? Number.MAX_SAFE_INTEGER : dateB.getTime();

      return timeA - timeB;
    });

  // The next task is the soonest non-completed task with a due date
  const nextTask = sortedTasks.length > 0 ? sortedTasks[0] : null;

  // The upcoming task is the soonest non-completed task of type exam or homework with a due date
  const upcomingTask = sortedTasks.find(task => task.type === 'exam' || task.type === 'homework');

  const nextTaskTitleRef = useRef<HTMLParagraphElement>(null);
  const [isNextTaskTitleTruncated, setIsNextTaskTitleTruncated] = useState(false);

  const upcomingTaskTitleRef = useRef<HTMLParagraphElement>(null);
  const [isUpcomingTaskTitleTruncated, setIsUpcomingTaskTitleTruncated] = useState(false);

  useEffect(() => {
    const element = nextTaskTitleRef.current;
    if (element) {
      setIsNextTaskTitleTruncated(element.scrollWidth > element.clientWidth);
    }
  }, [nextTask]);

  useEffect(() => {
    const element = upcomingTaskTitleRef.current;
    if (element) {
      setIsUpcomingTaskTitleTruncated(element.scrollWidth > element.clientWidth);
    }
  }, [upcomingTask]);

  const handleDeleteClick = () => {
    onDeleteCourse(course.id);
  };

  return (
    <div
      className="relative group flex flex-col rounded-lg border bg-card text-card-foreground shadow-sm p-6 gap-4"
      style={{ borderLeft: `4px solid ${courseColor}` }}
    >
      <DropdownMenu>
        <DropdownMenuTrigger className="absolute -top-[10px] -right-[10px] z-10 rounded-full bg-accent p-[6px] hover:bg-gray-300 hover:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground transition-opacity opacity-0 group-hover:opacity-100">
          <MoreHorizontal className="h-5 w-5 text-gray-600" aria-label="Course actions" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={handleDeleteClick} className="text-destructive focus:text-destructive">
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

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
            {isNextTaskTitleTruncated ? (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <p ref={nextTaskTitleRef} className="text-gray-700 dark:text-gray-300 truncate">
                      <span className="font-medium">Next: </span>{nextTask.title}
                    </p>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{nextTask.title}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ) : (
              <p ref={nextTaskTitleRef} className="text-gray-700 dark:text-gray-300 truncate">
                <span className="font-medium">Next: </span>{nextTask.title}
              </p>
            )}
            {nextTask.dueDate && (
              <p className="text-xs text-gray-500 dark:text-gray-400 ml-3">
                Due: {formatDate(nextTask.dueDate)}
              </p>
            )}
          </div>
        )}

        {upcomingTask && upcomingTask !== nextTask && (
             <div>
                {isUpcomingTaskTitleTruncated ? (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <p ref={upcomingTaskTitleRef} className="text-gray-700 dark:text-gray-300 truncate mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                           <span className="font-medium">Upcoming: </span>{upcomingTask.title}
                        </p>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{upcomingTask.title}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ) : (
                   <p ref={upcomingTaskTitleRef} className="text-gray-700 dark:text-gray-300 truncate mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                      <span className="font-medium">Upcoming: </span>{upcomingTask.title}
                   </p>
                )}
                 {upcomingTask.dueDate && (
                   <p className="text-xs text-gray-500 dark:text-gray-400 ml-3">
                     Due: {formatDate(upcomingTask.dueDate)}
                   </p>
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