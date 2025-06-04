export interface Subtask {
  title: string;
  estimatedEffort: number;
  notes?: string;
  tags: string[];
}

export interface Draft {
  id: string;
  title: string;
  type: 'theorie' | 'pratique' | 'autre';
  week: number;
  estimatedEffort: number;
  suggestedDueDate: string;
  notes?: string;
  tags: string[];
  subtasks?: Subtask[];
}

export interface Course {
  id: string;
  code: string;
  term: string;
} 