import { OpenAI } from 'openai';
import { env } from '@/env';

let openaiInstance: OpenAI | null = null;

export function getOpenAIClient(): OpenAI {
    if (!openaiInstance) {
        if (!env.OPENAI_API_KEY) {
            throw new Error('OPENAI_API_KEY environment variable is required for AI processing');
        }
        openaiInstance = new OpenAI({ apiKey: env.OPENAI_API_KEY });
    }
    return openaiInstance;
}

export default getOpenAIClient;
