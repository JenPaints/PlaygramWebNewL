// Tests for error handling utilities

import {
  createError,
  categorizeError,
  handleError,
  isRetryableError,
  getRetryDelay,
  formatErrorForDisplay,
  errorLogger,
  ERROR_CODES,
  ERROR_MESSAGES,
  ERROR_CATEGORIES,
  RETRYABLE_ERRORS,
} from '../errorHandling';

describe('Error Handling Utilities', () => {
  beforeEach(() => {
    errorLogger.clearLogs();
    localStorage.clear();
  });

  describe('createError', () => {
    it('should create a standardized error object', () => {
      const error = createError(ERROR_CODES.INVALID_PHONE, { phoneNumber: '+1234567890' });

      expect(error).toMatchObject({
        category: 'auth',
        code: ERROR_CODES.INVALID_PHONE,
        message: ERROR_CODES.INVALID_PHONE,
        userMessage: ERROR_MESSAGES[ERROR_CODES.INVALID_PHONE],
        retryable: false,
        context: { phoneNumber: '+1234567890' },
      });
      expect(error.timestamp).toBeInstanceOf(Date);
    });

    it('should use custom message when provided', () => {
      const customMessage = 'Custom error message';
      const error = createError(ERROR_CODES.NETWORK_TIMEOUT, {}, customMessage);

      expect(error.userMessage).toBe(customMessage);
    });

    it('should mark retryable errors correctly', () => {
      const retryableError = createError(ERROR_CODES.NETWORK_TIMEOUT);
      const nonRetryableError = createError(ERROR_CODES.INVALID_PHONE);

      expect(retryableError.retryable).toBe(true);
      expect(nonRetryableError.retryable).toBe(false);
    });
  });

  describe('categorizeError', () => {
    it('should categorize network errors', () => {
      const networkError = { name: 'NetworkError', message: 'Network failed' };
      const error = categorizeError(networkError);

      expect(error.category).toBe('network');
      expect(error.code).toBe(ERROR_CODES.NETWORK_UNAVAILABLE);
    });

    it('should categorize timeout errors', () => {
      const timeoutError = { name: 'TimeoutError', message: 'Request timed out' };
      const error = categorizeError(timeoutError);

      expect(error.category).toBe('network');
      expect(error.code).toBe(ERROR_CODES.NETWORK_TIMEOUT);
    });

    it('should categorize Firebase auth errors', () => {
      const firebaseError = { code: 'auth/invalid-phone-number', message: 'Invalid phone' };
      const error = categorizeError(firebaseError);

      expect(error.category).toBe('auth');
      expect(error.code).toBe(ERROR_CODES.INVALID_PHONE);
    });

    it('should categorize Razorpay errors', () => {
      const razorpayError = { source: 'razorpay', step: 'payment_failed', message: 'Payment failed' };
      const error = categorizeError(razorpayError);

      expect(error.category).toBe('payment');
      expect(error.code).toBe(ERROR_CODES.PAYMENT_FAILED);
    });

    it('should categorize HTTP errors', () => {
      const httpError = { status: 500, message: 'Internal server error' };
      const error = categorizeError(httpError);

      expect(error.category).toBe('system');
      expect(error.code).toBe(ERROR_CODES.SERVICE_UNAVAILABLE);
    });

    it('should default to unknown error for unrecognized errors', () => {
      const unknownError = { message: 'Something went wrong' };
      const error = categorizeError(unknownError);

      expect(error.category).toBe('system');
      expect(error.code).toBe(ERROR_CODES.UNKNOWN_ERROR);
    });
  });

  describe('handleError', () => {
    it('should handle and log errors', () => {
      const originalError = new Error('Test error');
      const step = 'test-step';
      const userId = 'user123';

      const error = handleError(originalError, step, userId);

      expect(error.category).toBe('system');
      expect(error.code).toBe(ERROR_CODES.UNKNOWN_ERROR);

      const logs = errorLogger.getLogs();
      expect(logs).toHaveLength(1);
      expect(logs[0].step).toBe(step);
      expect(logs[0].userId).toBe(userId);
    });

    it('should use custom message when provided', () => {
      const originalError = new Error('Test error');
      const customMessage = 'Custom error message';

      const error = handleError(originalError, 'test-step', undefined, customMessage);

      expect(error.userMessage).toBe(customMessage);
    });
  });

  describe('isRetryableError', () => {
    it('should correctly identify retryable errors', () => {
      const retryableError = createError(ERROR_CODES.NETWORK_TIMEOUT);
      const nonRetryableError = createError(ERROR_CODES.INVALID_PHONE);

      expect(isRetryableError(retryableError)).toBe(true);
      expect(isRetryableError(nonRetryableError)).toBe(false);
    });
  });

  describe('getRetryDelay', () => {
    it('should calculate exponential backoff delays', () => {
      expect(getRetryDelay(1)).toBe(1000);
      expect(getRetryDelay(2)).toBe(2000);
      expect(getRetryDelay(3)).toBe(4000);
      expect(getRetryDelay(4)).toBe(8000);
    });

    it('should cap delay at 30 seconds', () => {
      expect(getRetryDelay(10)).toBe(30000);
    });
  });

  describe('formatErrorForDisplay', () => {
    it('should format error for display', () => {
      const error = createError(ERROR_CODES.NETWORK_TIMEOUT);
      const formatted = formatErrorForDisplay(error);

      expect(formatted).toEqual({
        title: 'Connection Error',
        message: ERROR_MESSAGES[ERROR_CODES.NETWORK_TIMEOUT],
        canRetry: true,
      });
    });

    it('should format different error categories correctly', () => {
      const authError = createError(ERROR_CODES.INVALID_PHONE);
      const paymentError = createError(ERROR_CODES.PAYMENT_FAILED);

      expect(formatErrorForDisplay(authError).title).toBe('Authentication Error');
      expect(formatErrorForDisplay(paymentError).title).toBe('Payment Error');
    });
  });

  describe('ErrorLogger', () => {
    it('should log errors with context', () => {
      const error = createError(ERROR_CODES.NETWORK_TIMEOUT);
      errorLogger.log(error, 'test-step', 'user123');

      const logs = errorLogger.getLogs();
      expect(logs).toHaveLength(1);
      expect(logs[0].error).toEqual(error);
      expect(logs[0].step).toBe('test-step');
      expect(logs[0].userId).toBe('user123');
    });

    it('should filter logs by category', () => {
      const networkError = createError(ERROR_CODES.NETWORK_TIMEOUT);
      const authError = createError(ERROR_CODES.INVALID_PHONE);

      errorLogger.log(networkError, 'step1');
      errorLogger.log(authError, 'step2');

      const networkLogs = errorLogger.getLogsByCategory('network');
      const authLogs = errorLogger.getLogsByCategory('auth');

      expect(networkLogs).toHaveLength(1);
      expect(authLogs).toHaveLength(1);
      expect(networkLogs[0].error.category).toBe('network');
      expect(authLogs[0].error.category).toBe('auth');
    });

    it('should clear logs', () => {
      const error = createError(ERROR_CODES.NETWORK_TIMEOUT);
      errorLogger.log(error, 'test-step');

      expect(errorLogger.getLogs()).toHaveLength(1);

      errorLogger.clearLogs();
      expect(errorLogger.getLogs()).toHaveLength(0);
    });

    it('should store logs in localStorage', () => {
      const error = createError(ERROR_CODES.NETWORK_TIMEOUT);
      errorLogger.log(error, 'test-step');

      const storedLogs = localStorage.getItem('enrollment_error_logs');
      expect(storedLogs).toBeTruthy();

      const parsedLogs = JSON.parse(storedLogs!);
      expect(parsedLogs).toHaveLength(1);
      expect(parsedLogs[0].error.code).toBe(ERROR_CODES.NETWORK_TIMEOUT);
    });
  });

  describe('Error constants', () => {
    it('should have all error codes defined', () => {
      expect(ERROR_CODES.NETWORK_TIMEOUT).toBeDefined();
      expect(ERROR_CODES.INVALID_PHONE).toBeDefined();
      expect(ERROR_CODES.PAYMENT_FAILED).toBeDefined();
      expect(ERROR_CODES.UNKNOWN_ERROR).toBeDefined();
    });

    it('should have messages for all error codes', () => {
      Object.values(ERROR_CODES).forEach(code => {
        expect(ERROR_MESSAGES[code]).toBeDefined();
        expect(typeof ERROR_MESSAGES[code]).toBe('string');
      });
    });

    it('should have categories for all error codes', () => {
      Object.values(ERROR_CODES).forEach(code => {
        expect(ERROR_CATEGORIES[code]).toBeDefined();
        expect(['network', 'payment', 'auth', 'validation', 'system']).toContain(ERROR_CATEGORIES[code]);
      });
    });

    it('should have consistent retryable error mapping', () => {
      RETRYABLE_ERRORS.forEach(code => {
        expect(ERROR_CODES).toHaveProperty(code);
      });
    });
  });
});