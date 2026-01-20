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
  // Validate the provider key before accessing aiProviders to prevent prototype pollution
  const fn = Object.prototype.hasOwnProperty.call(aiProviders, provider)
    ? aiProviders[provider]
    : undefined;
  if (!fn) {
    throw new Error(`Unknown AI provider: ${provider}`);
  }
  return await fn(html, userContext);
}
