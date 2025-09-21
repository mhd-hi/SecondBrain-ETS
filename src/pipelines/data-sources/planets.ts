import type { DataSource, SourceResult } from '@/types/server-pipelines/pipelines';
import { fetchPlanETSContent } from '@/pipelines/add-course-data/steps/planets';

export class PlanetsDataSource implements DataSource {
    name = 'planets';
    description = 'PlanETS Course Content';

    async fetch(courseCode: string, term: string): Promise<SourceResult> {
        if (!term) {
            throw new Error('Term id is required for PlanETS fetch');
        }
        const result = await fetchPlanETSContent(courseCode, term);

        if (!result.html || result.html.trim().length < 100) {
            throw new Error('Course data appears to be empty or invalid');
        }

        return {
            data: result.html,
            logs: result.logs,
            metadata: { source: 'planets', courseCode, term },
        };
    }
}

export default PlanetsDataSource;
