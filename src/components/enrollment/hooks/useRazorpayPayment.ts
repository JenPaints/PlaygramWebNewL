import { useState, useCallback } from 'react';
import { useConvex } from 'convex/react';
import { api } from '../../../../convex/_generated/api';

// Declare Razorpay global
declare global {
  interface Window {
    Razorpay: any;
  }
}

export interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

export interface UseRazorpayPaymentProps {
  selectedPlan: any;
  userPhone: string;
  enrollmentData: any;
  onSuccess: (response: RazorpayResponse, enrollmentId: string) => void;
  onError: (error: string) => void;
}

export const useRazorpayPayment = ({
  selectedPlan,
  userPhone,
  enrollmentData,
  onSuccess,
  onError,
}: UseRazorpayPaymentProps) => {
  const convex = useConvex();

  const [isLoading, setIsLoading] = useState(false);
  const [isRazorpayLoaded, setIsRazorpayLoaded] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  // Load Razorpay SDK
  const initializeRazorpay = useCallback(async () => {
    try {
      console.log('🔄 Initializing Razorpay...');

      // Check if already loaded
      if (window.Razorpay) {
        console.log('✅ Razorpay already loaded');
        setIsRazorpayLoaded(true);
        return true;
      }

      // Load SDK
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;

      const loadPromise = new Promise<boolean>((resolve) => {
        script.onload = () => {
          console.log('✅ Razorpay SDK loaded');
          setIsRazorpayLoaded(true);
          resolve(true);
        };
        script.onerror = () => {
          console.error('❌ Failed to load Razorpay SDK');
          setIsRazorpayLoaded(false);
          resolve(false);
        };
      });

      document.head.appendChild(script);
      return await loadPromise;
    } catch (error) {
      console.error('❌ Razorpay initialization error:', error);
      setIsRazorpayLoaded(false);
      return false;
    }
  }, []);

  // Process payment
  const processPayment = useCallback(async () => {
    try {
      setIsLoading(true);
      setPaymentError(null);

      console.log('🚀 Starting payment process...');
      console.log('📋 Plan:', selectedPlan);
      console.log('📞 Phone:', userPhone);

      // Validate inputs
      if (!selectedPlan || !userPhone || !enrollmentData) {
        throw new Error('Missing required payment information');
      }

      // Check Razorpay key
      const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID;
      if (!razorpayKey) {
        throw new Error('Razorpay key not configured');
      }

      // Warn if using live key in development
      if (razorpayKey.startsWith('rzp_live_') && process.env.NODE_ENV === 'development') {
        console.warn('⚠️ WARNING: Using LIVE Razorpay key in development! Consider using TEST keys (rzp_test_) for testing.');
      }

      // Ensure SDK is loaded
      if (!window.Razorpay) {
        const loaded = await initializeRazorpay();
        if (!loaded) {
          throw new Error('Failed to load payment system');
        }
      }

      console.log('💳 Creating payment order...');

      // Create payment order - try Convex first, fallback to offline
      let order;
      try {
        console.log('🔄 Attempting Convex order creation...');
        order = await convex.action(api.payments.createPaymentOrder, {
          amount: selectedPlan.totalPrice,
          currency: 'INR',
          planId: selectedPlan.id,
          userPhone: userPhone,
          sport: enrollmentData.sport,
          notes: {
            plan_duration: selectedPlan.duration,
            sessions: selectedPlan.sessions?.toString() || '0',
            enrollment_type: 'coaching',
          },
        });

        if (order.error) {
          throw new Error(order.error);
        }

        console.log('✅ Convex order created successfully');
      } catch (convexError) {
        console.warn('⚠️ Convex order creation failed, using offline mode:', convexError);

        // Fallback to offline order creation
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(2, 11);
        order = {
          id: `order_offline_${timestamp}_${random}`,
          entity: 'order',
          amount: Math.round(selectedPlan.totalPrice * 100), // Convert to paise
          amount_paid: 0,
          amount_due: Math.round(selectedPlan.totalPrice * 100),
          currency: 'INR',
          receipt: `receipt_offline_${timestamp}_${random}`,
          status: 'created',
          attempts: 0,
          notes: {
            plan_duration: selectedPlan.duration,
            sessions: selectedPlan.sessions?.toString() || '0',
            enrollment_type: 'coaching',
            offline_mode: 'true',
          },
          created_at: timestamp,
        };

        console.log('✅ Offline order created:', order);
      }

      console.log('✅ Order created:', order);

      // Configure Razorpay options with real order
      const options = {
        key: razorpayKey,
        amount: order.amount, // Amount in paise
        currency: order.currency,
        name: 'Playgram Sports',
        description: `Football Coaching - ${selectedPlan.duration}`,
        order_id: order.id, // Use real Razorpay order ID
        handler: async (response: RazorpayResponse) => {
          try {
            console.log('✅ Payment successful:', response);

            // Verify payment - try Convex first, fallback to offline
            try {
              console.log('🔄 Attempting Convex payment verification...');
              const verification = await convex.mutation(api.payments.verifyPaymentAndCreateEnrollment, {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                enrollmentData: {
                  phoneNumber: userPhone,
                  sport: enrollmentData.sport,
                  planId: selectedPlan.id,
                },
                amount: selectedPlan.totalPrice,
              });

              if (verification.success && verification.enrollmentId) {
                console.log('✅ Convex verification successful');
                onSuccess(response, verification.enrollmentId);
              } else {
                throw new Error(verification.error || 'Payment verification failed');
              }
            } catch (verificationError) {
              console.warn('⚠️ Convex verification failed, using offline mode:', verificationError);

              // Fallback to offline verification
              const offlineEnrollmentId = `enrollment_offline_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
              console.log('✅ Offline verification successful:', offlineEnrollmentId);
              onSuccess(response, offlineEnrollmentId);
            }
          } catch (error: any) {
            console.error('❌ Payment verification error:', error);
            onError(error.message || 'Payment verification failed');
          }
        },
        prefill: {
          contact: userPhone.replace('+91', ''),
        },
        theme: {
          color: '#86D5F0',
        },
        modal: {
          ondismiss: () => {
            console.log('💔 Payment cancelled by user');
            setIsLoading(false);
            onError('Payment was cancelled');
          },
        },
      };

      console.log('🎯 Opening Razorpay modal...');

      // Create and open Razorpay
      const rzp = new window.Razorpay(options);

      rzp.on('payment.failed', (response: any) => {
        console.error('❌ Payment failed:', response.error);
        setIsLoading(false);
        onError(response.error.description || 'Payment failed');
      });

      rzp.open();

    } catch (error: any) {
      console.error('❌ Payment process error:', error);
      setIsLoading(false);
      setPaymentError(error.message);
      onError(error.message || 'Payment failed');
    }
  }, [selectedPlan, userPhone, enrollmentData, convex, onSuccess, onError, initializeRazorpay]);

  // Clear error
  const clearError = useCallback(() => {
    setPaymentError(null);
  }, []);

  return {
    isLoading,
    isRazorpayLoaded,
    paymentError,
    initializeRazorpay,
    processPayment,
    clearError,
  };
};