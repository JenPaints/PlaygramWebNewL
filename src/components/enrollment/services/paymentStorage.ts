import { PaymentRecord, PaymentOrder, EnrollmentData } from '../types';

// Storage keys for payment data
const STORAGE_KEYS = {
  PAYMENT_SESSION: 'enrollment_payment_session',
  PAYMENT_HISTORY: 'enrollment_payment_history',
  ENROLLMENT_DATA: 'enrollment_data',
  PAYMENT_STATUS: 'payment_status',
} as const;

// Payment session data interface
export interface PaymentSession {
  orderId: string;
  amount: number;
  currency: string;
  planId: string;
  userPhone: string;
  sport: string;
  timestamp: number;
  expiresAt: number;
  attempts: number;
  status: 'created' | 'processing' | 'success' | 'failed' | 'expired';
}

// Payment history entry interface
export interface PaymentHistoryEntry {
  id: string;
  orderId: string;
  paymentId?: string;
  amount: number;
  status: 'created' | 'processing' | 'success' | 'failed';
  timestamp: number;
  error?: string;
}

/**
 * Encrypts sensitive data before storage (basic implementation)
 * In production, use proper encryption libraries
 * @param data - Data to encrypt
 * @returns Encrypted string
 */
const encryptData = (data: string): string => {
  try {
    // Basic encoding - in production, use proper encryption
    return btoa(encodeURIComponent(data));
  } catch (error) {
    console.error('Error encrypting data:', error);
    return data;
  }
};

/**
 * Decrypts sensitive data from storage
 * @param encryptedData - Encrypted data string
 * @returns Decrypted string
 */
const decryptData = (encryptedData: string): string => {
  try {
    // Basic decoding - in production, use proper decryption
    return decodeURIComponent(atob(encryptedData));
  } catch (error) {
    console.error('Error decrypting data:', error);
    return encryptedData;
  }
};

/**
 * Stores payment session data securely
 * @param sessionData - Payment session data
 */
export const storePaymentSession = (sessionData: PaymentSession): void => {
  try {
    const encryptedData = encryptData(JSON.stringify(sessionData));
    sessionStorage.setItem(STORAGE_KEYS.PAYMENT_SESSION, encryptedData);
  } catch (error) {
    console.error('Error storing payment session:', error);
  }
};

/**
 * Retrieves payment session data
 * @returns PaymentSession or null
 */
export const getPaymentSession = (): PaymentSession | null => {
  try {
    const encryptedData = sessionStorage.getItem(STORAGE_KEYS.PAYMENT_SESSION);
    if (!encryptedData) return null;

    const decryptedData = decryptData(encryptedData);
    const sessionData: PaymentSession = JSON.parse(decryptedData);

    // Check if session has expired
    if (Date.now() > sessionData.expiresAt) {
      clearPaymentSession();
      return null;
    }

    return sessionData;
  } catch (error) {
    console.error('Error retrieving payment session:', error);
    return null;
  }
};

/**
 * Updates payment session status
 * @param status - New status
 * @param error - Optional error message
 */
export const updatePaymentSessionStatus = (
  status: PaymentSession['status'],
  error?: string
): void => {
  try {
    const session = getPaymentSession();
    if (!session) return;

    const updatedSession: PaymentSession = {
      ...session,
      status,
      timestamp: Date.now(),
    };

    storePaymentSession(updatedSession);

    // Also add to payment history
    addPaymentHistoryEntry({
      id: `history_${Date.now()}`,
      orderId: session.orderId,
      amount: session.amount,
      status: status === 'success' ? 'success' : status === 'failed' ? 'failed' : 'processing',
      timestamp: Date.now(),
      error,
    });
  } catch (error) {
    console.error('Error updating payment session status:', error);
  }
};

/**
 * Clears payment session data
 */
export const clearPaymentSession = (): void => {
  try {
    sessionStorage.removeItem(STORAGE_KEYS.PAYMENT_SESSION);
  } catch (error) {
    console.error('Error clearing payment session:', error);
  }
};

