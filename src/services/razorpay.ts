import Razorpay from 'razorpay';

// Razorpay configuration as specified in requirements
export const RAZORPAY_CONFIG = {
  key_id: 'rzp_live_lSCoIp0EewCk9z',
  key_secret: '7ZcF5V5OJnvDN663RY3HvJhO',
  currency: 'INR',
  theme: {
    color: '#86D5F0',
  },
} as const;

// Initialize Razorpay instance
const razorpay = new Razorpay({
  key_id: RAZORPAY_CONFIG.key_id,
  key_secret: RAZORPAY_CONFIG.key_secret,
});

// Payment order creation interface
export interface CreateOrderParams {
  amount: number; // Amount in paise (smallest currency unit)
  currency?: string;
  receipt?: string;
  notes?: Record<string, string>;
}

// Payment order response interface
export interface PaymentOrder {
  id: string;
  entity: string;
  amount: number;
  amount_paid: number;
  amount_due: number;
  currency: string;
  receipt: string;
  status: string;
  attempts: number;
  notes: Record<string, string>;
  created_at: number;
}

// Payment verification interface
export interface PaymentVerification {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

/**
 * Creates a payment order with Razorpay
 * @param params - Order creation parameters
 * @returns Promise<PaymentOrder>
 */
export const createPaymentOrder = async (params: CreateOrderParams): Promise<PaymentOrder> => {
  try {
    const orderOptions = {
      amount: params.amount,
      currency: params.currency || RAZORPAY_CONFIG.currency,
      receipt: params.receipt || `receipt_${Date.now()}`,
      notes: params.notes || {},
    };

    const order = await razorpay.orders.create(orderOptions);
    return order;
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    throw new Error('Failed to create payment order');
  }
};

/**
 * Verifies payment signature for security
 * @param verification - Payment verification data
 * @returns boolean
 */
export const verifyPaymentSignature = (verification: PaymentVerification): boolean => {
  try {
    const crypto = require('crypto');
    const expectedSignature = crypto
      .createHmac('sha256', RAZORPAY_CONFIG.key_secret)
      .update(`${verification.razorpay_order_id}|${verification.razorpay_payment_id}`)
      .digest('hex');

    return expectedSignature === verification.razorpay_signature;
  } catch (error) {
    console.error('Error verifying payment signature:', error);
    return false;
  }
};

/**
 * Fetches payment details by payment ID
 * @param paymentId - Razorpay payment ID
 * @returns Promise<any>
 */
export const getPaymentDetails = async (paymentId: string) => {
  try {
    const payment = await razorpay.payments.fetch(paymentId);
    return payment;
  } catch (error) {
    console.error('Error fetching payment details:', error);
    throw new Error('Failed to fetch payment details');
  }
};

/**
 * Refunds a payment
 * @param paymentId - Razorpay payment ID
 * @param amount - Refund amount in paise (optional, full refund if not provided)
 * @returns Promise<any>
 */
export const refundPayment = async (paymentId: string, amount?: number) => {
  try {
    const refundOptions = amount ? { amount } : {};
    const refund = await razorpay.payments.refund(paymentId, refundOptions);
    return refund;
  } catch (error) {
    console.error('Error processing refund:', error);
    throw new Error('Failed to process refund');
  }
};

export default razorpay;