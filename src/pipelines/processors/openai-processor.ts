import type { CourseAIResponse } from '@/types/api/ai';
import { parseContentWithAI } from '@/pipelines/add-course-data/steps/ai/openai';

export class OpenAIProcessor {
    async process(
        combinedData: string,
        courseCode: string,
        term: string,
    ): Promise<{ courseData: CourseAIResponse }> {
        const result = await parseContentWithAI(combinedData);

        const courseData: CourseAIResponse = {
            courseCode,
            term,
            tasks: result.tasks,
        };

        return { courseData };
    }
}

export default OpenAIProcessor;
