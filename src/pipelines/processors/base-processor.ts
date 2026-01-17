import type { CourseAIResponse } from '@/types/api/ai';
import type { SupportedAIProvider } from '@/types/server-pipelines/pipelines';

/**
 * Base interface for AI content processors
 * Allows switching between different AI providers (OpenAI, Anthropic, etc.)
 */
export type AIContentProcessor = {
  /**
   * Process HTML content and extract course plan data
   * @param htmlContent - The HTML content to parse
   * @param userContext - Optional user-provided context for task generation
   * @returns Parsed course data with tasks
   */
  process: (htmlContent: string, userContext?: string) => Promise<{ courseData: CourseAIResponse }>;
};

/**
 * Factory for creating AI processors
 */
export class AIProcessorFactory {
  private static defaultProvider: SupportedAIProvider = 'openai';

  static setDefaultProvider(provider: SupportedAIProvider): void {
    this.defaultProvider = provider;
  }

  static async createProcessor(
    provider?: SupportedAIProvider,
  ): Promise<AIContentProcessor> {
    const selectedProvider = provider || this.defaultProvider;
    switch (selectedProvider) {
      case 'openai': {
        const { OpenAIProcessor } = await import('./openai-processor');
        return new OpenAIProcessor();
      }
      // Add new providers here as needed, e.g.:
      // case 'anthropic': {
      //   const { AnthropicProcessor } = await import('./anthropic-processor');
      //   return new AnthropicProcessor();
      // }
      default:
        throw new Error(`Unknown AI provider: ${selectedProvider}`);
    }
  }
}
