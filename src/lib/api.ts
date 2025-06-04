import { type Draft } from '@/types/course'

interface ParseCourseResponse {
  courseCode: string
  term: string
  drafts: Array<Omit<Draft, 'id' | 'courseId'>>
}

export async function parseCourse(courseCode: string, term = '20252'): Promise<ParseCourseResponse> {
  const response = await fetch(
    `/api/parse-course?courseCode=${encodeURIComponent(courseCode.trim())}&term=${term}`
  )

  if (!response.ok) {
    throw new Error('Failed to parse course')
  }

  return response.json() as Promise<ParseCourseResponse>
} 