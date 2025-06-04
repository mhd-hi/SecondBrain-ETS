import { MOCK_COURSES } from './mocks/openai-data';
import { setMockOpenAI } from './mocks/helper';

import type { CourseAIResponse } from '@/types/course';

// Set this to true to use mock data instead of making API calls
const USE_MOCK_DATA = true;

export async function parseCourse(courseCode: string, term = '20252'): Promise<CourseAIResponse> {
  if (USE_MOCK_DATA) {
    // Set the mock course based on the course code
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 50));
    
    // Get the mock data for the selected course
    if (!MOCK_COURSES) {
      throw new Error(`Mock data not available for course ${courseCode}`);
    }

    // Transform ParseCourseResponse to CourseAIResponse
    return setMockOpenAI(courseCode);
  }

  const response = await fetch(
    `/api/parse-course?courseCode=${encodeURIComponent(courseCode.trim())}&term=${term}`
  )

  if (!response.ok) {
    throw new Error('Failed to parse course')
  }

  return response.json() as Promise<CourseAIResponse>
} 