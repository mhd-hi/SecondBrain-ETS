import { TaskStatus } from "@/types/task";

export const taskStatusOrder: TaskStatus[] = [TaskStatus.DRAFT, TaskStatus.PENDING, TaskStatus.IN_PROGRESS, TaskStatus.COMPLETED];

export const taskStatusColors: Record<TaskStatus, string> = {
  [TaskStatus.DRAFT]: "bg-gray-500",
  [TaskStatus.PENDING]: "bg-yellow-500",
  [TaskStatus.IN_PROGRESS]: "bg-blue-500",
  [TaskStatus.COMPLETED]: "bg-green-500",
} as const;

export const getNextTaskStatus = (currentStatus: TaskStatus): TaskStatus => {
  const currentIndex = taskStatusOrder.indexOf(currentStatus);
  if (currentIndex === -1) {
    return TaskStatus.DRAFT;
  }
  const nextIndex = (currentIndex + 1) % taskStatusOrder.length;
  return taskStatusOrder[nextIndex]!;
}; 