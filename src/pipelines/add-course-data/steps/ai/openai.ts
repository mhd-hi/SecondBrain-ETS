import type { AITask } from '@/types/api/ai';
import type { Task } from '@/types/task';
import { callOpenAI } from './call';
import normalizeTasks from './normalize';
import { extractJsonArrayFromText } from './parse';
import { buildCoursePlanParsePrompt, COURSE_PLAN_PARSER_SYSTEM_PROMPT } from './prompt';

export type ParseAIResult = {
  tasks: Array<Omit<Task, 'id' | 'courseId'>>;
  logs: string[];
};

export async function parseContentWithAI(html: string): Promise<ParseAIResult> {
  const logs: string[] = [];
  const log = (...args: unknown[]) => {
    logs.push(args.join(' '));
  };

  const prompt = buildCoursePlanParsePrompt(html);
  log('Built prompt. Length:', prompt.length, 'characters');

  try {
    log('Starting OpenAI API call...');
    const callResult = await callOpenAI([
      { role: 'system', content: COURSE_PLAN_PARSER_SYSTEM_PROMPT },
      { role: 'user', content: prompt },
    ]);

    log('OpenAI API call completed');
    log('Model used:', callResult.model);
    log('Total tokens:', callResult.usage?.total_tokens);

    const aiText = callResult.text;
    if (!aiText || !aiText.trim()) {
      log('OpenAI response is empty');
      throw new Error('No response from OpenAI');
    }

    log('AI response length:', aiText.length, 'characters');
    log('AI response snapshot:', aiText.substring(0, 1000));

    // Parse JSON array from text
    const rawTasks: AITask[] = extractJsonArrayFromText(aiText);
    log('Parsed JSON array. Items:', rawTasks.length);

    const tasks = normalizeTasks(rawTasks);
    log('Normalized tasks. Count:', tasks.length);

    // Include call logs for debugging
    logs.push(`AI usage: total_tokens=${callResult.usage?.total_tokens ?? 'unknown'}`);

    return { tasks, logs };
  } catch (error) {
    log('Error in parseContentWithAI:', error instanceof Error ? error.message : 'Unknown error');
    throw error;
  }
}