/**
 * Stores payment record securely
 * @param paymentRecord - Payment record to store
 */
export const storePaymentRecord = (paymentRecord: PaymentRecord): void => {
  try {
    // Store in session storage for current session
    const encryptedData = encryptData(JSON.stringify(paymentRecord));
    sessionStorage.setItem(`payment_record_${paymentRecord.id}`, encryptedData);

    // Add to payment history
    addPaymentHistoryEntry({
      id: paymentRecord.id,
      orderId: paymentRecord.razorpayOrderId,
      paymentId: paymentRecord.razorpayPaymentId,
      amount: paymentRecord.amount,
      status: paymentRecord.status === 'captured' ? 'success' : 'failed',
      timestamp: paymentRecord.createdAt.getTime(),
    });
  } catch (error) {
    console.error('Error storing payment record:', error);
  }
};

/**
 * Retrieves payment record by ID
 * @param recordId - Payment record ID
 * @returns PaymentRecord or null
 */
export const getPaymentRecord = (recordId: string): PaymentRecord | null => {
  try {
    const encryptedData = sessionStorage.getItem(`payment_record_${recordId}`);
    if (!encryptedData) return null;

    const decryptedData = decryptData(encryptedData);
    return JSON.parse(decryptedData);
  } catch (error) {
    console.error('Error retrieving payment record:', error);
    return null;
  }
};

/**
 * Adds entry to payment history
 * @param entry - Payment history entry
 */
export const addPaymentHistoryEntry = (entry: PaymentHistoryEntry): void => {
  try {
    const existingHistory = getPaymentHistory();
    const updatedHistory = [...existingHistory, entry];

    // Keep only last 10 entries
    const trimmedHistory = updatedHistory.slice(-10);

    const encryptedData = encryptData(JSON.stringify(trimmedHistory));
    localStorage.setItem(STORAGE_KEYS.PAYMENT_HISTORY, encryptedData);
  } catch (error) {
    console.error('Error adding payment history entry:', error);
  }
};

/**
 * Retrieves payment history
 * @returns Array of payment history entries
 */
export const getPaymentHistory = (): PaymentHistoryEntry[] => {
  try {
    const encryptedData = localStorage.getItem(STORAGE_KEYS.PAYMENT_HISTORY);
    if (!encryptedData) return [];

    const decryptedData = decryptData(encryptedData);
    return JSON.parse(decryptedData);
  } catch (error) {
    console.error('Error retrieving payment history:', error);
    return [];
  }
};

/**
 * Stores enrollment data securely
 * @param enrollmentData - Enrollment data to store
 */
export const storeEnrollmentData = (enrollmentData: EnrollmentData): void => {
  try {
    const encryptedData = encryptData(JSON.stringify(enrollmentData));
    sessionStorage.setItem(STORAGE_KEYS.ENROLLMENT_DATA, encryptedData);
  } catch (error) {
    console.error('Error storing enrollment data:', error);
  }
};

/**
 * Retrieves enrollment data
 * @returns EnrollmentData or null
 */
export const getEnrollmentData = (): EnrollmentData | null => {
  try {
    const encryptedData = sessionStorage.getItem(STORAGE_KEYS.ENROLLMENT_DATA);
    if (!encryptedData) return null;

    const decryptedData = decryptData(encryptedData);
    return JSON.parse(decryptedData);
  } catch (error) {
    console.error('Error retrieving enrollment data:', error);
    return null;
  }
};

/**
 * Clears all enrollment-related data
 */
export const clearEnrollmentData = (): void => {
  try {
    sessionStorage.removeItem(STORAGE_KEYS.ENROLLMENT_DATA);
    sessionStorage.removeItem(STORAGE_KEYS.PAYMENT_SESSION);
    
    // Clear individual payment records
    const keys = Object.keys(sessionStorage);
    keys.forEach(key => {
      if (key.startsWith('payment_record_')) {
        sessionStorage.removeItem(key);
      }
    });
  } catch (error) {
    console.error('Error clearing enrollment data:', error);
  }
};

