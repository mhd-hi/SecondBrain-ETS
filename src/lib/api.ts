import { type ParseCourseResponse } from '@/types/api'
import { MOCK_COURSE_DATA } from './mock-data';

// Set this to true to use mock data instead of making API calls
const USE_MOCK_DATA = true;

export async function parseCourse(courseCode: string, term = '20252'): Promise<ParseCourseResponse> {
  if (USE_MOCK_DATA) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    if (!MOCK_COURSE_DATA) throw new Error('Mock data is not available');
    return MOCK_COURSE_DATA;
  }

  const response = await fetch(
    `/api/parse-course?courseCode=${encodeURIComponent(courseCode.trim())}&term=${term}`
  )

  if (!response.ok) {
    throw new Error('Failed to parse course')
  }

  return response.json() as Promise<ParseCourseResponse>
} 