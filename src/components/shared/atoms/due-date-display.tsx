'use client';

import { Calendar } from 'lucide-react';
import React, { useCallback, useMemo, useRef, useState } from 'react';
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

  // Keep input ref to open the native picker programmatically
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Prefer showPicker when available (Chromium)
  const openPicker = useCallback(() => {
    if (!inputRef.current) {
      return;
    }
    try {
      inputRef.current.showPicker?.() ?? inputRef.current.click();
    } catch {
      // Fallback to click
      inputRef.current.click();
    }
  }, []);

  const displayedDate = localDate ?? initialDate;

  // Format text for display or show placeholder
  if (displayedDate == null) {
    return (
      <span
        className={cn('text-xs font-medium flex items-center gap-1 text-muted-foreground', className)}
        role="button"
        tabIndex={0}
        onClick={() => {
          inputRef.current?.showPicker?.() ?? inputRef.current?.click();
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            inputRef.current?.showPicker?.() ?? inputRef.current?.click();
          }
        }}
        title="Choose due date"
      >
        <Calendar className="h-3 w-3 flex-shrink-0" />
        No due date
        {/* hidden native date input used to show the calendar */}
        <input
          ref={inputRef}
          type="date"
          aria-label="Pick due date"
          className="sr-only"
          onChange={(e) => {
            const val = e.target.value; // YYYY-MM-DD
            if (!val) {
              setLocalDate(null);
              onChange?.(null);
              return;
            }
            const parts = val.split('-');
            const y = Number(parts[0]);
            const m = Number(parts[1]);
            const d = Number(parts[2]);
            const selected = new Date(y, m - 1, d);
            setLocalDate(selected);
            onChange?.(selected);
          }}
        />
      </span>
    );
  }

  // More robust overdue detection - compare at day level
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
  const isOverdue = displayedDate < today;

  const dueDateText = formatDueDate(displayedDate);

  return (
    <span
      className={cn(
        'text-xs font-medium flex items-center gap-1',
        isOverdue ? 'text-yellow-600' : 'text-muted-foreground',
        className,
      )}
      role="button"
      tabIndex={0}
      onClick={openPicker}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openPicker();
        }
      }}
      title="Choose due date"
    >
      <Calendar className="h-3 w-3 flex-shrink-0" />
      {dueDateText}
      {/* native date input; value kept in sync with localDate so picker shows current value */}
      <input
        ref={inputRef}
        type="date"
        aria-label="Pick due date"
        className="sr-only"
        value={(() => {
          if (!displayedDate) {
            return '';
          }
          const y = displayedDate.getFullYear();
          const m = String(displayedDate.getMonth() + 1).padStart(2, '0');
          const d = String(displayedDate.getDate()).padStart(2, '0');
          return `${y}-${m}-${d}`;
        })()}
        onChange={(e) => {
          const val = e.target.value;
          if (!val) {
            setLocalDate(null);
            onChange?.(null);
            return;
          }
          const parts = val.split('-');
          const y = Number(parts[0]);
          const m = Number(parts[1]);
          const d = Number(parts[2]);
          const selected = new Date(y, m - 1, d);
          setLocalDate(selected);
          onChange?.(selected);
        }}
      />
    </span>
  );
};
