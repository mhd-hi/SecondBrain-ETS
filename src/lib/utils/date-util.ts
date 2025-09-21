// Formats a date for display in a short format (e.g., "Jan 15")
export const formatDate = (date: Date | null | undefined): string => {
  if (!date) {
    return '';
  }
  // Explicitly convert to Date object if it's not already
  const dateObj = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(dateObj.getTime())) {
    return '';
  } // Return empty string if date is invalid
  const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
  return dateObj.toLocaleDateString(undefined, options);
};

// Get the start of the current week (Monday)
export const getWeekStart = (weekOffset: number) => {
  const now = new Date();
  const start = new Date(now);
  // Get Monday as the start of the week
  // getDay() returns 0 for Sunday, 1 for Monday, etc.
  // We want Monday (1) to be our week start
  const dayOfWeek = now.getDay();
  const daysToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // If Sunday, go back 6 days, otherwise go to Monday
  start.setDate(now.getDate() + daysToMonday + weekOffset * 7);
  start.setHours(0, 0, 0, 0);
  return start;
};

// Generate array of dates for the week
export const getWeekDates = (weekOffset: number) => {
  const start = getWeekStart(weekOffset);
  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date(start);
    date.setDate(start.getDate() + i);
    return date;
  });
};

// Format week range for display
export const formatWeekRange = (dates: Date[]) => {
  if (dates.length === 0) {
    return '';
  }
  const start = dates[0]!;
  const end = dates[dates.length - 1]!;
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };
  return `${formatDate(start)} - ${formatDate(end)}`;
};

export const formatDueDate = (date: Date | string) => {
  // Ensure we have a proper Date object
  const dateObj = date instanceof Date ? date : new Date(date);

  if (Number.isNaN(dateObj.getTime())) {
    console.error('formatDueDate: Invalid Date object created from:', date);
    return 'Invalid date';
  }

  const now = new Date();
  const diffInMs = dateObj.getTime() - now.getTime();
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

/**
 * Calculates the actual number of weeks between two dates
 */
export function calculateWeeksBetweenDates(start: Date, end: Date): number {
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.ceil(diffDays / 7);
}
