import { OpenAI } from 'openai';
import { type Draft } from '@/types/course';
import { COURSE_PLAN_PARSER_SYSTEM_PROMPT, buildCoursePlanParsePrompt } from './prompts';

if (!process.env.OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY is not set in environment variables');
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface ParseResult {
  drafts: Array<Omit<Draft, 'id' | 'courseId'>>;
  logs: string[];
}

export async function parseContentWithAI(html: string): Promise<ParseResult> {
  const logs: string[] = [];
  const log = (message: string) => {
    console.log(message);
    logs.push(message);
  };

  // 1) Build the AI prompt
  const prompt = buildCoursePlanParsePrompt(html);
  log(`Built prompt. Length: ${prompt.length} characters`);

  // 2) Call OpenAI
  try {
    log('Starting OpenAI API call...');
    
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
    log(`Response status: ${completion.choices[0]?.finish_reason}`);
    
    const aiText = completion.choices[0]?.message?.content;
    if (!aiText) {
      log('OpenAI response is empty');
      throw new Error('No response from OpenAI');
    }

    log(`AI response length: ${aiText.length} characters`);
    log(`Full AI response: ${aiText}`);
    log(`Response type: ${typeof aiText}`);
    log(`Is response valid JSON? ${(() => {
      try {
        JSON.parse(aiText);
        return true;
      } catch (e) {
        console.log(e);
        return false;
      }
    })()}`);

    // 3) Parse the JSON array
    log('Attempting to parse JSON response...');
    const drafts = JSON.parse(aiText) as Array<Omit<Draft, 'id' | 'courseId'>>;
    log(`Successfully parsed JSON. Number of drafts: ${drafts.length}`);

    return {
      drafts,
      logs,
    };
  } catch (error) {
    const errorMessage = `Error processing with AI: ${error instanceof Error ? error.message : String(error)}`;
    log(errorMessage);
    throw new Error(errorMessage);
  }
} 