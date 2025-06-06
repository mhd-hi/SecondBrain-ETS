"use client";

import { formatDueDate } from "@/lib/date/util";
import { cn } from "@/lib/utils";

interface DueDateDisplayProps {
  date: Date | string; // Accept both Date and string
  className?: string;
}

export const DueDateDisplay = ({
  date,
  className,
}: DueDateDisplayProps) => {
  // Ensure we have a proper Date object
  const dateObj = date instanceof Date ? date : new Date(date);

  // Check if the conversion was successful
  if (isNaN(dateObj.getTime())) {
    return (
      <span className={cn("text-xs font-medium text-red-600", className)}>
        Invalid date
      </span>
    );
  }

  const dueDateText = formatDueDate(dateObj);
  const isOverdue = dateObj < new Date();

  return (
    <span
      className={cn(
        "text-xs font-medium",
        isOverdue ? "text-destructive" : "text-muted-foreground",
        className
      )}
    >
      {dueDateText}
    </span>
  );
};