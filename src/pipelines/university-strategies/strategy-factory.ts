import type { UniversityDataStrategy } from './base-strategy';
import type { UniversityId } from '@/types/university';
import { UNIVERSITY } from '@/types/university';
import { ETSStrategy } from './ets-strategy';

/**
 * Factory to get the appropriate university data strategy
 */
export class UniversityStrategyFactory {
  private static strategies = new Map<UniversityId, UniversityDataStrategy>([
    [UNIVERSITY.ETS, new ETSStrategy()],
    // Add more universities here as needed
  ]);

  /**
   * Get the strategy for a specific university
   * @param universityId - University identifier
   * @returns Strategy instance
   * @throws Error if university is not supported
   */
  static getStrategy(universityId: UniversityId): UniversityDataStrategy {
    const strategy = this.strategies.get(universityId);
    if (!strategy) {
      throw new Error(
        `No strategy found for university: ${universityId}. Supported universities: ${Array.from(this.strategies.keys()).join(', ')}`,
      );
    }
    return strategy;
  }
}
