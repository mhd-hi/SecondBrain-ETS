import type { Task } from '@/types/task';

import { getCurrentTerm, getNextTerm, STANDARD_WEEKS_PER_TERM, TRIMESTER_DATES } from '@/lib/utils';
import { StatusTask } from '@/types/status-task';

export function calculateDueDateTask(week: number, totalCourseWeeks = 15): Date {
  // Reuse existing helpers to avoid duplicating term-detection logic.
  // If currently inside a trimester, use that; otherwise use the next trimester.
  const trimester = getCurrentTerm() ?? getNextTerm();

  const termDates = TRIMESTER_DATES[trimester];

  // Calculate the adjusted week based on the course's total weeks
  const adjustedWeek = (week / totalCourseWeeks) * STANDARD_WEEKS_PER_TERM;

  // Calculate the due date by adding the adjusted weeks to the term start date
  const dueDate = new Date(termDates.start);
  dueDate.setDate(dueDate.getDate() + Math.round(adjustedWeek * 7));
  // Check if the calculated date is valid
  if (Number.isNaN(dueDate.getTime())) {
    console.error('Invalid date calculated for term:', trimester, 'week:', week, 'totalCourseWeeks:', totalCourseWeeks);
    return termDates.end; // Return term end date as a fallback
  }

  // Ensure the due date doesn't exceed the term end date
  if (dueDate > termDates.end) {
    return termDates.end;
  }

  return dueDate;
}

/**
 * Sorts tasks by due date and filters out completed tasks
 */
export const getTasksByDueDate = (tasks: Task[]) => {
  return tasks
    .filter(task => task.status !== StatusTask.COMPLETED && task.dueDate != null)
    .sort((a, b) => {
      // Attempt to create Date objects and get time, handling invalid dates
      const dateA = a.dueDate instanceof Date ? a.dueDate : new Date(a.dueDate);
      const dateB = b.dueDate instanceof Date ? b.dueDate : new Date(b.dueDate);

      const timeA = Number.isNaN(dateA.getTime()) ? Number.MAX_SAFE_INTEGER : dateA.getTime();
      const timeB = Number.isNaN(dateB.getTime()) ? Number.MAX_SAFE_INTEGER : dateB.getTime();

      return timeA - timeB;
    });
};

/**
 * Gets the next task from a list of tasks
 */
export const getNextTask = (tasks: Task[]) => {
  const sortedTasks = getTasksByDueDate(tasks);
  return sortedTasks.length > 0 ? sortedTasks[0] : null;
};

/**
 * Gets the upcoming task (exam or homework) from a list of tasks
 */
export const getUpcomingTask = (tasks: Task[]) => {
  const sortedTasks = getTasksByDueDate(tasks);
  return sortedTasks.find(task => task.type === 'exam' || task.type === 'homework');
};

export const calculateProgress = (tasks: Task[]) => {
  const completedTasks = tasks.filter(task => task.status === StatusTask.COMPLETED).length;
  const totalTasks = tasks.length;
  return totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
};

export const getCompletedTasksCount = (tasks: Task[]): number => {
  return tasks.filter(task => task.status === StatusTask.COMPLETED).length;
};

export const getTotalTasksCount = (tasks: Task[]): number => {
  return tasks.length;
};

export const STATUS_ORDER = [
  StatusTask.TODO,
  StatusTask.IN_PROGRESS,
  StatusTask.COMPLETED,
] as const;

export const TASK_STATUS_CONFIG = {
  [StatusTask.TODO]: {
    label: 'TODO',
    bgColor: 'bg-blue-500',
    textColor: 'text-blue-100',
  },
  [StatusTask.IN_PROGRESS]: {
    label: 'DOING',
    bgColor: 'bg-amber-500',
    textColor: 'text-gray-800',
  },
  [StatusTask.COMPLETED]: {
    label: 'DONE',
    bgColor: 'bg-green-600',
    textColor: 'text-green-100',
  },
} as const;

export const getNextStatusTask = (currentStatus: StatusTask): StatusTask => {
  const currentIndex = STATUS_ORDER.indexOf(currentStatus as typeof STATUS_ORDER[number]);

  // If status is not found in STATUS_ORDER, default to TODO
  if (currentIndex === -1) {
    return StatusTask.TODO;
  }

  const nextIndex = (currentIndex + 1) % STATUS_ORDER.length;
  return STATUS_ORDER[nextIndex]!;
};

export const isValidStatusTask = (status: StatusTask): boolean => {
  return Object.values(StatusTask).includes(status);
};

export const getStatusBgClass = (status: StatusTask) => {
  const config = TASK_STATUS_CONFIG[status];
  return config?.bgColor ?? 'bg-muted';
};

export const getStatusTextClass = (status: StatusTask) => {
  const config = TASK_STATUS_CONFIG[status];
  return config?.textColor ?? 'text-blue-500';
};

// Normalize an incoming status value (possibly a string from the DB) to a valid StatusTask value.
export const parseStatusTask = (value: unknown): StatusTask => {
  if (typeof value === 'string' && Object.values(StatusTask).includes(value as StatusTask)) {
    return value as StatusTask;
  }
  return StatusTask.TODO;
};

export const getOverdueTasks = (tasks: Task[], excludeStatuses: StatusTask[] = [StatusTask.COMPLETED]): Task[] => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

  return tasks.filter((task) => {
    // Skip tasks that are in the excluded statuses
    if (excludeStatuses.includes(task.status)) {
      return false;
    }

    // Check if task is overdue
    const dueDate = task.dueDate instanceof Date ? task.dueDate : new Date(task.dueDate);

    // Return false if invalid date
    if (Number.isNaN(dueDate.getTime())) {
      return false;
    }

    // Task is overdue if due date is before today (end of day)
    return dueDate < today;
  });
};

/**
 * Formats effort hours to "1h 30min" format
 * @param hours - The number of hours (can be decimal)
 * @returns Formatted string like "1h 30min" or "30min" for less than 1 hour
 */
export function formatEffortTime(hours: number): string {
  if (hours === 0) {
    return '0min';
  }

  const wholeHours = Math.floor(hours);
  const minutes = Math.round((hours - wholeHours) * 60);

  // For very small values, show at least 1min
  if (wholeHours === 0 && minutes === 0 && hours > 0) {
    return '1min';
  }

  if (wholeHours === 0) {
    return `${minutes}min`;
  }

  if (minutes === 0) {
    return `${wholeHours}h`;
  }

  return `${wholeHours}h ${minutes}min`;
}
