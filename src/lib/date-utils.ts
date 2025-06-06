/**
 * Formats a date to display naturally relative to the current time
 * Examples: "Due tomorrow", "Due in 2 days", "Overdue by 3 days"
 */
export function formatRelativeDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  // Check if the date is valid
  if (!dateObj || isNaN(dateObj.getTime())) {
    return "Invalid date";
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
      return "Overdue";
    }
    
    // Less than 7 days overdue
    if (overdueDays < 7) {
      if (overdueDays === 1) return "Overdue by 1 day";
      return `Overdue by ${overdueDays} days`;
    }
    
    // Less than 30 days overdue (show in weeks)
    if (overdueDays < 30) {
      if (overdueWeeks === 1) return "Overdue by 1 week";
      return `Overdue by ${overdueWeeks} weeks`;
    }
    
    // 30+ days overdue (show in months)
    if (overdueMonths === 1) return "Overdue by 1 month";
    return `Overdue by ${overdueMonths} months`;
  }
  
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);
  
  // Less than 1 day (today)
  if (diffDays < 1) {
    return "Due today";
  }
  
  // Tomorrow (next day)
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  const dayAfterTomorrow = new Date(tomorrow);
  dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);
  
  if (dateObj >= tomorrow && dateObj < dayAfterTomorrow) {
    return "Due tomorrow";
  }
  
  // Less than 7 days
  if (diffDays < 7) {
    if (diffDays === 1) return "Due in 1 day";
    return `Due in ${diffDays} days`;
  }
  
  // Less than 30 days (show in weeks)
  if (diffDays < 30) {
    if (diffWeeks === 1) return "Due in 1 week";
    return `Due in ${diffWeeks} weeks`;
  }
  
  // 30+ days (show in months)
  if (diffMonths === 1) return "Due in 1 month";
  return `Due in ${diffMonths} months`;
}

/**
 * Formats a date for display in tooltips
 * Example: "Monday, January 15, 2024 at 11:59 PM"
 */
export function formatTooltipDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  // Check if the date is valid
  if (!dateObj || isNaN(dateObj.getTime())) {
    return "Invalid date";
  }

  return dateObj.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
}

/**
 * Gets the color class for due date based on urgency
 */
export function getDueDateColor(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  // Check if the date is valid
  if (!dateObj || isNaN(dateObj.getTime())) {
    return "text-muted-foreground";
  }

  const now = new Date();
  const diffMs = dateObj.getTime() - now.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  
  // Overdue
  if (diffMs < 0) return "text-red-500";
  
  // Due today
  if (diffDays <= 1) return "text-red-300";
  
  // Due within 3 days
  if (diffDays <= 3) return "text-orange-500";
  
  // Due within 1 week
  if (diffDays <= 7) return "text-yellow-600";
  
  // Default
  return "text-muted-foreground";
}