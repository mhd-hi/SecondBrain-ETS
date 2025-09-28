import type {
    DataSource,
    PipelineOptions,
    PipelineResult,
    ProcessingStep,
    SourceResult,
} from '@/types/server-pipelines/pipelines';
import OpenAIProcessor from '@/pipelines/processors/openai-processor';

export class ServerCourseProcessingPipeline {
    private dataSources: DataSource[] = [];
    private processor = new OpenAIProcessor();
    private steps: ProcessingStep[] = [];
    private logs: string[] = [];
    private onStepUpdate?: (steps: ProcessingStep[]) => void;

    constructor(onStepUpdate?: (steps: ProcessingStep[]) => void) {
        this.onStepUpdate = onStepUpdate;
    }

    registerDataSource(source: DataSource) {
        this.dataSources.push(source);
    }

    private createStep(id: string, name: string): ProcessingStep {
        return {
            id,
            name,
            status: 'pending',
        };
    }

    private updateStep(id: string, updates: Partial<ProcessingStep>) {
        const step = this.steps.find(s => s.id === id);
        if (step) {
            Object.assign(step, updates);
            if (this.onStepUpdate) {
                this.onStepUpdate([...this.steps]);
            }
        }
    }

    private log(message: string) {
        // eslint-disable-next-line no-console
        console.log(message);
        this.logs.push(`[${new Date().toISOString()}] ${message}`);
    }

    async process(options: PipelineOptions): Promise<PipelineResult> {
        const { courseCode, term } = options;
        if (!term) {
            throw new Error('Term id is required');
        }

        this.steps = [];
        this.logs = [];

        this.log(`Starting course processing pipeline for ${courseCode}`);

        // Create steps for each data source + processing
        for (const source of this.dataSources) {
            this.steps.push(this.createStep(`source_${source.name}`, source.description));
        }
        this.steps.push(this.createStep('ai_processing', 'AI Content Parsing'));

        try {
            const sourceResults: SourceResult[] = [];

            for (const source of this.dataSources) {
                const stepId = `source_${source.name}`;
                this.updateStep(stepId, { status: 'loading', startTime: new Date() });

                try {
                    this.log(`Fetching data from ${source.description}...`);
                    const result = await source.fetch(courseCode, term);

                    sourceResults.push(result);
                    this.logs.push(...result.logs);

                    this.updateStep(stepId, {
                        status: 'success',
                        endTime: new Date(),
                        data: { metadata: result.metadata },
                    });

                    this.log(`Successfully fetched data from ${source.description}`);
                } catch (error) {
                    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                    this.updateStep(stepId, {
                        status: 'error',
                        endTime: new Date(),
                        error: errorMessage,
                    });

                    this.log(`Failed to fetch data from ${source.description}: ${errorMessage}`);
                    throw error;
                }
            }

            const combinedData = sourceResults.map(r => r.data).join('\n\n');
            this.log(`Combined data from ${sourceResults.length} source(s)`);

            this.updateStep('ai_processing', { status: 'loading', startTime: new Date() });

            try {
                this.log('Starting AI Content Parsing...');
                const aiResult = await this.processor.process(combinedData, courseCode, term);

                if (Array.isArray(aiResult.logs) && aiResult.logs.length) {
                    this.logs.push(...aiResult.logs.map(l => `[AI] ${l}`));
                }

                this.updateStep('ai_processing', {
                    status: 'success',
                    endTime: new Date(),
                    data: { tasksCount: aiResult.courseData.tasks.length },
                });

                this.log(`AI processing completed successfully. Generated ${aiResult.courseData.tasks.length} tasks`);

                return {
                    courseData: aiResult.courseData,
                    steps: this.steps,
                    logs: this.logs,
                };
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                this.updateStep('ai_processing', {
                    status: 'error',
                    endTime: new Date(),
                    error: errorMessage,
                });

                this.log(`AI processing failed: ${errorMessage}`);
                throw error;
            }
        } catch (error) {
            this.log(`Pipeline failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
            throw error;
        }
    }

    getSteps(): ProcessingStep[] {
        return [...this.steps];
    }

    getLogs(): string[] {
        return [...this.logs];
    }
}

export default ServerCourseProcessingPipeline;
