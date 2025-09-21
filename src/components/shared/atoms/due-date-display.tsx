'use client';

import { Calendar as CalendarIcon } from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { formatDueDate } from '@/lib/date/util';
import { cn } from '@/lib/utils';

type DueDateDisplayProps = {
  date: Date | string | null; // Accept Date, string, or null
  className?: string;
  // Optional callback when user selects a new date from the calendar
  onChange?: (date: Date | null) => void;
};

export const DueDateDisplay = ({ date, className, onChange }: DueDateDisplayProps) => {
  // Convert incoming value to Date or null
  const initialDate = useMemo(() => {
    if (date == null) {
      return null;
    }
    const d = date instanceof Date ? date : new Date(date);
    return Number.isNaN(d.getTime()) ? null : d;
  }, [date]);

  // Local state so the component can reflect selection immediately even if parent is uncontrolled
  const [localDate, setLocalDate] = useState<Date | null>(initialDate);

  // Popover open state for calendar
  const [open, setOpen] = useState(false);

  const displayedDate = localDate ?? initialDate;

  // Format text for display or show placeholder
  if (displayedDate == null) {
    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className={cn(
              'text-xs font-medium flex items-center gap-1 text-muted-foreground transition-colors duration-150 hover:text-foreground',
              className,
            )}
            title="Choose due date"
          >
            <CalendarIcon className="h-3 w-3 flex-shrink-0" />
            No due date
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={displayedDate ?? undefined}
            onSelect={(d) => {
              // Calendar onSelect can pass Date | undefined
              const selected = d ?? null;
              setLocalDate(selected);
              onChange?.(selected);
              setOpen(false);
            }}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    );
  }

  // More robust overdue detection - compare at day level
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfDisplayed = displayedDate
    ? new Date(displayedDate.getFullYear(), displayedDate.getMonth(), displayedDate.getDate())
    : null;

  const isOverdue = startOfDisplayed != null && startOfDisplayed < startOfToday;
  const dueDateText = formatDueDate(displayedDate);

  // formatted date for the badge (e.g. "Wed 12 Sep")
  const formattedBadgeDate = displayedDate
    ? new Intl.DateTimeFormat('en-US', { weekday: 'short', day: 'numeric', month: 'short' }).format(
        displayedDate,
      )
    : '';

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            'text-xs font-medium flex items-center gap-1 transition-colors duration-150',
            isOverdue ? 'text-amber-500 hover:text-yellow-500 transition-all duration-300 ease-in-out' : 'text-muted-foreground hover:text-foreground',
            className,
          )}
          title="Choose due date"
        >
          <CalendarIcon className="h-3 w-3 flex-shrink-0" />
          {formattedBadgeDate}
          {' - '}
          {dueDateText}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={displayedDate ?? undefined}
          onSelect={(d) => {
            const selected = d ?? null;
            setLocalDate(selected);
            onChange?.(selected);
            setOpen(false);
          }}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
};
