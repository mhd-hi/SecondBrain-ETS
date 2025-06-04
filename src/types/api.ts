export interface ParseCourseResponse {
  courseCode: string;
  term: string;
  drafts: Array<{
    week: number;
    type: string;
    title: string;
    estimatedEffort: number;
    suggestedDueDate: string;
    notes: string;
    tags: string[];
    subtasks: Array<{
      title: string;
      estimatedEffort: number;
      notes: string;
      tags: string[];
    }>;
  }>;
} 