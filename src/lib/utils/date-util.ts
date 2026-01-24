import { calculateWeekFromDueDate, STANDARD_WEEKS_PER_TERM } from '@/lib/utils/term-util';

/**
 * Safely converts a date input to a Date object and validates it
 */
const safelyConvertToDate = (date: Date | string | null | undefined): Date | null => {
  if (!date) {
    return null;
  }
  const dateObj = date instanceof Date ? date : new Date(date);
  return Number.isNaN(dateObj.getTime()) ? null : dateObj;
};

// Formats a date for display in a short format (e.g., "Jan 15")
const formatDate = (date: Date | null | undefined): string => {
  const validDate = safelyConvertToDate(date);
  if (!validDate) {
    return '';
  }
  const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
  return validDate.toLocaleDateString(undefined, options);
};

// Formats a date for badge display with weekday, day, and month (e.g., "Wed 12 Sep")
export const formatBadgeDate = (date: Date | null | undefined): string => {
  const validDate = safelyConvertToDate(date);
  if (!validDate) {
    return '';
  }
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  }).format(validDate);
};

// Format week range for display
export const formatWeekRange = (dates: Date[]) => {
  if (dates.length === 0) {
    return '';
  }
  const start = dates[0]!;
  const end = dates[dates.length - 1]!;
  return `${formatDate(start)} - ${formatDate(end)}`;
};

export const formatDueDate = (date: Date | string) => {
  const validDate = safelyConvertToDate(date);
  if (!validDate) {
    return 'Invalid date';
  }

  const now = new Date();
  const diffInMs = validDate.getTime() - now.getTime();
  const diffInDays = Math.ceil(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInDays < 0) {
    const overdueDays = Math.abs(diffInDays);
    if (overdueDays === 1) {
      return 'Overdue by 1 day';
    } else if (overdueDays < 1) {
      return 'Overdue';
    } else {
      return `Overdue by ${overdueDays} days`;
    }
  } else if (diffInDays === 0) {
    return 'Due today';
  } else if (diffInDays === 1) {
    return 'Due tomorrow';
  } else {
    return `Due in ${diffInDays} days`;
  }
};

// Calculate a week number based on due date for grouping purposes
// Uses the term system to calculate the correct week within the academic term
export const getWeekNumberFromDueDate = (dueDate: Date, totalCourseWeeks = STANDARD_WEEKS_PER_TERM): number => {
  const validDate = safelyConvertToDate(dueDate);

  if (!validDate) {
    return 1; // Default to week 1 if invalid date
  }

  try {
    return calculateWeekFromDueDate(validDate, totalCourseWeeks);
  } catch (error) {
    console.error('Error calculating week from due date:', error);
    return 1; // Fallback to week 1 if calculation fails
  }
};
