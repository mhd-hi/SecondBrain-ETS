export interface Subtask {
  title: string;
  estimatedEffort: number;
  notes?: string;
  tags: string[];
}

export enum DraftType {
  THEORIE = 'theorie',
  PRATIQUE = 'pratique',
  AUTRE = 'autre'
}

export enum DraftStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected'
}

export interface Draft {
  id: string;
  title: string;
  type: DraftType;
  week: number;
  estimatedEffort: number;
  suggestedDueDate: string;
  notes?: string;
  tags: string[];
  subtasks?: Subtask[];
  status?: DraftStatus;
}

export interface Course {
  id: string;
  code: string;
  term: string;
} 