import * as Sentry from '@sentry/nextjs';

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

/**
 * Create a span for UI interactions
 */
export function createUISpan<T>(
    operation: string,
    name: string,
    attributes: Record<string, string | number | boolean> = {},
    callback: () => T,
): T {
    return Sentry.startSpan(
        {
            op: operation,
            name,
        },
        (span) => {
            // Add attributes to the span
            Object.entries(attributes).forEach(([key, value]) => {
                span.setAttribute(key, value);
            });
            return callback();
        },
    );
}

/**
 * Create a span for API calls
 */
export async function createAPISpan<T>(
    endpoint: string,
    method: string = 'GET',
    attributes: Record<string, string | number | boolean> = {},
    callback: () => Promise<T>,
): Promise<T> {
    return Sentry.startSpan(
        {
            op: 'http.client',
            name: `${method} ${endpoint}`,
        },
        async (span) => {
            // Add attributes to the span
            Object.entries(attributes).forEach(([key, value]) => {
                span.setAttribute(key, value);
            });
            try {
                return await callback();
            } catch (error) {
                span.setStatus({ code: 2, message: 'Error' });
                throw error;
            }
        },
    );
}
