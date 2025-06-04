import { MOCK_COURSE_DATA, setMockCourse } from './mock-data';
import type { CourseImportResponse } from '@/types/course';

// Set this to true to use mock data instead of making API calls
const USE_MOCK_DATA = false;

export async function parseCourse(courseCode: string, term = '20252'): Promise<CourseImportResponse> {
  if (USE_MOCK_DATA) {
    // Set the mock course based on the course code
    setMockCourse(courseCode);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Get the mock data for the selected course
    if (!MOCK_COURSE_DATA) {
      throw new Error(`Mock data not available for course ${courseCode}`);
    }

    // Transform ParseCourseResponse to CourseImportResponse
    return {
      courseCode: MOCK_COURSE_DATA.courseCode,
      term: MOCK_COURSE_DATA.term,
      tasks: MOCK_COURSE_DATA.tasks.map(task => ({
        title: task.title,
        week: task.week,
        type: task.type,
        subtasks: task.subtasks?.map(subtask => ({
          id: crypto.randomUUID(),
          title: subtask.title,
          completed: false,
          notes: subtask.notes,
          estimatedEffort: subtask.estimatedEffort
        }))
      }))
    };
  }

  const response = await fetch(
    `/api/parse-course?courseCode=${encodeURIComponent(courseCode.trim())}&term=${term}`
  )

  if (!response.ok) {
    throw new Error('Failed to parse course')
  }

  return response.json() as Promise<CourseImportResponse>
} 