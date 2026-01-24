import * as Sentry from '@sentry/nextjs';

export const consoleLoggingConfig = Sentry.consoleLoggingIntegration({
  levels: ['log', 'warn', 'error'],
});

// Logger instance
export const { logger } = Sentry;

/**
 * Wrapper for Sentry.captureException with additional context
 */
export function captureException(error: Error, context?: Record<string, unknown>) {
  if (context) {
    Sentry.withScope((scope) => {
      Object.entries(context).forEach(([key, value]) => {
        if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
          scope.setTag(key, String(value));
        } else {
          scope.setExtra(key, value);
        }
      });
      Sentry.captureException(error);
    });
  } else {
    Sentry.captureException(error);
  }
}
