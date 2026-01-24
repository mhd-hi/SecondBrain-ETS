import { StatusTask } from '@/types/status-task';

type TaskLike = {
  status: StatusTask;
};

type TaskWithStringStatus = {
  status: string;
};

/**
 * Calculate progress metrics for any entity with tasks (enum status)
 */
export function calculateProgressMetrics<T extends TaskLike>(items: T[]): {
  total: number;
  completed: number;
  inProgress: number;
  todo: number;
  completionPercentage: number;
};

/**
 * Calculate progress metrics for any entity with tasks (string status)
 */
export function calculateProgressMetrics<T extends TaskWithStringStatus>(items: T[]): {
  total: number;
  completed: number;
  inProgress: number;
  todo: number;
  completionPercentage: number;
};

export function calculateProgressMetrics<T extends TaskLike | TaskWithStringStatus>(items: T[]): {
  total: number;
  completed: number;
  inProgress: number;
  todo: number;
  completionPercentage: number;
} {
  const total = items.length;
  const completed = items.filter(item =>
    item.status === StatusTask.COMPLETED,
  ).length;
  const inProgress = items.filter(item =>
    item.status === StatusTask.IN_PROGRESS,
  ).length;
  const todo = items.filter(item =>
    item.status === StatusTask.TODO,
  ).length;
  const completionPercentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  return {
    total,
    completed,
    inProgress,
    todo,
    completionPercentage,
  };
}

/**
 * Calculate progress metrics for courses based on their completion percentages
 */
export function calculateCourseProgressMetrics(courseProgresses: Array<{ completionPercentage: number }>): {
  total: number;
  completed: number;
  inProgress: number;
  todo: number;
  completionPercentage: number;
} {
  const total = courseProgresses.length;
  const completed = courseProgresses.filter(cp => cp.completionPercentage === 100).length;
  const inProgress = courseProgresses.filter(cp => cp.completionPercentage > 0 && cp.completionPercentage < 100).length;
  const todo = courseProgresses.filter(cp => cp.completionPercentage === 0).length;
  const completionPercentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  return {
    total,
    completed,
    inProgress,
    todo,
    completionPercentage,
  };
}
