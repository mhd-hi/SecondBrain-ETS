import { TaskStatus } from "@/types/task";
import type { Task } from "@/types/task";

// Session date ranges
const getSessionDates = () => {
  const currentYear = new Date().getFullYear();
  
  return {
    winter: {
      start: new Date(currentYear, 0, 5), // January 5
      end: new Date(currentYear, 3, 27), // April 27
      weeks: 15, // ~15 weeks
    },
    summer: {
      start: new Date(currentYear, 4, 1), // May 1
      end: new Date(currentYear, 7, 16), // August 16
      weeks: 15, // ~15 weeks
    },
    autumn: {
      start: new Date(currentYear, 8, 2), // September 2
      end: new Date(currentYear, 11, 18), // December 18
      weeks: 15, // ~15 weeks
    },
  };
};

const SESSION_DATES = getSessionDates();

// Standard number of weeks per session
const STANDARD_WEEKS_PER_SESSION = 15;

export function getNextTaskStatus(currentStatus: TaskStatus): TaskStatus {
    switch (currentStatus) {
      case TaskStatus.DRAFT:
        return TaskStatus.TODO;
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
  totalCourseWeeks: number
): Date {
  const sessionDates = SESSION_DATES[session];
  
  // Calculate the adjusted week based on the course's total weeks
  const adjustedWeek = (week / totalCourseWeeks) * STANDARD_WEEKS_PER_SESSION;
  
  // Calculate the due date by adding the adjusted weeks to the session start date
  const dueDate = new Date(sessionDates.start);
  dueDate.setDate(dueDate.getDate() + Math.round(adjustedWeek * 7));
  
  // Check if the calculated date is valid
  if (isNaN(dueDate.getTime())) {
      console.error(`Invalid date calculated for session: ${session}, week: ${week}, totalCourseWeeks: ${totalCourseWeeks}`);
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

export const formatDateToInput = (date: Date | string | null | undefined): string => {
  if (!date) return '';
  const dateObj = date instanceof Date ? date : new Date(date);
  if (isNaN(dateObj.getTime())) {
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
  if (!date) return '';
  // Explicitly convert to Date object if it's not already
  const dateObj = date instanceof Date ? date : new Date(date);
  if (isNaN(dateObj.getTime())) return ''; // Return empty string if date is invalid
  const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
  return dateObj.toLocaleDateString(undefined, options);
};

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

      const timeA = isNaN(dateA.getTime()) ? Number.MAX_SAFE_INTEGER : dateA.getTime();
      const timeB = isNaN(dateB.getTime()) ? Number.MAX_SAFE_INTEGER : dateB.getTime();

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

export const STATUS_CONFIG = {
  [TaskStatus.DRAFT]: {
    label: "DRAFT",
    bgColor: "gray-500",
    textColor: "gray-50",
  },
  [TaskStatus.TODO]: {
    label: "TODO",
    bgColor: "blue-500",
    textColor: "white",
  },
  [TaskStatus.IN_PROGRESS]: {
    label: "IN PROGRESS",
    bgColor: "yellow-500",
    textColor: "white",
  },
  [TaskStatus.COMPLETED]: {
    label: "COMPLETED",
    bgColor: "green-600",
    textColor: "white",
  },
} as const;

/**
 * Order of task statuses for cycling through them
 */
export const STATUS_ORDER = [
  TaskStatus.DRAFT,
  TaskStatus.TODO,
  TaskStatus.IN_PROGRESS,
  TaskStatus.COMPLETED,
] as const;

/**
 * Gets the next status in the status order
 */
export const getNextStatus = (currentStatus: TaskStatus): TaskStatus => {
  const currentIndex = STATUS_ORDER.indexOf(currentStatus);
  const nextIndex = (currentIndex + 1) % STATUS_ORDER.length;
  return STATUS_ORDER[nextIndex]!;
};

/**
 * Validates if a status is a valid TaskStatus
 */
export const isValidStatus = (status: TaskStatus): boolean => {
  return Object.values(TaskStatus).includes(status);
};