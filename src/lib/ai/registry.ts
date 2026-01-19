import type { AIProviderName } from './config';
import { ACTIVE_PROVIDER } from './config';
import { parseContentWithAI } from './openai';

export type { AIProviderName } from './config';

export const aiProviders = {
  openai: parseContentWithAI,
  // Add more providers here
};
export async function runAIProvider(
  html: string,
  userContext?: string,
  provider: AIProviderName = ACTIVE_PROVIDER,
) {
  const fn = aiProviders[provider];
  if (!fn) {
    throw new Error(`Unknown AI provider: ${provider}`);
  }
  return await fn(html, userContext);
}
