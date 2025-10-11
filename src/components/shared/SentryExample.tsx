import React from 'react';
import { captureException, createAPISpan, createProfiledSpan, createUISpan, logger } from '@/lib/sentry-utils';

type SentryExampleProps = {
  userId?: string;
};

export function SentryExampleComponent({ userId }: SentryExampleProps) {
  const handleButtonClick = () => {
    // Create a transaction/span to measure performance
    createUISpan(
      'ui.click',
      'Example Button Click',
      {
        userId: userId || 'anonymous',
        feature: 'example-button',
      },
      () => {
        logger.info('Button clicked by user', { userId });
        // Simulate some work
        logger.debug('Button click processing completed');
      },
    );
  };

  const handleAPICall = async () => {
    try {
      await createAPISpan(
        '/api/example',
        'POST',
        {
          userId: userId || 'anonymous',
          endpoint: 'example',
        },
        async () => {
          // Simulate API call
          const response = await fetch('/api/example', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId }),
          });

          if (!response.ok) {
            throw new Error(`API call failed: ${response.status}`);
          }

          const data = await response.json();
          logger.info('API call successful', {
            endpoint: '/api/example',
            status: response.status,
            responseSize: JSON.stringify(data).length,
          });

          return data;
        },
      );
    } catch (error) {
      // Capture exception with context
      captureException(error as Error, {
        userId,
        endpoint: '/api/example',
        operation: 'api-call',
      });

      logger.error('API call failed', {
        endpoint: '/api/example',
        userId,
        error: (error as Error).message,
      });
    }
  };

  const handleErrorDemo = () => {
    try {
      // Simulate an error
      throw new Error('This is a demo error for Sentry');
    } catch (error) {
      // Log the error with structured logging
      logger.error('Demo error occurred', {
        userId,
        component: 'SentryExampleComponent',
        action: 'handleErrorDemo',
      });

      // Capture the exception
      captureException(error as Error, {
        userId,
        component: 'SentryExampleComponent',
      });
    }
  };

  const handleProfilingDemo = () => {
    // This will be profiled when running on the server side
    createProfiledSpan(
      'cpu.intensive',
      'CPU Intensive Operation',
      {
        userId: userId || 'anonymous',
        operation: 'profiling-demo',
      },
      () => {
        // Simulate CPU intensive work
        const start = Date.now();
        let result = 0;
        for (let i = 0; i < 1000000; i++) {
          result += Math.random();
        }
        const duration = Date.now() - start;

        logger.info('CPU intensive operation completed', {
          userId,
          duration,
          result: result.toFixed(2),
        });

        return result;
      },
    );
  };

  return (
    <div className="space-y-4 p-4 border rounded-lg">
      <h3 className="text-lg font-semibold">Sentry Integration Examples</h3>

      <div className="space-y-2">
        <button
          type="button"
          onClick={handleButtonClick}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Test UI Span Tracking
        </button>

        <button
          type="button"
          onClick={handleAPICall}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Test API Call Tracking
        </button>

        <button
          type="button"
          onClick={handleErrorDemo}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Test Error Capture
        </button>

        <button
          type="button"
          onClick={handleProfilingDemo}
          className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
        >
          Test CPU Profiling
        </button>
      </div>

      <div className="text-sm text-gray-600">
        <p>These buttons demonstrate Sentry&apos;s capabilities:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>UI interaction tracking with spans</li>
          <li>API call performance monitoring</li>
          <li>Error capture with context</li>
          <li>CPU profiling for performance analysis</li>
          <li>Structured logging</li>
        </ul>
      </div>
    </div>
  );
}
