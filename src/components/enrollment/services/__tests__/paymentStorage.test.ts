import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  storePaymentSession,
  getPaymentSession,
  updatePaymentSessionStatus,
  clearPaymentSession,
  storePaymentRecord,
  getPaymentRecord,
  addPaymentHistoryEntry,
  getPaymentHistory,
  validatePaymentData,
  sanitizePaymentDataForLogging,
  createPaymentSession,
  trackPaymentStatus,
} from '../paymentStorage';
import { PaymentOrder, PaymentRecord } from '../../types';

// Mock sessionStorage and localStorage
const mockSessionStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(window, 'sessionStorage', {
  value: mockSessionStorage,
});

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

describe('PaymentStorage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Payment Session Management', () => {
    it('should store and retrieve payment session', () => {
      const mockOrder: PaymentOrder = {
        id: 'order_123',
        entity: 'order',
        amount: 100000,
        amount_paid: 0,
        amount_due: 100000,
        currency: 'INR',
        receipt: 'receipt_123',
        status: 'created',
        attempts: 0,
        notes: {},
        created_at: Date.now(),
      };

      const session = createPaymentSession(mockOrder, 'plan_12_month', '+919876543210', 'football');
      
      expect(session.orderId).toBe('order_123');
      expect(session.planId).toBe('plan_12_month');
      expect(session.userPhone).toBe('+919876543210');
      expect(session.sport).toBe('football');
      expect(session.status).toBe('created');
    });

    it('should update payment session status', () => {
      const mockSession = {
        orderId: 'order_123',
        amount: 100000,
        currency: 'INR',
        planId: 'plan_12_month',
        userPhone: '+919876543210',
        sport: 'football',
        timestamp: Date.now(),
        expiresAt: Date.now() + 30 * 60 * 1000,
        attempts: 0,
        status: 'created' as const,
      };

      // Mock getItem to return encrypted session data
      mockSessionStorage.getItem.mockReturnValue(btoa(encodeURIComponent(JSON.stringify(mockSession))));

      updatePaymentSessionStatus('processing');

      expect(mockSessionStorage.setItem).toHaveBeenCalled();
    });

    it('should clear payment session', () => {
      clearPaymentSession();
      expect(mockSessionStorage.removeItem).toHaveBeenCalledWith('enrollment_payment_session');
    });
  });

  describe('Payment Record Management', () => {
    it('should store and retrieve payment record', () => {
      const mockPaymentRecord: PaymentRecord = {
        id: 'payment_123',
        enrollmentId: 'enrollment_123',
        razorpayOrderId: 'order_123',
        razorpayPaymentId: 'pay_123',
        amount: 100000,
        currency: 'INR',
        status: 'captured',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      storePaymentRecord(mockPaymentRecord);
      expect(mockSessionStorage.setItem).toHaveBeenCalledWith(
        `payment_record_${mockPaymentRecord.id}`,
        expect.any(String)
      );
    });

    it('should return null for non-existent payment record', () => {
      mockSessionStorage.getItem.mockReturnValue(null);
      
      const result = getPaymentRecord('non_existent_id');
      expect(result).toBeNull();
    });
  });

  describe('Payment History Management', () => {
    it('should add payment history entry', () => {
      const historyEntry = {
        id: 'history_123',
        orderId: 'order_123',
        paymentId: 'pay_123',
        amount: 100000,
        status: 'success' as const,
        timestamp: Date.now(),
      };

      // Mock empty history
      mockLocalStorage.getItem.mockReturnValue(null);

      addPaymentHistoryEntry(historyEntry);
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'enrollment_payment_history',
        expect.any(String)
      );
    });

    it('should retrieve payment history', () => {
      const mockHistory = [
        {
          id: 'history_123',
          orderId: 'order_123',
          amount: 100000,
          status: 'success',
          timestamp: Date.now(),
        },
      ];

      mockLocalStorage.getItem.mockReturnValue(btoa(encodeURIComponent(JSON.stringify(mockHistory))));

      const result = getPaymentHistory();
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('history_123');
    });

    it('should return empty array for no history', () => {
      mockLocalStorage.getItem.mockReturnValue(null);
      
      const result = getPaymentHistory();
      expect(result).toEqual([]);
    });
  });

  describe('Data Validation', () => {
    it('should validate valid payment data', () => {
      const validPaymentData = {
        razorpay_payment_id: 'pay_123',
        razorpay_order_id: 'order_123',
        razorpay_signature: 'signature_123',
      };

      const result = validatePaymentData(validPaymentData);
      expect(result).toBe(true);
    });

    it('should reject invalid payment data', () => {
      const invalidPaymentData = {
        razorpay_payment_id: '',
        razorpay_order_id: 'order_123',
        razorpay_signature: 'signature_123',
      };

      const result = validatePaymentData(invalidPaymentData);
      expect(result).toBe(false);
    });

    it('should validate payment order data', () => {
      const validOrderData = {
        id: 'order_123',
        entity: 'order',
        amount: 100000,
        currency: 'INR',
        status: 'created',
      };

      const result = validatePaymentData(validOrderData);
      expect(result).toBe(true);
    });
  });

  describe('Data Sanitization', () => {
    it('should sanitize sensitive payment data', () => {
      const sensitiveData = {
        razorpay_payment_id: 'pay_1234567890abcdef',
        razorpay_order_id: 'order_1234567890abcdef',
        razorpay_signature: 'sensitive_signature',
        phoneNumber: '+919876543210',
        key_secret: 'secret_key',
      };

      const sanitized = sanitizePaymentDataForLogging(sensitiveData);

      expect(sanitized.razorpay_signature).toBe('***REDACTED***');
      expect(sanitized.phoneNumber).toBe('***REDACTED***');
      expect(sanitized.key_secret).toBe('***REDACTED***');
      expect(sanitized.razorpay_payment_id).toBe('pay_1234***cdef');
      expect(sanitized.razorpay_order_id).toBe('order_12***cdef');
    });

    it('should handle null/undefined data gracefully', () => {
      const result = sanitizePaymentDataForLogging(null);
      expect(result).toBeNull();

      const result2 = sanitizePaymentDataForLogging(undefined);
      expect(result2).toBeUndefined();
    });
  });

  describe('Payment Status Tracking', () => {
    it('should track payment status changes', () => {
      mockLocalStorage.getItem.mockReturnValue('[]');

      trackPaymentStatus('order_123', 'processing', { step: 'payment_start' });

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'payment_status_tracking',
        expect.any(String)
      );
    });

    it('should limit tracking entries to 50', () => {
      // Mock existing 50 entries
      const existingEntries = Array.from({ length: 50 }, (_, i) => ({
        orderId: `order_${i}`,
        status: 'success',
        timestamp: Date.now(),
      }));

      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(existingEntries));

      trackPaymentStatus('order_new', 'processing');

      const setItemCall = mockLocalStorage.setItem.mock.calls[0];
      const storedData = JSON.parse(setItemCall[1]);
      
      expect(storedData).toHaveLength(50);
      expect(storedData[49].orderId).toBe('order_new');
    });
  });
});