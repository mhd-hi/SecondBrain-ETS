export enum TaskStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed'
}

export enum ReviewStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected'
}

export interface Task {
  id: string;
  title: string;
  week: number;
  isDraft: boolean;
  type: 'theorie' | 'pratique';
  estimatedEffort: number;
  suggestedDueDate: string;
  tags: string[];
  modified?: boolean;
  status?: TaskStatus;
} 