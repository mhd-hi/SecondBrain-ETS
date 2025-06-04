import { type Draft } from '@/types/course';
import { fetchPlanETSContent } from './planets';
import { parseContentWithAI } from './openai';

export interface ParseCourseResult {
  courseCode: string;
  term: string;
  drafts: Array<Omit<Draft, 'id' | 'courseId'>>;
  logs: string[];
}

export async function parseCoursePlan(
  courseCode: string,
  term: string,
): Promise<ParseCourseResult> {
  const logs: string[] = [];

  // 1) Fetch and parse PlanETS content
  const { html: relevantHtml, logs: fetchLogs } = await fetchPlanETSContent(courseCode, term);
  logs.push(...fetchLogs);

  // 2) Process with OpenAI
  const { drafts, logs: aiLogs } = await parseContentWithAI(relevantHtml);
  logs.push(...aiLogs);

  // 3) Return the result
  return {
    courseCode,
    term,
    drafts,
    logs,
  };
} 