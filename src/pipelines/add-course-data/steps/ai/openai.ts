/* eslint-disable no-console */
import type { Task } from '@/types/task';
import { OpenAI } from 'openai';
import { env } from '@/env';
import { StatusTask } from '@/types/status-task';
import { USE_MOCK_DATA } from '../../../../lib/config';
import { setMockOpenAI } from '../../../../lib/mocks/helper';
import { buildCoursePlanParsePrompt, COURSE_PLAN_PARSER_SYSTEM_PROMPT } from './prompts';

// Custom error class for mock data issues
export class MockDataError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'MockDataError';
  }
}

// Lazy initialization to avoid errors during build time
let openaiInstance: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
  if (!openaiInstance) {
    if (!env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY environment variable is required for AI processing');
    }
    openaiInstance = new OpenAI({
      apiKey: env.OPENAI_API_KEY,
    });
  }
  return openaiInstance;
}

export type ParseAIResult = {
  tasks: Array<Omit<Task, 'id' | 'courseId'>>;
  logs: string[];
};

export async function parseContentWithAI(html: string, courseCode?: string): Promise<ParseAIResult> {
  const logs: string[] = [];
  const log = (...args: unknown[]) => {
    const message = args.join(' ');
    console.log(...args);
    logs.push(message);
  };

  // Check if we should use mock data
  if (USE_MOCK_DATA) {
    log('Mock mode enabled - returning mock data');

    if (!courseCode) {
      throw new MockDataError('Course code is required when using mock data');
    }
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    try {
      const mockData = setMockOpenAI(courseCode);
      log('Mock data returned successfully for', courseCode, '. Generated', mockData.tasks.length, 'tasks');
      return {
        tasks: mockData.tasks.map(task => ({
          title: task.title,
          notes: task.notes,
          week: task.week,
          type: task.type,
          status: StatusTask.TODO,
          estimatedEffort: task.estimatedEffort,
          actualEffort: 0,
          subtasks: task.subtasks?.map(subtask => ({
            id: crypto.randomUUID(),
            title: subtask.title,
            status: StatusTask.TODO,
            notes: subtask.notes,
            estimatedEffort: subtask.estimatedEffort,
          })),
          createdAt: new Date(),
          updatedAt: new Date(),
          dueDate: new Date(), // This will be calculated properly later
        })),
        logs,
      };
    } catch (error) {
      // Re-throw mock data errors with the MockDataError type
      throw new MockDataError(error instanceof Error ? error.message : 'Failed to get mock data');
    }
  }

  // Real OpenAI processing
  // 1) Build the AI prompt
  const prompt = buildCoursePlanParsePrompt(html);
  log('Built prompt. Length:', prompt.length, 'characters');

  // 2) Call OpenAI
  try {
    log('Starting OpenAI API call...');

    const openai = getOpenAIClient();
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: COURSE_PLAN_PARSER_SYSTEM_PROMPT,
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0,
    });

    log('OpenAI API call completed');
    log('Response status:', completion.choices[0]?.finish_reason);
    log('Model used:', completion.model);
    log('Total tokens:', completion.usage?.total_tokens);
    log('Prompt tokens:', completion.usage?.prompt_tokens);
    log('Completion tokens:', completion.usage?.completion_tokens);

    const aiText = completion.choices[0]?.message?.content;
    if (!aiText) {
      log('OpenAI response is empty');
      throw new Error('No response from OpenAI');
    }

    log('AI response length:', aiText.length, 'characters');
    log('Full AI response:', aiText);
    log('Response type:', typeof aiText);
    log('Is response valid JSON?', (() => {
      try {
        JSON.parse(aiText);
        return true;
      } catch (e) {
        console.log('JSON parse error:', e);
        return false;
      }
    })());

    // 3) Parse the JSON array
    log('Attempting to parse JSON response...');
    const tasks = JSON.parse(aiText) as Array<Omit<Task, 'id' | 'courseId'>>;
    log('Successfully parsed JSON. Number of tasks:', tasks.length);
    console.log('OpenAI response:', JSON.stringify(tasks, null, 2));

    return { tasks, logs };
  } catch (error) {
    log('Error in parseContentWithAI:', error instanceof Error ? error.message : 'Unknown error');
    throw error;
  }
}
