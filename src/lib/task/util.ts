import type { Task } from '@/types/task';
import { TaskStatus } from '@/types/task-status';

// Standard number of weeks per session
const STANDARD_WEEKS_PER_SESSION = 15;

// Session date ranges
const getSessionDates = () => {
  const currentYear = new Date().getFullYear();

  return {
    winter: {
      start: new Date(currentYear, 0, 5), // January 5
      end: new Date(currentYear, 3, 27), // April 27
      weeks: STANDARD_WEEKS_PER_SESSION, // ~15 weeks
    },
    summer: {
      start: new Date(currentYear, 4, 1), // May 1
      end: new Date(currentYear, 7, 16), // August 16
      weeks: STANDARD_WEEKS_PER_SESSION, // ~15 weeks
    },
    autumn: {
      start: new Date(currentYear, 8, 2), // September 2
      end: new Date(currentYear, 11, 18), // December 18
      weeks: STANDARD_WEEKS_PER_SESSION, // ~15 weeks
    },
  };
};

const SESSION_DATES = getSessionDates();

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
 * Calculates the due date for a task based on the session, week number, and total course weeks
 * @param session The session (winter, summer, autumn)
 * @param week The week number of the task
 * @param totalCourseWeeks The total number of weeks in the course
 * @returns The calculated due date
 */
export function calculateDueDate(
  session: keyof typeof SESSION_DATES,
  week: number,
  totalCourseWeeks: number,
): Date {
  const sessionDates = SESSION_DATES[session];

  // Calculate the adjusted week based on the course's total weeks
  const adjustedWeek = (week / totalCourseWeeks) * STANDARD_WEEKS_PER_SESSION;

  // Calculate the due date by adding the adjusted weeks to the session start date
  const dueDate = new Date(sessionDates.start);
  dueDate.setDate(dueDate.getDate() + Math.round(adjustedWeek * 7));
  // Check if the calculated date is valid
  if (Number.isNaN(dueDate.getTime())) {
    console.error('Invalid date calculated for session:', session, 'week:', week, 'totalCourseWeeks:', totalCourseWeeks);
    return sessionDates.end; // Return session end date as a fallback
  }

  // Ensure the due date doesn't exceed the session end date
  if (dueDate > sessionDates.end) {
    return sessionDates.end;
  }

  return dueDate;
}

/**
 * Gets the current session based on the current date
 * @returns The current session (winter, summer, autumn) or null if between sessions
 */
export function getCurrentSession(): keyof typeof SESSION_DATES | null {
  const now = new Date();

  for (const [session, dates] of Object.entries(SESSION_DATES)) {
    if (now >= dates.start && now <= dates.end) {
      return session as keyof typeof SESSION_DATES;
    }
  }

  return null;
}

/**
 * Gets the next session based on the current date
 * @returns The next session (winter, summer, autumn)
 */
export function getNextSession(): keyof typeof SESSION_DATES {
  const now = new Date();

  if (now < SESSION_DATES.winter.start) {
    return 'winter';
  } else if (now < SESSION_DATES.summer.start) {
    return 'summer';
  } else if (now < SESSION_DATES.autumn.start) {
    return 'autumn';
  } else {
    return 'winter';
  }
}

/**
 * Calculates the due date for a task based on course information
 * @param week The week number of the task
 * @param totalCourseWeeks The total number of weeks in the course
 * @returns The calculated due date
 */
export function calculateTaskDueDate(week: number, totalCourseWeeks = 15): Date {
  const now = new Date();

  // Determine which session we're in based on the current date
  let session: keyof typeof SESSION_DATES;

  if (now >= SESSION_DATES.winter.start && now <= SESSION_DATES.winter.end) {
    session = 'winter';
  } else if (now >= SESSION_DATES.summer.start && now <= SESSION_DATES.summer.end) {
    session = 'summer';
  } else if (now >= SESSION_DATES.autumn.start && now <= SESSION_DATES.autumn.end) {
    session = 'autumn';
  } else {
    // If we're between sessions, determine the next session
    if (now < SESSION_DATES.winter.start) {
      session = 'winter';
    } else if (now < SESSION_DATES.summer.start) {
      session = 'summer';
    } else if (now < SESSION_DATES.autumn.start) {
      session = 'autumn';
    } else {
      session = 'winter';
    }
  }

  return calculateDueDate(session, week, totalCourseWeeks);
}

/**
 * Calculates the actual number of weeks between two dates
 */
function calculateWeeksBetweenDates(start: Date, end: Date): number {
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.ceil(diffDays / 7);
}

/**
 * Gets the number of weeks for a given session
 */
export function getSessionWeeks(session: keyof typeof SESSION_DATES): number {
  const sessionDates = SESSION_DATES[session];
  return calculateWeeksBetweenDates(sessionDates.start, sessionDates.end);
}

/**
 * Calculates the week number from a due date based on academic sessions
 * This is the inverse of calculateTaskDueDate
 * @param dueDate The due date to calculate week from
 * @param totalCourseWeeks The total number of weeks in the course
 * @returns The calculated week number
 */
export function calculateWeekFromDueDate(dueDate: Date, totalCourseWeeks = 15): number {
  // Determine which session the due date falls into
  let session: keyof typeof SESSION_DATES;

  if (dueDate >= SESSION_DATES.winter.start && dueDate <= SESSION_DATES.winter.end) {
    session = 'winter';
  } else if (dueDate >= SESSION_DATES.summer.start && dueDate <= SESSION_DATES.summer.end) {
    session = 'summer';
  } else if (dueDate >= SESSION_DATES.autumn.start && dueDate <= SESSION_DATES.autumn.end) {
    session = 'autumn';
  } else {
    // If the date doesn't fall in any session, find the closest one
    const now = new Date();
    if (now < SESSION_DATES.winter.start) {
      session = 'winter';
    } else if (now < SESSION_DATES.summer.start) {
      session = 'summer';
    } else if (now < SESSION_DATES.autumn.start) {
      session = 'autumn';
    } else {
      session = 'winter';
    }
  }

  const sessionDates = SESSION_DATES[session];

  // Calculate the number of days from session start to due date
  const daysDiff = Math.max(0, Math.floor((dueDate.getTime() - sessionDates.start.getTime()) / (1000 * 60 * 60 * 24)));

  // Convert days to weeks within the session
  const weeksFromStart = daysDiff / 7;

  // Convert from session weeks back to course weeks
  const adjustedWeek = (weeksFromStart / STANDARD_WEEKS_PER_SESSION) * totalCourseWeeks;

  // Ensure we return at least week 1 and don't exceed total course weeks
  return Math.max(1, Math.min(Math.round(adjustedWeek), totalCourseWeeks));
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
    label: 'IN PROGRESS',
    bgColor: 'bg-amber-500',
    textColor: 'text-gray-900',
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
