import {
  logError,
  logApiError,
  logValidationError,
  logNavigationError,
  getRecentErrors,
  clearErrorLog,
  createErrorBoundaryHandler,
  withErrorHandling,
  isError,
  getErrorMessage,
} from '../lib/errorHandler';

// Save original console methods
const originalConsole = { ...console };

describe('Error Handler Utility', () => {
  beforeEach(() => {
    // Reset error log before each test
    clearErrorLog();
    // Reset console mocks
    global.console = {
      ...originalConsole,
      group: jest.fn(),
      groupEnd: jest.fn(),
      error: jest.fn(),
      log: jest.fn(),
    };
  });

  afterAll(() => {
    global.console = originalConsole;
  });

  describe('logError', () => {
    it('should log an error to the in-memory log', () => {
      const error = new Error('Test error');
      logError(error);

      const errors = getRecentErrors();
      expect(errors).toHaveLength(1);
      expect(errors[0].error.message).toBe('Test error');
      expect(errors[0].severity).toBe('medium'); // default severity
    });

    it('should log error with custom severity', () => {
      const error = new Error('Critical error');
      logError(error, undefined, {}, 'critical');

      const errors = getRecentErrors();
      expect(errors[0].severity).toBe('critical');
    });

    it('should log error with context', () => {
      const error = new Error('Context error');
      logError(error, undefined, {
        component: 'TestComponent',
        action: 'testAction',
      });

      const errors = getRecentErrors();
      expect(errors[0].context.component).toBe('TestComponent');
      expect(errors[0].context.action).toBe('testAction');
    });

    it('should include errorInfo when provided', () => {
      const error = new Error('React error');
      const errorInfo = { componentStack: 'at TestComponent' };
      logError(error, errorInfo as React.ErrorInfo);

      const errors = getRecentErrors();
      expect(errors[0].errorInfo?.componentStack).toBe('at TestComponent');
    });

    it('should maintain a circular buffer of max 100 errors', () => {
      for (let i = 0; i < 150; i++) {
        logError(new Error(`Error ${i}`));
      }

      const errors = getRecentErrors();
      expect(errors).toHaveLength(100);
      // First error should be error 50 (errors 0-49 were pushed out)
      expect(errors[0].error.message).toBe('Error 50');
    });
  });

  describe('logApiError', () => {
    it('should log API error with endpoint and method', () => {
      const error = new Error('API failed');
      logApiError(error, '/api/users', 'GET', 500);

      const errors = getRecentErrors();
      expect(errors[0].context.component).toBe('API');
      expect(errors[0].context.action).toBe('GET /api/users');
      expect(errors[0].context.metadata?.statusCode).toBe(500);
    });

    it('should use high severity for 5xx errors', () => {
      const error = new Error('Server error');
      logApiError(error, '/api/data', 'POST', 503);

      const errors = getRecentErrors();
      expect(errors[0].severity).toBe('high');
    });

    it('should use medium severity for 4xx errors', () => {
      const error = new Error('Not found');
      logApiError(error, '/api/resource', 'GET', 404);

      const errors = getRecentErrors();
      expect(errors[0].severity).toBe('medium');
    });
  });

  describe('logValidationError', () => {
    it('should log validation error with form context', () => {
      const error = new Error('Validation failed');
      logValidationError(error, 'LoginForm', 'email');

      const errors = getRecentErrors();
      expect(errors[0].context.component).toBe('Form');
      expect(errors[0].context.action).toBe('Validation in LoginForm');
      expect(errors[0].context.metadata?.fieldName).toBe('email');
      expect(errors[0].severity).toBe('low');
    });
  });

  describe('logNavigationError', () => {
    it('should log navigation error with route info', () => {
      const error = new Error('Navigation failed');
      logNavigationError(error, '/home', '/profile');

      const errors = getRecentErrors();
      expect(errors[0].context.component).toBe('Navigation');
      expect(errors[0].context.action).toBe('/home -> /profile');
      expect(errors[0].severity).toBe('medium');
    });
  });

  describe('clearErrorLog', () => {
    it('should clear all logged errors', () => {
      logError(new Error('Error 1'));
      logError(new Error('Error 2'));
      expect(getRecentErrors()).toHaveLength(2);

      clearErrorLog();
      expect(getRecentErrors()).toHaveLength(0);
    });
  });

  describe('createErrorBoundaryHandler', () => {
    it('should create a handler that logs with component name', () => {
      const handler = createErrorBoundaryHandler('MyComponent');
      const error = new Error('Render error');
      const errorInfo = { componentStack: 'at MyComponent' };

      handler(error, errorInfo as React.ErrorInfo);

      const errors = getRecentErrors();
      expect(errors[0].context.component).toBe('MyComponent');
      expect(errors[0].context.action).toBe('render');
      expect(errors[0].severity).toBe('high');
    });
  });

  describe('withErrorHandling', () => {
    it('should return result on success', async () => {
      const fn = async () => 'success';
      const result = await withErrorHandling(fn, { component: 'Test' });
      expect(result).toBe('success');
    });

    it('should log error and return fallback on failure', async () => {
      const fn = async () => {
        throw new Error('Async error');
      };
      const result = await withErrorHandling(fn, { component: 'Test' }, 'fallback');

      expect(result).toBe('fallback');
      const errors = getRecentErrors();
      expect(errors[0].error.message).toBe('Async error');
    });

    it('should return undefined when no fallback provided', async () => {
      const fn = async () => {
        throw new Error('Async error');
      };
      const result = await withErrorHandling(fn, { component: 'Test' });
      expect(result).toBeUndefined();
    });
  });

  describe('isError', () => {
    it('should return true for Error instances', () => {
      expect(isError(new Error('test'))).toBe(true);
      expect(isError(new TypeError('test'))).toBe(true);
      expect(isError(new SyntaxError('test'))).toBe(true);
    });

    it('should return false for non-Error values', () => {
      expect(isError('error string')).toBe(false);
      expect(isError({ message: 'error object' })).toBe(false);
      expect(isError(null)).toBe(false);
      expect(isError(undefined)).toBe(false);
      expect(isError(123)).toBe(false);
    });
  });

  describe('getErrorMessage', () => {
    it('should extract message from Error', () => {
      expect(getErrorMessage(new Error('Test message'))).toBe('Test message');
    });

    it('should return string errors as-is', () => {
      expect(getErrorMessage('String error')).toBe('String error');
    });

    it('should extract message from object with message property', () => {
      expect(getErrorMessage({ message: 'Object message' })).toBe('Object message');
    });

    it('should return default message for unknown types', () => {
      expect(getErrorMessage(null)).toBe('An unexpected error occurred');
      expect(getErrorMessage(undefined)).toBe('An unexpected error occurred');
      expect(getErrorMessage(123)).toBe('An unexpected error occurred');
      expect(getErrorMessage({})).toBe('An unexpected error occurred');
    });
  });
});
