import type { OpenAI } from 'openai';
import { getOpenAIClient } from './client';

export type OpenAICallResult = {
  text: string;
  usage?: {
    total_tokens?: number;
    prompt_tokens?: number;
    completion_tokens?: number;
  };
  model?: string;
  finish_reason?: string | null;
};

export async function callOpenAI(
  messages: {
    role: 'system' | 'user' | 'assistant' | string;
    content: string;
  }[],
  model = 'gpt-4o-mini',
): Promise<OpenAICallResult> {
  const openai = getOpenAIClient();

  const sdkMessages = messages.map(m => ({
    role: m.role,
    content: m.content,
  })) as unknown as OpenAI.ChatCompletionCreateParams['messages'];

  const params: OpenAI.ChatCompletionCreateParams = {
    model,
    messages: sdkMessages,
    temperature: 0,
  };

  try {
    const completion = (await openai.chat.completions.create(
      params,
    )) as OpenAI.ChatCompletion;
    const choice = completion.choices?.[0];
    const text = choice?.message?.content ?? '';

    return {
      text,
      usage: completion.usage,
      model: completion.model,
      finish_reason: choice?.finish_reason ?? null,
    };
  } catch (err: unknown) {
    if (err instanceof Error) {
      throw err;
    }
    throw new Error(String(err));
  }
}
