// Razorpay configuration utility
export interface RazorpayEnvironmentConfig {
  keyId: string;
  currency: string;
  theme: {
    color: string;
  };
}

// Get Razorpay configuration from environment variables
export const getRazorpayConfig = (): RazorpayEnvironmentConfig => {
  const keyId = import.meta.env.VITE_RAZORPAY_KEY_ID;
  
  if (!keyId) {
    console.error('Razorpay Key ID not found in environment variables');
    console.error('Available env vars:', Object.keys(import.meta.env));
    throw new Error('Razorpay Key ID not found in environment variables. Please check your .env.local file.');
  }

  if (!keyId.startsWith('rzp_')) {
    console.error('Invalid Razorpay Key ID format:', keyId);
    throw new Error('Invalid Razorpay Key ID format. It should start with "rzp_".');
  }

  console.log('Razorpay config loaded successfully with key:', keyId.substring(0, 10) + '...');

  return {
    keyId,
    currency: 'INR',
    theme: {
      color: '#86D5F0', // Playgram brand color
    },
  };
};

// Validate Razorpay configuration
export const validateRazorpayConfig = (): boolean => {
  try {
    const config = getRazorpayConfig();
    return !!(config.keyId && config.currency);
  } catch (error) {
    console.error('Razorpay configuration validation failed:', error);
    return false;
  }
};

// Format amount for Razorpay (convert rupees to paise)
export const formatAmountForRazorpay = (amountInRupees: number): number => {
  return Math.round(amountInRupees * 100);
};

// Format amount for display (convert paise to rupees)
export const formatAmountForDisplay = (amountInPaise: number): number => {
  return amountInPaise / 100;
};

// Format currency for display
export const formatCurrency = (amount: number, currency: string = 'INR'): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
  }).format(amount);
};

// Razorpay error codes and their user-friendly messages
export const RAZORPAY_ERROR_MESSAGES: Record<string, string> = {
  'BAD_REQUEST_ERROR': 'Invalid payment request. Please contact support.',
  'GATEWAY_ERROR': 'Payment gateway error. Please try again.',
  'NETWORK_ERROR': 'Network error. Please check your connection and try again.',
  'SERVER_ERROR': 'Server error. Please try again later.',
  'VALIDATION_ERROR': 'Payment validation failed. Please check your details.',
  'AUTHENTICATION_ERROR': 'Payment authentication failed. Please try again.',
};

// Get user-friendly error message
export const getRazorpayErrorMessage = (errorCode: string, defaultMessage?: string): string => {
  return RAZORPAY_ERROR_MESSAGES[errorCode] || defaultMessage || 'Payment failed. Please try again.';
};

// Razorpay payment status mapping
export const RAZORPAY_STATUS_MAPPING = {
  'created': 'Payment order created',
  'attempted': 'Payment attempted',
  'paid': 'Payment successful',
  'failed': 'Payment failed',
  'cancelled': 'Payment cancelled',
  'refunded': 'Payment refunded',
} as const;

// Get status message
export const getPaymentStatusMessage = (status: string): string => {
  return RAZORPAY_STATUS_MAPPING[status as keyof typeof RAZORPAY_STATUS_MAPPING] || 'Unknown status';
};

// Validate payment amount
export const validatePaymentAmount = (amount: number): boolean => {
  // Minimum amount is ₹1 (100 paise)
  // Maximum amount is ₹15,00,000 (15 lakh rupees)
  return amount >= 1 && amount <= 1500000;
};

// Generate unique receipt ID
export const generateReceiptId = (prefix: string = 'enrollment'): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substr(2, 9);
  return `${prefix}_${timestamp}_${random}`;
};

// Sanitize payment data for logging (remove sensitive information)
export const sanitizePaymentData = (data: any): any => {
  const sensitiveFields = ['razorpay_signature', 'key_secret', 'password'];
  
  if (typeof data !== 'object' || data === null) {
    return data;
  }

  const sanitized = { ...data };
  
  for (const field of sensitiveFields) {
    if (sanitized[field]) {
      sanitized[field] = '[REDACTED]';
    }
  }

  return sanitized;
};

export default {
  getRazorpayConfig,
  validateRazorpayConfig,
  formatAmountForRazorpay,
  formatAmountForDisplay,
  formatCurrency,
  getRazorpayErrorMessage,
  getPaymentStatusMessage,
  validatePaymentAmount,
  generateReceiptId,
  sanitizePaymentData,
};