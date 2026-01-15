import React from 'react';

export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface ErrorContext {
  component?: string;
  action?: string;
  userId?: string;
  metadata?: Record<string, unknown>;
}

export interface LoggedError {
  error: Error;
  severity: ErrorSeverity;
  context: ErrorContext;
  timestamp: Date;
  errorInfo?: React.ErrorInfo;
}

// In-memory error log for development debugging
const errorLog: LoggedError[] = [];
const MAX_ERROR_LOG_SIZE = 100;

/**
 * Centralized error logging utility.
 * In production, this would integrate with error tracking services like Sentry.
 */
export function logError(
  error: Error,
  errorInfo?: React.ErrorInfo,
  context: ErrorContext = {},
  severity: ErrorSeverity = 'medium'
): void {
  const loggedError: LoggedError = {
    error,
    severity,
    context,
    timestamp: new Date(),
    errorInfo,
  };

  // Add to in-memory log (circular buffer)
  errorLog.push(loggedError);
  if (errorLog.length > MAX_ERROR_LOG_SIZE) {
    errorLog.shift();
  }

  // Console logging in development
  if (__DEV__) {
    const severityEmoji = {
      low: 'ℹ️',
      medium: '⚠️',
      high: '🔴',
      critical: '💥',
    };

    console.group(`${severityEmoji[severity]} Error [${severity.toUpperCase()}]`);
    console.error('Error:', error.message);
    console.log('Context:', context);
    if (errorInfo?.componentStack) {
      console.log('Component Stack:', errorInfo.componentStack);
    }
    console.log('Full error:', error);
    console.groupEnd();
  }

  // TODO: In production, send to error tracking service
  // Example: Sentry.captureException(error, { extra: context, level: severity });
}

/**
 * Log an API error with additional request context.
 */
export function logApiError(
  error: Error,
  endpoint: string,
  method: string,
  statusCode?: number
): void {
  logError(error, undefined, {
    component: 'API',
    action: `${method} ${endpoint}`,
    metadata: { statusCode },
  }, statusCode && statusCode >= 500 ? 'high' : 'medium');
}

/**
 * Log a form validation error.
 */
export function logValidationError(
  error: Error,
  formName: string,
  fieldName?: string
): void {
  logError(error, undefined, {
    component: 'Form',
    action: `Validation in ${formName}`,
    metadata: { fieldName },
  }, 'low');
}

/**
 * Log a navigation error.
 */
export function logNavigationError(
  error: Error,
  from: string,
  to: string
): void {
  logError(error, undefined, {
    component: 'Navigation',
    action: `${from} -> ${to}`,
  }, 'medium');
}

/**
 * Get recent errors (useful for debugging).
 * Only available in development.
 */
export function getRecentErrors(): LoggedError[] {
  if (!__DEV__) {
    return [];
  }
  return [...errorLog];
}

/**
 * Clear the error log.
 * Only available in development.
 */
export function clearErrorLog(): void {
  if (__DEV__) {
    errorLog.length = 0;
  }
}

/**
 * Create an error handler callback for use with ErrorBoundary.
 */
export function createErrorBoundaryHandler(
  componentName: string
): (error: Error, errorInfo: React.ErrorInfo) => void {
  return (error: Error, errorInfo: React.ErrorInfo) => {
    logError(error, errorInfo, {
      component: componentName,
      action: 'render',
    }, 'high');
  };
}

/**
 * Wrap an async function with error handling.
 */
export async function withErrorHandling<T>(
  fn: () => Promise<T>,
  context: ErrorContext,
  fallback?: T
): Promise<T | undefined> {
  try {
    return await fn();
  } catch (error) {
    logError(error instanceof Error ? error : new Error(String(error)), undefined, context);
    return fallback;
  }
}

/**
 * Type guard to check if an unknown value is an Error.
 */
export function isError(value: unknown): value is Error {
  return value instanceof Error;
}

/**
 * Extract a meaningful error message from an unknown error.
 */
export function getErrorMessage(error: unknown): string {
  if (isError(error)) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  if (typeof error === 'object' && error !== null && 'message' in error) {
    return String((error as { message: unknown }).message);
  }
  return 'An unexpected error occurred';
}
