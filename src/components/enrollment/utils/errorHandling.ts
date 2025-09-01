// Error handling utilities for the enrollment system

export type ErrorCategory = 'network' | 'payment' | 'auth' | 'validation' | 'system';

export interface EnrollmentError {
  category: ErrorCategory;
  code: string;
  message: string;
  userMessage: string;
  retryable: boolean;
  context?: Record<string, any>;
  timestamp: Date;
}

export interface ErrorLogEntry {
  id: string;
  error: EnrollmentError;
  step: string;
  userId?: string;
  sessionId: string;
  userAgent: string;
  url: string;
}

// Error codes and their mappings
export const ERROR_CODES = {
  // Network errors
  NETWORK_TIMEOUT: 'NETWORK_TIMEOUT',
  NETWORK_UNAVAILABLE: 'NETWORK_UNAVAILABLE',
  API_ERROR: 'API_ERROR',
  CONNECTION_FAILED: 'CONNECTION_FAILED',

  // Authentication errors
  INVALID_PHONE: 'INVALID_PHONE',
  OTP_INVALID: 'OTP_INVALID',
  OTP_EXPIRED: 'OTP_EXPIRED',
  OTP_ATTEMPTS_EXCEEDED: 'OTP_ATTEMPTS_EXCEEDED',
  PHONE_LOCKED: 'PHONE_LOCKED',
  AUTH_SERVICE_ERROR: 'AUTH_SERVICE_ERROR',

  // Payment errors
  PAYMENT_FAILED: 'PAYMENT_FAILED',
  PAYMENT_CANCELLED: 'PAYMENT_CANCELLED',
  PAYMENT_TIMEOUT: 'PAYMENT_TIMEOUT',
  INVALID_PAYMENT_DATA: 'INVALID_PAYMENT_DATA',
  PAYMENT_SERVICE_ERROR: 'PAYMENT_SERVICE_ERROR',
  INSUFFICIENT_FUNDS: 'INSUFFICIENT_FUNDS',
  CARD_DECLINED: 'CARD_DECLINED',

  // Validation errors
  REQUIRED_FIELD: 'REQUIRED_FIELD',
  INVALID_FORMAT: 'INVALID_FORMAT',
  INVALID_PLAN: 'INVALID_PLAN',
  INVALID_AMOUNT: 'INVALID_AMOUNT',

  // System errors
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  SECONDARY_PLATFORM_ERROR: 'SECONDARY_PLATFORM_ERROR',
  DATA_CORRUPTION: 'DATA_CORRUPTION',
} as const;

// User-friendly error messages
export const ERROR_MESSAGES: Record<string, string> = {
  // Network errors
  [ERROR_CODES.NETWORK_TIMEOUT]: 'Request timed out. Please check your connection and try again.',
  [ERROR_CODES.NETWORK_UNAVAILABLE]: 'Unable to connect to our servers. Please check your internet connection.',
  [ERROR_CODES.API_ERROR]: 'Something went wrong on our end. Please try again in a moment.',
  [ERROR_CODES.CONNECTION_FAILED]: 'Connection failed. Please check your internet connection and try again.',

  // Authentication errors
  [ERROR_CODES.INVALID_PHONE]: 'Please enter a valid phone number.',
  [ERROR_CODES.OTP_INVALID]: 'The verification code you entered is incorrect. Please try again.',
  [ERROR_CODES.OTP_EXPIRED]: 'The verification code has expired. Please request a new one.',
  [ERROR_CODES.OTP_ATTEMPTS_EXCEEDED]: 'Too many incorrect attempts. Please wait before trying again.',
  [ERROR_CODES.PHONE_LOCKED]: 'This phone number is temporarily locked. Please try again later.',
  [ERROR_CODES.AUTH_SERVICE_ERROR]: 'Authentication service is temporarily unavailable. Please try again.',

  // Payment errors
  [ERROR_CODES.PAYMENT_FAILED]: 'Payment failed. Please try again or use a different payment method.',
  [ERROR_CODES.PAYMENT_CANCELLED]: 'Payment was cancelled. You can try again when ready.',
  [ERROR_CODES.PAYMENT_TIMEOUT]: 'Payment timed out. Please try again.',
  [ERROR_CODES.INVALID_PAYMENT_DATA]: 'Invalid payment information. Please check your details.',
  [ERROR_CODES.PAYMENT_SERVICE_ERROR]: 'Payment service is temporarily unavailable. Please try again.',
  [ERROR_CODES.INSUFFICIENT_FUNDS]: 'Insufficient funds. Please try a different payment method.',
  [ERROR_CODES.CARD_DECLINED]: 'Your card was declined. Please try a different payment method.',

  // Validation errors
  [ERROR_CODES.REQUIRED_FIELD]: 'This field is required.',
  [ERROR_CODES.INVALID_FORMAT]: 'Please enter a valid format.',
  [ERROR_CODES.INVALID_PLAN]: 'Please select a valid pricing plan.',
  [ERROR_CODES.INVALID_AMOUNT]: 'Invalid amount. Please try again.',

  // System errors
  [ERROR_CODES.UNKNOWN_ERROR]: 'An unexpected error occurred. Please try again.',
  [ERROR_CODES.SERVICE_UNAVAILABLE]: 'Service is temporarily unavailable. Please try again later.',
  [ERROR_CODES.SECONDARY_PLATFORM_ERROR]: 'Unable to complete registration. Your enrollment is saved and we will contact you.',
  [ERROR_CODES.DATA_CORRUPTION]: 'Data error occurred. Please start the enrollment process again.',
};

