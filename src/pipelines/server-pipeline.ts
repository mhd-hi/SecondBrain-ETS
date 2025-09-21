/**
 * Server-side Course Processing Pipeline
 * Simplified and more flexible pipeline for server-side course processing
 */

import type { CourseAIResponse } from '@/types/api/ai';
import type {
  DataSource,
  PipelineOptions,
  PipelineResult,
  ProcessingStep,
  SourceResult,
  StepStatus,
} from '@/types/pipeline';
import { parseContentWithAI } from '@/pipelines/add-course-data/steps/ai/openai';
import { fetchPlanETSContent } from '@/pipelines/add-course-data/steps/planets';

// Server-side data source implementations
export class PlanetsDataSource implements DataSource {
  name = 'planets';
  description = 'PlanETS Course Content';

  async fetch(courseCode: string, term?: string): Promise<SourceResult> {
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
  async process(combinedData: string, courseCode: string, term: string): Promise<CourseAIResponse> {
    const result = await parseContentWithAI(combinedData, courseCode);

    return {
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
   * Process course with independent step tracking
   * Each step runs and updates independently
   */
  async processWithIndependentSteps(options: PipelineOptions): Promise<{
    stepStatus: StepStatus;
    courseData?: CourseAIResponse;
    logs: string[];
  }> {
    const { courseCode, term } = options;
    if (!term) {
      throw new Error('Term id is required');
    }

    // Initialize step status
    const stepStatus: StepStatus = {
      planets: { id: 'planets', name: 'PlanETS Data Fetch', status: 'pending' },
      openai: { id: 'openai', name: 'AI Content Parsing', status: 'pending' },
    };

    const logs: string[] = [];
    let htmlData: string | undefined;
    let courseData: CourseAIResponse | undefined;

    // Step 1: Fetch from planets
    stepStatus.planets = { ...stepStatus.planets, status: 'loading', startTime: new Date() };

    try {
      const source = new PlanetsDataSource();
      const result = await source.fetch(courseCode, term);
      htmlData = result.data;
      logs.push(...result.logs);

      stepStatus.planets = {
        ...stepStatus.planets,
        status: 'success',
        endTime: new Date(),
        data: { contentLength: htmlData.length },
      };
    } catch (error) {
      stepStatus.planets = {
        ...stepStatus.planets,
        status: 'error',
        endTime: new Date(),
        error: error instanceof Error ? error.message : 'Unknown error',
      };

      return { stepStatus, logs };
    }

    // Step 2: Process with OpenAI (only if planets succeeded)
    if (htmlData) {
      stepStatus.openai = { ...stepStatus.openai, status: 'loading', startTime: new Date() };

      try {
        courseData = await this.processor.process(htmlData, courseCode, term);

        stepStatus.openai = {
          ...stepStatus.openai,
          status: 'success',
          endTime: new Date(),
          data: { tasksCount: courseData.tasks.length },
        };
      } catch (error) {
        stepStatus.openai = {
          ...stepStatus.openai,
          status: 'error',
          endTime: new Date(),
          error: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    }

    return { stepStatus, courseData, logs };
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

        this.updateStep('ai_processing', {
          status: 'success',
          endTime: new Date(),
          data: { tasksCount: aiResult.tasks.length },
        });

        this.log(`AI processing completed successfully. Generated ${aiResult.tasks.length} tasks`);

        return {
          courseData: aiResult,
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

// Convenience function for simple usage
export async function processCourse(courseCode: string, term: string): Promise<CourseAIResponse> {
  if (!term) {
    throw new Error('Term id is required');
  }
  const pipeline = new ServerCourseProcessingPipeline();
  const result = await pipeline.process({ courseCode, term });
  return result.courseData;
}

// Export legacy name for backward compatibility
export const UnifiedCourseProcessingPipeline = ServerCourseProcessingPipeline;
