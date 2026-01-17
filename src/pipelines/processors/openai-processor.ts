import type { AIContentProcessor } from './base-processor';
import type { CourseAIResponse } from '@/types/api/ai';
import { parseContentWithAI } from '@/pipelines/add-course-data/steps/ai/openai';

/**
 * OpenAI-specific implementation of AI content processor
 */
export class OpenAIProcessor implements AIContentProcessor {
  async process(
    combinedData: string,
    userContext?: string,
  ): Promise<{ courseData: CourseAIResponse }> {
    const result = await parseContentWithAI(combinedData, userContext);

    const courseData: CourseAIResponse = {
      courseCode: '',
      term: '',
      tasks: result.tasks,
    };

    return { courseData };
  }
}

export default OpenAIProcessor;
