import type { CourseAIResponse } from '@/types/api/ai';
import { ServerCourseProcessingPipeline } from '@/pipelines/server-pipeline';

export async function parseCourse(courseCode: string, term: string): Promise<CourseAIResponse> {
  const pipeline = new ServerCourseProcessingPipeline();
  const result = await pipeline.process({ courseCode, term });
  return result.courseData;
}
