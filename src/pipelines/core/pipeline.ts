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

    async process(options: PipelineOptions): Promise<PipelineResult> {
        const { courseCode, term } = options;
        if (!term) {
            throw new Error('Term id is required');
        }

        this.steps = [];

        console.log(`Starting course processing pipeline for ${courseCode}`);

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
                    console.log(`Fetching data from ${source.description}...`);
                    const result = await source.fetch(courseCode, term);

                    sourceResults.push(result);

                    this.updateStep(stepId, {
                        status: 'success',
                        endTime: new Date(),
                        data: { metadata: result.metadata },
                    });

                    console.log(`Successfully fetched data from ${source.description}`);
                } catch (error) {
                    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                    this.updateStep(stepId, {
                        status: 'error',
                        endTime: new Date(),
                        error: errorMessage,
                    });

                    console.log(`Failed to fetch data from ${source.description}: ${errorMessage}`);
                    throw error;
                }
            }

            const combinedData = sourceResults.map(r => r.data).join('\n\n');
            console.log(`Combined data from ${sourceResults.length} source(s)`);

            this.updateStep('ai_processing', { status: 'loading', startTime: new Date() });

            try {
                console.log('Starting AI Content Parsing...');
                const aiResult = await this.processor.process(combinedData, courseCode, term);

                this.updateStep('ai_processing', {
                    status: 'success',
                    endTime: new Date(),
                    data: { tasksCount: aiResult.courseData.tasks.length },
                });

                console.log(`AI processing completed successfully. Generated ${aiResult.courseData.tasks.length} tasks`);

                return {
                    courseData: aiResult.courseData,
                    steps: this.steps,
                };
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                this.updateStep('ai_processing', {
                    status: 'error',
                    endTime: new Date(),
                    error: errorMessage,
                });

                console.log(`AI processing failed: ${errorMessage}`);
                throw error;
            }
        } catch (error) {
            console.log(`Pipeline failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
            throw error;
        }
    }

    getSteps(): ProcessingStep[] {
        return [...this.steps];
    }
}

export default ServerCourseProcessingPipeline;
