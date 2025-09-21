import type { CourseAIResponse } from '@/types/api/ai';
import type {
  DataSource,
  PipelineOptions,
  PipelineResult,
  ProcessingStep,
  SourceResult,
} from '@/types/server-pipelines/pipelines';
import { parseContentWithAI } from '@/pipelines/add-course-data/steps/ai/openai';
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

export class OpenAIProcessor {
  async process(
    combinedData: string,
    courseCode: string,
    term: string,
  ): Promise<{ courseData: CourseAIResponse; logs: string[] }> {
    const result = await parseContentWithAI(combinedData);

    const courseData: CourseAIResponse = {
      courseCode,
      term,
      tasks: result.tasks.map(task => ({
        week: task.week,
        type: task.type,
        title: task.title,
        notes: task.notes,
        estimatedEffort: task.estimatedEffort,
        subtasks: task.subtasks,
      })),
    };

    return { courseData, logs: result.logs };
  }
}

/**
 * Flexible server-side pipeline that can handle different data sources
 */
export class ServerCourseProcessingPipeline {
  private dataSources: DataSource[] = [];
  private processor = new OpenAIProcessor();
  private steps: ProcessingStep[] = [];
  private logs: string[] = [];
  private onStepUpdate?: (steps: ProcessingStep[]) => void;

  constructor(onStepUpdate?: (steps: ProcessingStep[]) => void) {
    this.onStepUpdate = onStepUpdate;
    // Register default data sources
    this.registerDataSource(new PlanetsDataSource());
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
    console.log(message); // eslint-disable-line no-console
    this.logs.push(`[${new Date().toISOString()}] ${message}`);
  }

  /**
   * Process a course with all registered data sources
   */
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
      // Fetch data from all sources
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

      // Combine data and process with AI
      const combinedData = sourceResults.map(result => result.data).join('\n\n');
      this.log(`Combined data from ${sourceResults.length} source(s)`);

      this.updateStep('ai_processing', { status: 'loading', startTime: new Date() });

      try {
        this.log('Starting AI Content Parsing...');
        const aiResult = await this.processor.process(combinedData, courseCode, term);

        // Append AI-specific logs to pipeline logs
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
