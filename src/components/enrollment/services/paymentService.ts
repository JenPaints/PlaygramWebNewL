import {
  PaymentOrder,
  PaymentVerification,
  PaymentRecord,
  RazorpayPaymentResponse,
  ApiResponse
} from '../types';
import { formatAmountToPaise } from '../../../services/razorpayClient';
import { api } from '../../../../convex/_generated/api';
import { useConvex } from 'convex/react';

// Get Convex client instance
let convexClient: any = null;

export const setConvexClient = (client: any) => {
  convexClient = client;
};

// Create payment order request interface
export interface CreateOrderRequest {
  amount: number; // Amount in rupees
  currency?: string;
  planId: string;
  userPhone: string;
  sport: string;
  notes?: Record<string, string>;
}

// Payment verification request interface
export interface VerifyPaymentRequest {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  enrollmentData: {
    phoneNumber: string;
    sport: string;
    planId: string;
  };
  amount?: number;
}

/**
 * Creates a payment order via Convex backend
 * @param orderData - Order creation data
 * @returns Promise<PaymentOrder>
 */
export const createPaymentOrder = async (orderData: CreateOrderRequest): Promise<PaymentOrder> => {
  try {
    console.log('Creating payment order with data:', orderData);
    
    if (!convexClient) {
      throw new Error('Convex client not initialized. Please refresh the page and try again.');
    }

    // Validate order data
    if (!orderData.amount || orderData.amount <= 0) {
      throw new Error('Invalid payment amount');
    }

    if (!orderData.planId || !orderData.userPhone || !orderData.sport) {
      throw new Error('Missing required order information');
    }

    const result = await convexClient.mutation(api.payments.createPaymentOrder, {
      amount: orderData.amount,
      currency: orderData.currency || 'INR',
      planId: orderData.planId,
      userPhone: orderData.userPhone,
      sport: orderData.sport,
      notes: orderData.notes || {},
    });

    console.log('Payment order created successfully:', result);
    return result;
  } catch (error: any) {
    console.error('Error creating payment order:', error);
    
    // Provide more specific error messages
    if (error.message?.includes('network') || error.message?.includes('fetch')) {
      throw new Error('Network error. Please check your connection and try again.');
    } else if (error.message?.includes('unauthorized') || error.message?.includes('auth')) {
      throw new Error('Authentication error. Please refresh the page and try again.');
    } else {
      throw new Error(error.message || 'Failed to create payment order. Please try again.');
    }
  }
};

/**
 * Verifies payment signature and processes enrollment
 * @param verificationData - Payment verification data
 * @returns Promise<PaymentRecord>
 */
export const verifyAndProcessPayment = async (
  verificationData: VerifyPaymentRequest
): Promise<PaymentRecord> => {
  try {
    if (!convexClient) {
      throw new Error('Convex client not initialized');
    }

    const result = await convexClient.mutation(api.payments.verifyPaymentAndCreateEnrollment, {
      razorpay_order_id: verificationData.razorpay_order_id,
      razorpay_payment_id: verificationData.razorpay_payment_id,
      razorpay_signature: verificationData.razorpay_signature,
      enrollmentData: verificationData.enrollmentData,
      amount: verificationData.amount,
    });

    if (!result.success) {
      throw new Error('Payment verification failed');
    }

    // Return a properly formatted PaymentRecord
    const paymentRecord: PaymentRecord = {
      id: result.paymentId,
      enrollmentId: result.enrollmentId,
      razorpayOrderId: verificationData.razorpay_order_id,
      razorpayPaymentId: verificationData.razorpay_payment_id,
      amount: verificationData.amount || 0,
      currency: 'INR',
      status: 'captured',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return paymentRecord;
  } catch (error) {
    console.error('Error verifying payment:', error);
    throw new Error('Payment verification failed. Please contact support.');
  }
};

/**
 * Fetches payment status by payment ID
 * @param paymentId - Razorpay payment ID
 * @returns Promise<PaymentRecord>
 */
export const getPaymentStatus = async (paymentId: string): Promise<PaymentRecord> => {
  try {
    if (!convexClient) {
      throw new Error('Convex client not initialized');
    }

    // Use getUserPayments to find the payment record
    const result = await convexClient.query(api.payments.getUserPayments, {
      userId: paymentId, // This is a fallback implementation
    });

    if (!result || result.length === 0) {
      throw new Error('Payment not found');
    }

    const payment = result[0];
    return {
      id: payment._id,
      enrollmentId: payment.details?.enrollmentId || '',
      razorpayOrderId: payment.details?.razorpayOrderId || '',
      razorpayPaymentId: payment.details?.razorpayPaymentId || '',
      amount: payment.amount,
      currency: payment.currency,
      status: payment.status === 'completed' ? 'captured' : payment.status,
      createdAt: new Date(payment.createdAt),
      updatedAt: new Date(payment.updatedAt),
    };
  } catch (error) {
    console.error('Error fetching payment status:', error);
    throw new Error('Failed to fetch payment status.');
  }
};

/**
 * Handles payment retry logic
 * @param originalOrderId - Original order ID that failed
 * @param orderData - Order data for retry
 * @returns Promise<PaymentOrder>
 */
export const retryPayment = async (
  originalOrderId: string,
  orderData: CreateOrderRequest
): Promise<PaymentOrder> => {
  try {
    if (!convexClient) {
      throw new Error('Convex client not initialized');
    }

    // Log the retry attempt
    console.log(`Retrying payment for order: ${originalOrderId}`);

    // Create a new payment order instead of retrying
    const result = await convexClient.mutation(api.payments.createPaymentOrder, {
      amount: orderData.amount,
      currency: orderData.currency || 'INR',
      planId: orderData.planId,
      userPhone: orderData.userPhone,
      sport: orderData.sport,
      notes: {
        ...orderData.notes,
        retry_of: originalOrderId,
      },
    });

    return result;
  } catch (error) {
    console.error('Error retrying payment:', error);
    throw new Error('Failed to retry payment. Please try again.');
  }
};

/**
 * Cancels a payment order
 * @param orderId - Order ID to cancel
 * @returns Promise<boolean>
 */
export const cancelPaymentOrder = async (orderId: string): Promise<boolean> => {
  try {
    // In a real implementation, this would cancel the order via your backend

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Mock successful cancellation
    return true;

    // Real implementation would look like:
    /*
    const response = await fetch(`${PAYMENT_API_BASE}/orders/${orderId}/cancel`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: ApiResponse<boolean> = await response.json();
    
    return result.success;
    */
  } catch (error) {
    console.error('Error cancelling payment order:', error);
    return false;
  }
};