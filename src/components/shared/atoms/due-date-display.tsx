'use client';

import { Calendar } from 'lucide-react';
import { formatDueDate } from '@/lib/date/util';
import { cn } from '@/lib/utils';

type DueDateDisplayProps = {
  date: Date | string; // Accept both Date and string
  className?: string;
};

export const DueDateDisplay = ({
  date,
  className,
}: DueDateDisplayProps) => {
  // Ensure we have a proper Date object
  const dateObj = date instanceof Date ? date : new Date(date);

  // Check if the conversion was successful
  if (Number.isNaN(dateObj.getTime())) {
    return (
      <span className={cn('text-xs font-medium text-red-600', className)}>
        Invalid date
      </span>
    );
  }

  const dueDateText = formatDueDate(dateObj);

  // More robust overdue detection - compare at day level
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
  const isOverdue = dateObj < today;
  return (
    <span
      className={cn(
        'text-xs font-medium flex items-center gap-1',
        isOverdue ? 'text-yellow-600' : 'text-muted-foreground',
        className,
      )}
    >
      <Calendar className="h-3 w-3" />
      {dueDateText}
    </span>
  );
};
