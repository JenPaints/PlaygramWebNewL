import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  createPaymentOrder,
  verifyAndProcessPayment,
  getPaymentStatus,
  retryPayment,
  cancelPaymentOrder,
} from '../paymentService';

// Mock the Razorpay module
vi.mock('razorpay', () => ({
  default: vi.fn().mockImplementation(() => ({
    orders: {
      create: vi.fn(),
    },
    payments: {
      fetch: vi.fn(),
      refund: vi.fn(),
    },
  })),
}));

describe('PaymentService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createPaymentOrder', () => {
    it('should create a payment order successfully', async () => {
      const orderData = {
        amount: 1000,
        currency: 'INR',
        planId: 'plan_12_month',
        userPhone: '+919876543210',
        sport: 'football',
      };

      const result = await createPaymentOrder(orderData);

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.amount).toBe(100000); // Amount in paise
      expect(result.currency).toBe('INR');
      expect(result.status).toBe('created');
      expect(result.notes.sport).toBe('football');
      expect(result.notes.plan).toBe('plan_12_month');
      expect(result.notes.phone).toBe('+919876543210');
    });

    it('should handle errors when creating payment order', async () => {
      const orderData = {
        amount: -1000, // Invalid amount
        currency: 'INR',
        planId: 'plan_12_month',
        userPhone: '+919876543210',
        sport: 'football',
      };

      await expect(createPaymentOrder(orderData)).rejects.toThrow(
        'Failed to create payment order. Please try again.'
      );
    });
  });

  describe('verifyAndProcessPayment', () => {
    it('should verify payment successfully', async () => {
      const verificationData = {
        razorpay_order_id: 'order_123',
        razorpay_payment_id: 'pay_123',
        razorpay_signature: 'signature_123',
        enrollmentData: {
          phoneNumber: '+919876543210',
          sport: 'football',
          planId: 'plan_12_month',
        },
      };

      const result = await verifyAndProcessPayment(verificationData);

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.enrollmentId).toBeDefined();
      expect(result.razorpayOrderId).toBe('order_123');
      expect(result.razorpayPaymentId).toBe('pay_123');
      expect(result.status).toBe('captured');
    });

    it('should handle verification errors', async () => {
      const verificationData = {
        razorpay_order_id: '',
        razorpay_payment_id: '',
        razorpay_signature: '',
        enrollmentData: {
          phoneNumber: '+919876543210',
          sport: 'football',
          planId: 'plan_12_month',
        },
      };

      await expect(verifyAndProcessPayment(verificationData)).rejects.toThrow(
        'Payment verification failed. Please contact support.'
      );
    });
  });

  describe('getPaymentStatus', () => {
    it('should fetch payment status successfully', async () => {
      const paymentId = 'pay_123';

      const result = await getPaymentStatus(paymentId);

      expect(result).toBeDefined();
      expect(result.razorpayPaymentId).toBe(paymentId);
      expect(result.status).toBe('captured');
    });

    it('should handle errors when fetching payment status', async () => {
      const paymentId = '';

      await expect(getPaymentStatus(paymentId)).rejects.toThrow(
        'Failed to fetch payment status.'
      );
    });
  });

  describe('retryPayment', () => {
    it('should create retry payment order successfully', async () => {
      const originalOrderId = 'order_123';
      const orderData = {
        amount: 1000,
        currency: 'INR',
        planId: 'plan_12_month',
        userPhone: '+919876543210',
        sport: 'football',
      };

      const result = await retryPayment(originalOrderId, orderData);

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.notes.retry_for).toBe(originalOrderId);
      expect(result.notes.retry_timestamp).toBeDefined();
    });
  });

  describe('cancelPaymentOrder', () => {
    it('should cancel payment order successfully', async () => {
      const orderId = 'order_123';

      const result = await cancelPaymentOrder(orderId);

      expect(result).toBe(true);
    });

    it('should handle cancellation errors gracefully', async () => {
      const orderId = '';

      const result = await cancelPaymentOrder(orderId);

      expect(result).toBe(false);
    });
  });
});