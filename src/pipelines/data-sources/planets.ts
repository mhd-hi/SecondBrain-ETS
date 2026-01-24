import type {
  DataSource,
  SourceResult,
} from '@/types/server-pipelines/pipelines';
import type { UniversityId } from '@/types/university';
import { UniversityStrategyFactory } from '@/pipelines/university-strategies/strategy-factory';

/**
 * Data source for fetching course content from university systems
 * Uses strategy pattern to support multiple universities
 */
export class UniversityCourseDataSource implements DataSource {
  name: string;
  description: string;
  private universityId: UniversityId;

  constructor(universityId: UniversityId) {
    this.universityId = universityId;
    const strategy = UniversityStrategyFactory.getStrategy(universityId);
    this.name = `university_${universityId}`;
    this.description = `${strategy.name} Course Content`;
  }

  async fetch(courseCode: string, term: string): Promise<SourceResult> {
    const strategy = UniversityStrategyFactory.getStrategy(this.universityId);
    const html = await strategy.fetchCourseContent(courseCode, term);

    return {
      data: html,
      metadata: {
        source: this.name,
        courseCode,
        term,
        universityId: this.universityId,
      },
    };
  }
}
