import type { Task } from '@/types/task';
import type { TrimesterKey } from '@/types/term';

import { getCurrentTerm, getNextTerm, STANDARD_WEEKS_PER_TERM, TERM_DATES } from '@/lib/term/util';
import { TaskStatus } from '@/types/task-status';
import { calculateWeeksBetweenDates } from '../date/util';

export function getNextTaskStatus(currentStatus: TaskStatus): TaskStatus {
  switch (currentStatus) {
    case TaskStatus.TODO:
      return TaskStatus.IN_PROGRESS;
    case TaskStatus.IN_PROGRESS:
      return TaskStatus.COMPLETED;
    default:
      return currentStatus;
  }
}

/**
 * Calculates the due date for a task based on the trimester, week number, and total course weeks
 * @param trimester The trimester (winter, summer, autumn)
 * @param week The week number of the task
 * @param totalCourseWeeks The total number of weeks in the course
 * @returns The calculated due date
 */
export function calculateDueDate(
  trimester: TrimesterKey,
  week: number,
  totalCourseWeeks: number,
): Date {
  const termDates = TERM_DATES[trimester];

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
 * Calculates the due date for a task based on course information
 * @param week The week number of the task
 * @param totalCourseWeeks The total number of weeks in the course
 * @returns The calculated due date
 */
export function calculateTaskDueDate(week: number, totalCourseWeeks = 15): Date {
  // Reuse existing helpers to avoid duplicating term-detection logic.
  // If currently inside a trimester, use that; otherwise use the next trimester.
  const trimester = getCurrentTerm() ?? getNextTerm();
  return calculateDueDate(trimester, week, totalCourseWeeks);
}

/**
 * Gets the number of weeks for a given trimester
 */
export function getTrimesterWeeks(trimester: TrimesterKey): number {
  const termDates = TERM_DATES[trimester];
  return calculateWeeksBetweenDates(termDates.start, termDates.end);
}

/**
 * Sorts tasks by due date and filters out completed tasks
 */
export const getSortedTasks = (tasks: Task[]) => {
  return tasks
    .filter(task => task.status !== TaskStatus.COMPLETED && task.dueDate != null)
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
  const sortedTasks = getSortedTasks(tasks);
  return sortedTasks.length > 0 ? sortedTasks[0] : null;
};

/**
 * Gets the upcoming task (exam or homework) from a list of tasks
 */
export const getUpcomingTask = (tasks: Task[]) => {
  const sortedTasks = getSortedTasks(tasks);
  return sortedTasks.find(task => task.type === 'exam' || task.type === 'homework');
};

export const calculateProgress = (tasks: Task[]) => {
  const completedTasks = tasks.filter(task => task.status === TaskStatus.COMPLETED).length;
  const totalTasks = tasks.length;
  return totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
};

export const getCompletedTasksCount = (tasks: Task[]): number => {
  return tasks.filter(task => task.status === TaskStatus.COMPLETED).length;
};

export const getTotalTasksCount = (tasks: Task[]): number => {
  return tasks.length;
};

export const STATUS_ORDER = [
  TaskStatus.TODO,
  TaskStatus.IN_PROGRESS,
  TaskStatus.COMPLETED,
] as const;

export const TASK_STATUS_CONFIG = {
  [TaskStatus.TODO]: {
    label: 'TODO',
    bgColor: 'bg-blue-500',
    textColor: 'text-blue-100',
  },
  [TaskStatus.IN_PROGRESS]: {
    label: 'DOING',
    bgColor: 'bg-amber-500',
    textColor: 'text-gray-800',
  },
  [TaskStatus.COMPLETED]: {
    label: 'DONE',
    bgColor: 'bg-green-600',
    textColor: 'text-green-100',
  },
} as const;

export function getDueDateColor(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  // Check if the date is valid
  if (!dateObj || Number.isNaN(dateObj.getTime())) {
    return 'text-muted-foreground';
  }

  const now = new Date();
  const diffMs = dateObj.getTime() - now.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);

  // Overdue
  if (diffMs < 0) {
    return 'text-yellow-600';
  }

  // Due today
  if (diffDays <= 1) {
    return 'text-red-300';
  }

  // Due within 3 days
  if (diffDays <= 3) {
    return 'text-orange-500';
  }

  // Due within 1 week
  if (diffDays <= 7) {
    return 'text-yellow-600';
  }

  // Default
  return 'text-muted-foreground';
}

export const getNextStatus = (currentStatus: TaskStatus): TaskStatus => {
  // Only handle TODO, IN_PROGRESS, COMPLETED

  const currentIndex = STATUS_ORDER.indexOf(currentStatus as typeof STATUS_ORDER[number]);

  // If status is not found in STATUS_ORDER, default to TODO
  if (currentIndex === -1) {
    return TaskStatus.TODO;
  }

  const nextIndex = (currentIndex + 1) % STATUS_ORDER.length;
  return STATUS_ORDER[nextIndex]!;
};

export const isValidStatus = (status: TaskStatus): boolean => {
  return Object.values(TaskStatus).includes(status);
};

/**
 * Normalize an incoming status value (possibly a string from the DB) to a valid TaskStatus.
 */
export const parseTaskStatus = (value: unknown): TaskStatus => {
  if (typeof value === 'string' && Object.values(TaskStatus).includes(value as TaskStatus)) {
    return value as TaskStatus;
  }
  return TaskStatus.TODO;
};

export const getOverdueTasks = (tasks: Task[], excludeStatuses: TaskStatus[] = [TaskStatus.COMPLETED]): Task[] => {
  // Get current date at start of day to ensure consistent overdue detection
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