/**
 * Validates payment data integrity
 * @param paymentData - Payment data to validate
 * @returns boolean
 */
export const validatePaymentData = (paymentData: any): boolean => {
  try {
    // Basic validation checks
    if (!paymentData) return false;
    if (typeof paymentData !== 'object') return false;
    
    // Check required fields based on data type
    if (paymentData.razorpay_payment_id) {
      // Razorpay payment response validation
      return !!(
        paymentData.razorpay_payment_id &&
        paymentData.razorpay_order_id &&
        paymentData.razorpay_signature
      );
    }
    
    if (paymentData.id && paymentData.entity === 'order') {
      // Payment order validation
      return !!(
        paymentData.id &&
        paymentData.amount &&
        paymentData.currency &&
        paymentData.status
      );
    }

    return true;
  } catch (error) {
    console.error('Error validating payment data:', error);
    return false;
  }
};

/**
 * Sanitizes payment data for logging (removes sensitive information)
 * @param paymentData - Payment data to sanitize
 * @returns Sanitized payment data
 */
export const sanitizePaymentDataForLogging = (paymentData: any): any => {
  try {
    if (!paymentData || typeof paymentData !== 'object') {
      return paymentData;
    }

    const sanitized = { ...paymentData };

    // Remove or mask sensitive fields
    const sensitiveFields = [
      'razorpay_signature',
      'key_secret',
      'phoneNumber',
      'contact',
    ];

    sensitiveFields.forEach(field => {
      if (sanitized[field]) {
        sanitized[field] = '***REDACTED***';
      }
    });

    // Mask payment IDs partially
    if (sanitized.razorpay_payment_id) {
      const id = sanitized.razorpay_payment_id;
      sanitized.razorpay_payment_id = `${id.substring(0, 8)}***${id.substring(id.length - 4)}`;
    }

    if (sanitized.razorpay_order_id) {
      const id = sanitized.razorpay_order_id;
      sanitized.razorpay_order_id = `${id.substring(0, 8)}***${id.substring(id.length - 4)}`;
    }

    return sanitized;
  } catch (error) {
    console.error('Error sanitizing payment data:', error);
    return { error: 'Failed to sanitize data' };
  }
};

/**
 * Creates a payment session from order data
 * @param order - Payment order
 * @param planId - Selected plan ID
 * @param userPhone - User phone number
 * @param sport - Selected sport
 * @returns PaymentSession
 */
export const createPaymentSession = (
  order: PaymentOrder,
  planId: string,
  userPhone: string,
  sport: string
): PaymentSession => {
  const now = Date.now();
  const expirationTime = 30 * 60 * 1000; // 30 minutes

  return {
    orderId: order.id,
    amount: order.amount,
    currency: order.currency,
    planId,
    userPhone,
    sport,
    timestamp: now,
    expiresAt: now + expirationTime,
    attempts: 0,
    status: 'created',
  };
};

/**
 * Tracks payment status changes
 * @param orderId - Order ID
 * @param status - New payment status
 * @param metadata - Additional metadata
 */
export const trackPaymentStatus = (
  orderId: string,
  status: 'created' | 'processing' | 'success' | 'failed',
  metadata?: Record<string, any>
): void => {
  try {
    const statusEntry = {
      orderId,
      status,
      timestamp: Date.now(),
      metadata: sanitizePaymentDataForLogging(metadata),
    };

    // Store status tracking data
    const existingTracking = JSON.parse(
      localStorage.getItem('payment_status_tracking') || '[]'
    );
    
    existingTracking.push(statusEntry);
    
    // Keep only last 50 entries
    const trimmedTracking = existingTracking.slice(-50);
    
    localStorage.setItem('payment_status_tracking', JSON.stringify(trimmedTracking));
  } catch (error) {
    console.error('Error tracking payment status:', error);
  }
};