import { TaskStatus } from "@/types/task";

export const taskStatusOrder: TaskStatus[] = [TaskStatus.DRAFT, TaskStatus.TODO, TaskStatus.IN_PROGRESS, TaskStatus.COMPLETED];

export const getNextTaskStatus = (currentStatus: TaskStatus): TaskStatus => {
  const currentIndex = taskStatusOrder.indexOf(currentStatus);
  if (currentIndex === -1) {
    return TaskStatus.DRAFT;
  }
  const nextIndex = (currentIndex + 1) % taskStatusOrder.length;
  return taskStatusOrder[nextIndex]!;
}; 