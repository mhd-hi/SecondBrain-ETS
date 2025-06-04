import { TaskStatus } from "@/types/task";

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
  