// Error categorization mapping
export const ERROR_CATEGORIES: Record<string, ErrorCategory> = {
  // Network errors
  [ERROR_CODES.NETWORK_TIMEOUT]: 'network',
  [ERROR_CODES.NETWORK_UNAVAILABLE]: 'network',
  [ERROR_CODES.API_ERROR]: 'network',
  [ERROR_CODES.CONNECTION_FAILED]: 'network',

  // Authentication errors
  [ERROR_CODES.INVALID_PHONE]: 'auth',
  [ERROR_CODES.OTP_INVALID]: 'auth',
  [ERROR_CODES.OTP_EXPIRED]: 'auth',
  [ERROR_CODES.OTP_ATTEMPTS_EXCEEDED]: 'auth',
  [ERROR_CODES.PHONE_LOCKED]: 'auth',
  [ERROR_CODES.AUTH_SERVICE_ERROR]: 'auth',

  // Payment errors
  [ERROR_CODES.PAYMENT_FAILED]: 'payment',
  [ERROR_CODES.PAYMENT_CANCELLED]: 'payment',
  [ERROR_CODES.PAYMENT_TIMEOUT]: 'payment',
  [ERROR_CODES.INVALID_PAYMENT_DATA]: 'payment',
  [ERROR_CODES.PAYMENT_SERVICE_ERROR]: 'payment',
  [ERROR_CODES.INSUFFICIENT_FUNDS]: 'payment',
  [ERROR_CODES.CARD_DECLINED]: 'payment',

  // Validation errors
  [ERROR_CODES.REQUIRED_FIELD]: 'validation',
  [ERROR_CODES.INVALID_FORMAT]: 'validation',
  [ERROR_CODES.INVALID_PLAN]: 'validation',
  [ERROR_CODES.INVALID_AMOUNT]: 'validation',

  // System errors
  [ERROR_CODES.UNKNOWN_ERROR]: 'system',
  [ERROR_CODES.SERVICE_UNAVAILABLE]: 'system',
  [ERROR_CODES.SECONDARY_PLATFORM_ERROR]: 'system',
  [ERROR_CODES.DATA_CORRUPTION]: 'system',
};

// Retryable error mapping
export const RETRYABLE_ERRORS = new Set([
  ERROR_CODES.NETWORK_TIMEOUT,
  ERROR_CODES.NETWORK_UNAVAILABLE,
  ERROR_CODES.API_ERROR,
  ERROR_CODES.CONNECTION_FAILED,
  ERROR_CODES.PAYMENT_TIMEOUT,
  ERROR_CODES.PAYMENT_SERVICE_ERROR,
  ERROR_CODES.AUTH_SERVICE_ERROR,
  ERROR_CODES.SERVICE_UNAVAILABLE,
  ERROR_CODES.SECONDARY_PLATFORM_ERROR,
]);

/**
 * Creates a standardized error object
 */
export function createError(
  code: string,
  context?: Record<string, any>,
  customMessage?: string
): EnrollmentError {
  const category = ERROR_CATEGORIES[code] || 'system';
  const userMessage = customMessage || ERROR_MESSAGES[code] || ERROR_MESSAGES[ERROR_CODES.UNKNOWN_ERROR];
  const retryable = RETRYABLE_ERRORS.has(code);

  return {
    category,
    code,
    message: code,
    userMessage,
    retryable,
    context,
    timestamp: new Date(),
  };
}

/**
 * Categorizes an unknown error based on its properties
 */
