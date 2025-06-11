import type { CourseAIResponse } from '@/types/api';
// Re-export from the proper location
// Legacy exports - these are now handled by the course processing pipeline
// For backwards compatibility, we re-export the parseCourse function
import { ServerCourseProcessingPipeline } from '@/lib/course/server-pipeline';

export { api } from '@/lib/api/util';

export async function parseCourse(courseCode: string, term = '20252'): Promise<CourseAIResponse> {
  const pipeline = new ServerCourseProcessingPipeline();
  const result = await pipeline.process({ courseCode, term });
  return result.courseData;
}
