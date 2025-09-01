// Client-side Razorpay integration for browser
declare global {
  interface Window {
    Razorpay: any;
  }
}

import { getRazorpayConfig } from '../utils/razorpayConfig';

// Razorpay configuration for client-side
export const RAZORPAY_CLIENT_CONFIG = getRazorpayConfig();

// Payment options interface for client-side
export interface RazorpayPaymentOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpayPaymentResponse) => void;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  notes?: Record<string, string>;
  theme?: {
    color: string;
  };
  modal?: {
    ondismiss?: () => void;
  };
}

// Payment response interface
export interface RazorpayPaymentResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

// Payment error interface
export interface RazorpayPaymentError {
  code: string;
  description: string;
  source: string;
  step: string;
  reason: string;
  metadata: Record<string, any>;
}

/**
 * Loads Razorpay SDK dynamically
 * @returns Promise<boolean>
 */
export const loadRazorpaySDK = (): Promise<boolean> => {
  return new Promise((resolve) => {
    console.log('Loading Razorpay SDK...');
    
    // Check if Razorpay is already loaded
    if (window.Razorpay) {
      console.log('Razorpay SDK already loaded');
      resolve(true);
      return;
    }

    // Check if script is already being loaded
    const existingScript = document.querySelector('script[src*="checkout.razorpay.com"]');
    if (existingScript) {
      console.log('Razorpay SDK script already exists, waiting for load...');
      existingScript.addEventListener('load', () => {
        console.log('Existing Razorpay script loaded');
        resolve(!!window.Razorpay);
      });
      existingScript.addEventListener('error', () => {
        console.error('Existing Razorpay script failed to load');
        resolve(false);
      });
      return;
    }

    // Create script element
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.crossOrigin = 'anonymous';
    
    script.onload = () => {
      console.log('Razorpay SDK loaded successfully');
      if (window.Razorpay) {
        console.log('Razorpay object is available');
        resolve(true);
      } else {
        console.error('Razorpay SDK loaded but object not available');
        resolve(false);
      }
    };
    
    script.onerror = (error) => {
      console.error('Failed to load Razorpay SDK:', error);
      resolve(false);
    };

    // Add timeout for loading
    setTimeout(() => {
      if (!window.Razorpay) {
        console.error('Razorpay SDK loading timeout');
        resolve(false);
      }
    }, 10000); // 10 second timeout

    document.head.appendChild(script);
    console.log('Razorpay SDK script added to document');
  });
};

/**
 * Opens Razorpay payment modal
 * @param options - Payment options
 * @returns Promise<RazorpayPaymentResponse>
 */
export const openRazorpayPayment = (
  options: RazorpayPaymentOptions
): Promise<RazorpayPaymentResponse> => {
  return new Promise((resolve, reject) => {
    if (!window.Razorpay) {
      reject(new Error('Razorpay SDK not loaded'));
      return;
    }

    console.log('Opening Razorpay payment with options:', options);

    const paymentOptions: RazorpayPaymentOptions = {
      ...options,
      handler: (response: RazorpayPaymentResponse) => {
        console.log('Payment success response:', response);
        resolve(response);
        // Call the original handler if provided
        if (options.handler) {
          options.handler(response);
        }
      },
      modal: {
        ondismiss: () => {
          console.log('Payment modal dismissed');
          reject(new Error('Payment cancelled by user'));
        },
        ...options.modal,
      },
    };

    try {
      const rzp = new window.Razorpay(paymentOptions);
      
      rzp.on('payment.failed', (response: { error: RazorpayPaymentError }) => {
        console.error('Payment failed:', response.error);
        reject(response.error);
      });

      console.log('Opening Razorpay modal...');
      rzp.open();
    } catch (error) {
      console.error('Error opening Razorpay modal:', error);
      reject(error);
    }
  });
};

/**
 * Creates payment options for enrollment
 * @param orderData - Order data from backend
 * @param userPhone - User's phone number
 * @param planName - Selected plan name
 * @returns RazorpayPaymentOptions
 */
export const createEnrollmentPaymentOptions = (
  orderData: {
    id: string;
    amount: number;
    currency: string;
  },
  userPhone: string,
  planName: string
): Omit<RazorpayPaymentOptions, 'handler'> => {
  // Validate inputs
  if (!orderData.id || !orderData.amount || !userPhone) {
    throw new Error('Missing required payment data');
  }

  // Ensure phone number is properly formatted
  const formattedPhone = userPhone.startsWith('+91') ? userPhone.slice(3) : userPhone;

  return {
    key: RAZORPAY_CLIENT_CONFIG.keyId,
    amount: orderData.amount, // Amount should already be in paise from backend
    currency: orderData.currency || 'INR',
    name: 'Playgram Sports',
    description: `Football Coaching - ${planName}`,
    order_id: orderData.id,
    prefill: {
      contact: formattedPhone,
    },
    notes: {
      sport: 'football',
      plan: planName,
      enrollment_type: 'coaching',
    },
    theme: RAZORPAY_CLIENT_CONFIG.theme,
    retry: {
      enabled: true,
      max_count: 3,
    },
    timeout: 300, // 5 minutes timeout
  };
};

/**
 * Formats amount from rupees to paise
 * @param amountInRupees - Amount in rupees
 * @returns Amount in paise
 */
export const formatAmountToPaise = (amountInRupees: number): number => {
  return Math.round(amountInRupees * 100);
};

/**
 * Formats amount from paise to rupees
 * @param amountInPaise - Amount in paise
 * @returns Amount in rupees
 */
export const formatAmountToRupees = (amountInPaise: number): number => {
  return amountInPaise / 100;
};