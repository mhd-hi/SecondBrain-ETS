export const formatDateToInput = (date: Date | string | null | undefined): string => {
  if (!date) {
    return '';
  }
  const dateObj = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(dateObj.getTime())) {
    console.error('formatDateToInput: Invalid Date object created from:', date);
    return '';
  }
  const year = dateObj.getFullYear();
  const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
  const day = dateObj.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Formats a date for display in a short format (e.g., "Jan 15")
 */
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

/**
 * Formats a date to display naturally relative to the current time
 * Examples: "Due tomorrow", "Due in 2 days", "Overdue by 3 days"
 */
export function formatRelativeDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  // Check if the date is valid
  if (!dateObj || Number.isNaN(dateObj.getTime())) {
    return 'Invalid date';
  }

  const now = new Date();
  const diffMs = dateObj.getTime() - now.getTime();

  // If the date is in the past, show how overdue it is
  if (diffMs < 0) {
    const overdueDiffMs = Math.abs(diffMs);
    const overdueDays = Math.floor(overdueDiffMs / (1000 * 60 * 60 * 24));
    const overdueWeeks = Math.floor(overdueDays / 7);
    const overdueMonths = Math.floor(overdueDays / 30);

    // Less than 1 day overdue
    if (overdueDays < 1) {
      return 'Overdue';
    }

    // Less than 7 days overdue
    if (overdueDays < 7) {
      if (overdueDays === 1) {
        return 'Overdue by 1 day';
      }
      return `Overdue by ${overdueDays} days`;
    }

    // Less than 30 days overdue (show in weeks)
    if (overdueDays < 30) {
      if (overdueWeeks === 1) {
        return 'Overdue by 1 week';
      }
      return `Overdue by ${overdueWeeks} weeks`;
    }

    // 30+ days overdue (show in months)
    if (overdueMonths === 1) {
      return 'Overdue by 1 month';
    }
    return `Overdue by ${overdueMonths} months`;
  }

  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);

  // Less than 1 day (today)
  if (diffDays < 1) {
    return 'Due today';
  }

  // Tomorrow (next day)
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  const dayAfterTomorrow = new Date(tomorrow);
  dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);

  if (dateObj >= tomorrow && dateObj < dayAfterTomorrow) {
    return 'Due tomorrow';
  }

  // Less than 7 days
  if (diffDays < 7) {
    if (diffDays === 1) {
      return 'Due in 1 day';
    }
    return `Due in ${diffDays} days`;
  }

  // Less than 30 days (show in weeks)
  if (diffDays < 30) {
    if (diffWeeks === 1) {
      return 'Due in 1 week';
    }
    return `Due in ${diffWeeks} weeks`;
  }

  // 30+ days (show in months)
  if (diffMonths === 1) {
    return 'Due in 1 month';
  }
  return `Due in ${diffMonths} months`;
}

/**
 * Formats a date for display in tooltips
 * Example: "Monday, January 15, 2024 at 11:59 PM"
 */
export function formatTooltipDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  // Check if the date is valid
  if (!dateObj || Number.isNaN(dateObj.getTime())) {
    return 'Invalid date';
  }

  return dateObj.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

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
