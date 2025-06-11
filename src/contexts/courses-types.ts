// Simple interface for courses list view (used by sidebar)
export type CourseListItem = {
  id: string;
  code: string;
  name: string;
  overdueCount: number;
};
