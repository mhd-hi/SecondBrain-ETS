export interface ParseCourseResponse {
  courseCode: string;
  term: string;
  tasks: Array<{
    week: number;
    type: 'theorie' | 'pratique' | 'exam' | 'homework' | 'lab';
    title: string;
    estimatedEffort: number;
    notes: string;
    subtasks?: Array<{
      title: string;
      estimatedEffort: number;
      notes: string;
    }>;
  }>;
} 