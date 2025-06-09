import { NextResponse } from 'next/server';
import type { PipelineStepRequest, PipelineStepResult } from '@/types/pipeline';
import { PlanetsDataSource, OpenAIProcessor } from '@/lib/course/server-pipeline';
import { withAuthSimple } from '@/lib/auth/api';
import { assertValidCourseCode } from '@/lib/course/util';

// Endpoint for step-by-step course processing
export const POST = withAuthSimple(
  async (request, _user) => {
    try {
      const body = await request.json() as PipelineStepRequest;
      const { courseCode, term = '20252', step, htmlData } = body;
      if (!courseCode) {
        return NextResponse.json(
          { error: 'Missing required parameter: courseCode' },
          { status: 400 }
        );
      }    // Validate course code format
      let cleanCode: string;
      try {
        cleanCode = assertValidCourseCode(courseCode, 'Invalid course code format');
      } catch (error) {
        return NextResponse.json(
          { error: error instanceof Error ? error.message : 'Invalid course code format' },
          { status: 400 }
        );
      }

      if (step === 'planets') {
        try {
          const startTime = new Date().toISOString();
          const planetsSource = new PlanetsDataSource();
          const result = await planetsSource.fetch(cleanCode, term);
          const endTime = new Date().toISOString();

          // Validate that we have meaningful content
          if (!result.data || result.data.trim().length < 100) {
            throw new Error('Course data appears to be empty or invalid');
          }

          return NextResponse.json({
            step: {
              id: 'planets',
              name: 'PlanETS Data Fetch',
              status: 'success',
              startTime,
              endTime,
              data: {
                contentLength: result.data.length,
                source: 'planets',
                courseCode: cleanCode,
                term
              }
            },
            logs: result.logs,
            data: result.data
          } as PipelineStepResult);

        } catch (error) {
          const errorMessage = error instanceof Error
            ? `Failed to fetch course data: ${error.message}`
            : 'Failed to fetch course data from Planets';

          return NextResponse.json({
            step: {
              id: 'planets',
              name: 'PlanETS Data Fetch',
              status: 'error',
              error: errorMessage,
              endTime: new Date().toISOString()
            },
            logs: [errorMessage],
            data: null
          } as PipelineStepResult, { status: 500 });
        }
      }

      if (step === 'openai') {
        if (!htmlData) {
          return NextResponse.json(
            { error: 'Missing required parameter: htmlData for OpenAI processing' },
            { status: 400 }
          );
        }

        try {
          const startTime = new Date().toISOString();
          const aiProcessor = new OpenAIProcessor();
          const result = await aiProcessor.process(htmlData, cleanCode);
          const endTime = new Date().toISOString(); const courseData = {
            courseCode: cleanCode,
            term,
            tasks: result.tasks
          };

          return NextResponse.json({
            step: {
              id: 'openai',
              name: 'AI Content Parsing',
              status: 'success',
              startTime,
              endTime,
              data: { tasksCount: result.tasks.length }
            },
            logs: ['AI processing completed successfully'],
            data: courseData
          } as PipelineStepResult);

        } catch (error) {
          const errorMessage = error instanceof Error
            ? `Failed to parse course content with OpenAI: ${error.message}`
            : 'Failed to parse course content with OpenAI';

          return NextResponse.json({
            step: {
              id: 'openai',
              name: 'AI Content Parsing',
              status: 'error',
              error: errorMessage,
              endTime: new Date().toISOString()
            },
            logs: [errorMessage],
            data: null
          } as PipelineStepResult, { status: 500 });
        }
      }

      return NextResponse.json(
        { error: 'Invalid step parameter. Must be "planets" or "openai"' },
        { status: 400 }
      );

    } catch (error) {
      console.error('Error in course pipeline:', error);
      return NextResponse.json(
        {
          error: error instanceof Error ? error.message : 'Unknown error occurred',
          logs: []
        },
        { status: 500 }
      );
    }
  }
);
