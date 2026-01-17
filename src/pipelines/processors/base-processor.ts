import type { CourseAIResponse } from '@/types/api/ai';

/**
 * Base interface for AI content processors
 * Allows switching between different AI providers (OpenAI, Anthropic, etc.)
 */
export type AIContentProcessor = {
  /**
   * Process HTML content and extract course plan data
   * @param htmlContent - The HTML content to parse
   * @returns Parsed course data with tasks
   */
  process: (htmlContent: string) => Promise<{ courseData: CourseAIResponse }>;
};

/**
 * Factory for creating AI processors
 */
export class AIProcessorFactory {
  private static defaultProvider: string = 'openai';

  static setDefaultProvider(provider: string): void {
    this.defaultProvider = provider;
  }

  static async createProcessor(provider?: string): Promise<AIContentProcessor> {
    const selectedProvider = provider || this.defaultProvider;

    switch (selectedProvider) {
      case 'openai': {
        const { OpenAIProcessor } = await import('./openai-processor');
        return new OpenAIProcessor();
      }
      // Future providers can be added here:
      // case 'anthropic': {
      //   const { AnthropicProcessor } = await import('./anthropic-processor');
      //   return new AnthropicProcessor();
      // }
      default:
        throw new Error(`Unknown AI provider: ${selectedProvider}`);
    }
  }
}
