import type { Task } from './task';

export type TodaysFocusGroup = 'overdue' | 'today' | 'tomorrow' | 'thisWeek' | 'later';

export type GroupedTasks = {
  overdue: Task[];
  today: Task[];
  tomorrow: Task[];
  thisWeek: Task[];
  later: Task[];
};

export type GroupConfig = {
  title: string;
  tasks: Task[];
};

export type FilterType = 'week' | 'month' | 'quarter';
