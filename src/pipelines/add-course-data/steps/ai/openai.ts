/* eslint-disable no-console */
import type { Task } from '@/types/task';
import { OpenAI } from 'openai';
import { env } from '@/env';
import { buildCoursePlanParsePrompt, COURSE_PLAN_PARSER_SYSTEM_PROMPT } from './prompts';

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

export async function parseContentWithAI(html: string): Promise<ParseAIResult> {
  const logs: string[] = [];
  const log = (...args: unknown[]) => {
    const message = args.join(' ');
    console.log(...args);
    logs.push(message);
  };

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
    if (!aiText || typeof aiText !== 'string' || !aiText.trim()) {
      log('OpenAI response is empty');
      throw new Error('No response from OpenAI');
    }

    log('AI response length:', aiText.length, 'characters');
    log('Full AI response (trimmed):', aiText.substring(0, 1000));

    // Robust JSON extraction: try direct parse first, then attempt to extract JSON block
    const tryParse = (text: string) => {
      try {
        const parsed = JSON.parse(text);
        return parsed;
      } catch {
        return null;
      }
    };

    // 3a) Direct parse
    log('Attempting direct JSON parse...');
    let parsed = tryParse(aiText);

    // 3b) If direct parse fails, attempt to extract JSON between first '[' and last ']' (JSON array expected)
    if (!parsed) {
      log('Direct parse failed, attempting to extract JSON array block...');
      const firstBracket = aiText.indexOf('[');
      const lastBracket = aiText.lastIndexOf(']');
      if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
        const candidate = aiText.substring(firstBracket, lastBracket + 1);
        log('Extracted candidate JSON substring length:', candidate.length);
        parsed = tryParse(candidate);
      }
    }

    if (!parsed) {
      // Final fallback: try to find a JSON object array block using regex (simple heuristic)
      log('Extraction attempt failed, trying heuristic regex...');
      const regex = /(\[\s*\{[\s\S]*\}\s*\])/;
      const match = aiText.match(regex);
      if (match && match[1]) {
        parsed = tryParse(match[1]);
      }
    }

    if (!parsed) {
      log('Failed to parse JSON from AI response. Response snapshot:', aiText.substring(0, 2000));
      throw new Error('Unable to parse JSON from AI response');
    }

    // Validate parsed structure is an array of tasks
    if (!Array.isArray(parsed)) {
      log('Parsed AI response is not an array. Type:', typeof parsed);
      throw new Error('AI response JSON is not an array of tasks');
    }

    const tasks = parsed as Array<Omit<Task, 'id' | 'courseId'>>;
    log('Successfully parsed JSON. Number of tasks:', tasks.length);
    log('Parsed tasks sample:', JSON.stringify(tasks.slice(0, 3), null, 2));

    return { tasks, logs };
  } catch (error) {
    log('Error in parseContentWithAI:', error instanceof Error ? error.message : 'Unknown error');
    throw error;
  }
}
