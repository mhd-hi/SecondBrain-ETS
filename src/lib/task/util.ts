import { TaskStatus } from "@/types/task";

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
        return TaskStatus.PENDING;
      case TaskStatus.PENDING:
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