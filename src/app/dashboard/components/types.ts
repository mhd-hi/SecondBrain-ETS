export type TaskStatus = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";

export interface Task {
  id: string;
  title: string;
  courseCode: string;
  effort: number; // in minutes
  status: TaskStatus;
  dueDate: Date;
} 