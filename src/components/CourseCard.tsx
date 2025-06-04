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

interface CourseCardProps {
  course: Course;
  onDeleteCourse: (courseId: string) => void;
}

export default function CourseCard({ course, onDeleteCourse }: CourseCardProps) {
  // Ensure course.tasks is an array
  const tasks = course.tasks || [];
  const courseColor = getCourseColor(course.id);

  // Calculate progress
  const completedTasks = tasks.filter(task => task.status === TaskStatus.COMPLETED).length;
  const totalTasks = tasks.length;
  const progressPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  // Find next and upcoming tasks - Adjusted filtering and sorting
  const sortedTasks = tasks
    .filter(task => task.status !== TaskStatus.COMPLETED) // Filter out only completed tasks
    .sort((a, b) => (a.week || 0) - (b.week || 0));

  const nextTask = sortedTasks.length > 0 ? sortedTasks[0] : null;
  const upcomingTask = sortedTasks.length > 1 ? sortedTasks[1] : null;

  const handleDeleteClick = () => {
    onDeleteCourse(course.id);
  };

  return (
    <div
      className="relative group flex flex-col rounded-lg border bg-card text-card-foreground shadow-sm p-6 gap-4"
      style={{ borderLeft: `4px solid ${courseColor}` }}
    >
      <DropdownMenu>
        <DropdownMenuTrigger className="absolute -top-[10px] -right-[10px] z-10 rounded-full bg-background p-[6px] hover:bg-accent hover:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground transition-opacity opacity-0 group-hover:opacity-100">
          <MoreHorizontal className="h-5 w-5" aria-label="Course actions" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={handleDeleteClick} className="text-destructive focus:text-destructive">
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <div className="flex justify-between items-start">
        <h2 className="text-xl font-bold">{course.code}</h2>
        <p className="text-muted-foreground text-sm">{course.name}</p>
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
          <p className="text-gray-700 dark:text-gray-300">
            <span className="font-medium">Next: </span>{nextTask.title}
          </p>
        )}
        {upcomingTask && (
          <p className="text-gray-700 dark:text-gray-300">
            <span className="font-medium">Upcoming: </span>{upcomingTask.title}
          </p>
        )}
        {!nextTask && !upcomingTask && (
          <p className="text-gray-700 dark:text-gray-300">No upcoming tasks.</p>
        )}
      </div>
    </div>
  );
} 