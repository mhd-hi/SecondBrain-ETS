"use client";

import { cn } from "@/lib/utils";

interface DueDateDisplayProps {
  date: Date;
  className?: string;
}

export const DueDateDisplay = ({
  date,
  className,
}: DueDateDisplayProps) => {
  const formatDueDate = (date: Date) => {
    const now = new Date();
    const diffInMs = date.getTime() - now.getTime();
    const diffInDays = Math.ceil(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays < 0) {
      const overdueDays = Math.abs(diffInDays);
      if (overdueDays === 1) {
        return "Overdue by 1 day";
      } else if (overdueDays < 1) {
        return "Overdue";
      } else {
        return `Overdue by ${overdueDays} days`;
      }
    } else if (diffInDays === 0) {
      return "Due today";
    } else if (diffInDays === 1) {
      return "Due tomorrow";
    } else {
      return `Due in ${diffInDays} days`;
    }
  };

  const dueDateText = formatDueDate(date);
  const isOverdue = date < new Date();

  return (
    <span
      className={cn(
        "text-xs font-medium",
        isOverdue ? "text-red-600 dark:text-red-400" : "text-muted-foreground",
        className
      )}
    >
      {dueDateText}
    </span>
  );
};