export function categorizeError(error: any): EnrollmentError {
  // Network errors
  if (error.name === 'NetworkError' || error.code === 'NETWORK_ERROR') {
    return createError(ERROR_CODES.NETWORK_UNAVAILABLE, { originalError: error.message });
  }

  if (error.name === 'TimeoutError' || error.code === 'TIMEOUT') {
    return createError(ERROR_CODES.NETWORK_TIMEOUT, { originalError: error.message });
  }

  // Firebase auth errors
  if (error.code?.startsWith('auth/')) {
    switch (error.code) {
      case 'auth/invalid-phone-number':
        return createError(ERROR_CODES.INVALID_PHONE, { firebaseCode: error.code });
      case 'auth/invalid-verification-code':
        return createError(ERROR_CODES.OTP_INVALID, { firebaseCode: error.code });
      case 'auth/code-expired':
        return createError(ERROR_CODES.OTP_EXPIRED, { firebaseCode: error.code });
      case 'auth/too-many-requests':
        return createError(ERROR_CODES.OTP_ATTEMPTS_EXCEEDED, { firebaseCode: error.code });
      default:
        return createError(ERROR_CODES.AUTH_SERVICE_ERROR, { firebaseCode: error.code });
    }
  }

  // Razorpay errors
  if (error.source === 'razorpay') {
    switch (error.step) {
      case 'payment_failed':
        return createError(ERROR_CODES.PAYMENT_FAILED, { razorpayError: error });
      case 'payment_cancelled':
        return createError(ERROR_CODES.PAYMENT_CANCELLED, { razorpayError: error });
      default:
        return createError(ERROR_CODES.PAYMENT_SERVICE_ERROR, { razorpayError: error });
    }
  }

  // HTTP errors
  if (error.status) {
    if (error.status >= 400 && error.status < 500) {
      return createError(ERROR_CODES.INVALID_PAYMENT_DATA, { httpStatus: error.status });
    }
    if (error.status >= 500) {
      return createError(ERROR_CODES.SERVICE_UNAVAILABLE, { httpStatus: error.status });
    }
  }

  // Default to unknown error
  return createError(ERROR_CODES.UNKNOWN_ERROR, { originalError: error.message || String(error) });
}

/**
 * Error logging service
 */
class ErrorLogger {
  private logs: ErrorLogEntry[] = [];
  private sessionId: string;

  constructor() {
    this.sessionId = this.generateSessionId();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Logs an error with context information
   */
  log(error: EnrollmentError, step: string, userId?: string): void {
    const logEntry: ErrorLogEntry = {
      id: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      error,
      step,
      userId,
      sessionId: this.sessionId,
      userAgent: navigator.userAgent,
      url: window.location.href,
    };

    this.logs.push(logEntry);

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Enrollment Error:', logEntry);
    }

    // In production, you would send this to your logging service
    this.sendToLoggingService(logEntry);
  }

  /**
   * Gets all logs for the current session
   */
  getLogs(): ErrorLogEntry[] {
    return [...this.logs];
  }

  /**
   * Gets logs filtered by category
   */
  getLogsByCategory(category: ErrorCategory): ErrorLogEntry[] {
    return this.logs.filter(log => log.error.category === category);
  }

  /**
   * Clears all logs
   */
  clearLogs(): void {
    this.logs = [];
  }

  /**
   * Sends error log to external logging service
   */
  private async sendToLoggingService(logEntry: ErrorLogEntry): Promise<void> {
    try {
      // In a real implementation, you would send to your logging service
      // For now, we'll just store in localStorage for debugging
      const existingLogs = localStorage.getItem('enrollment_error_logs');
      const logs = existingLogs ? JSON.parse(existingLogs) : [];
      logs.push(logEntry);
      
      // Keep only last 100 logs to prevent storage overflow
      if (logs.length > 100) {
        logs.splice(0, logs.length - 100);
      }
      
      localStorage.setItem('enrollment_error_logs', JSON.stringify(logs));
    } catch (error) {
      console.warn('Failed to log error:', error);
    }
  }
}

// Singleton error logger instance
export const errorLogger = new ErrorLogger();

/**
 * Utility function to handle and log errors
 */
export function handleError(
  error: any,
  step: string,
  userId?: string,
  customMessage?: string
): EnrollmentError {
  const enrollmentError = error instanceof Error && 'category' in error 
    ? error as EnrollmentError
    : categorizeError(error);

  if (customMessage) {
    enrollmentError.userMessage = customMessage;
  }

  errorLogger.log(enrollmentError, step, userId);
  return enrollmentError;
}

/**
 * Utility function to check if an error is retryable
 */
export function isRetryableError(error: EnrollmentError): boolean {
  return error.retryable;
}

/**
 * Utility function to get retry delay based on attempt count
 */
export function getRetryDelay(attemptCount: number): number {
  // Exponential backoff: 1s, 2s, 4s, 8s, max 30s
  return Math.min(1000 * Math.pow(2, attemptCount - 1), 30000);
}

/**
 * Utility function to format error for display
 */
export function formatErrorForDisplay(error: EnrollmentError): {
  title: string;
  message: string;
  canRetry: boolean;
} {
  const titles: Record<ErrorCategory, string> = {
    network: 'Connection Error',
    payment: 'Payment Error',
    auth: 'Authentication Error',
    validation: 'Validation Error',
    system: 'System Error',
  };

  return {
    title: titles[error.category],
    message: error.userMessage,
    canRetry: error.retryable,
  };
}