import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { StepComponentProps } from '../types';
import { useRazorpayPayment, RazorpayResponse } from '../hooks/useRazorpayPayment';
import { PRICING_PLANS } from '../utils/constants';
import { useAuth } from '../../auth/AuthContext';

interface PaymentStepProps extends StepComponentProps {
  selectedPlan: any;
  userPhone: string;
}



export const PaymentStep: React.FC<PaymentStepProps> = ({
  onNext,
  onBack,
  enrollmentState,
  updateState,
  selectedPlan,
  userPhone,
}) => {
  const { setAuthenticatedUser } = useAuth();

  // Handle payment success
  const handlePaymentSuccess = (response: RazorpayResponse, enrollmentId: string) => {
    console.log('✅ Payment completed successfully');

    // Auto-login user after successful payment
    const userData = {
      uid: `payment_${userPhone}`,
      phoneNumber: userPhone,
      isAnonymous: false
    };
    
    setAuthenticatedUser(userData);

    updateState({
      paymentStatus: 'success',
      enrollmentData: {
        ...enrollmentState.enrollmentData,
        id: enrollmentId,
        paymentId: response.razorpay_payment_id,
        status: 'active',
        enrollmentDate: new Date(),
      },
    });

    onNext();
  };

  // Handle payment error
  const handlePaymentError = (error: string) => {
    console.error('❌ Payment error:', error);

    updateState({
      paymentStatus: 'failed',
      errors: {
        ...enrollmentState.errors,
        payment: error
      }
    });
  };

  // Use simplified payment hook
  const {
    isLoading,
    isRazorpayLoaded,
    paymentError,
    initializeRazorpay,
    processPayment,
    clearError,
  } = useRazorpayPayment({
    selectedPlan,
    userPhone,
    enrollmentData: enrollmentState.enrollmentData,
    onSuccess: handlePaymentSuccess,
    onError: handlePaymentError,
  });

  // Initialize on mount
  useEffect(() => {
    console.log('🔄 PaymentStep mounted, initializing...');
    initializeRazorpay();
  }, [initializeRazorpay]);

  // Get the matching plan from constants
  const footballPlan = PRICING_PLANS.find(plan =>
    plan.id === selectedPlan?.id
  ) || PRICING_PLANS[0];



  // Handle payment click
  const handlePaymentClick = async () => {
    console.log('🎯 Payment button clicked');

    if (!selectedPlan || !userPhone) {
      handlePaymentError('Missing payment information');
      return;
    }

    updateState({ paymentStatus: 'processing' });
    await processPayment();
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Premium Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full mb-4">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Secure Payment
        </h2>
        <p className="text-gray-600 text-lg">
          Complete your football coaching enrollment
        </p>
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Left Column - Order Summary */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-6"
        >
          {/* Plan Details Card */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 flex items-center">
                <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
                Your Plan
              </h3>
            </div>

            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="text-2xl font-bold text-gray-900">{footballPlan.duration} Plan</h4>
                  <p className="text-gray-600">{footballPlan.sessionsText}</p>
                </div>
                {footballPlan.popular && (
                  <span className="bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                    {footballPlan.discount}
                  </span>
                )}
              </div>

              <div className="space-y-3 mb-6">
                {footballPlan.features.map((feature, index) => (
                  <div key={index} className="flex items-center text-gray-700">
                    <svg className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-100 pt-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-600">Original Price</span>
                  <span className="text-gray-400 line-through">₹{footballPlan.originalPrice.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-600">You Pay</span>
                  <span className="text-2xl font-bold text-gray-900">₹{footballPlan.totalPrice.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-green-600 font-medium">You Save</span>
                  <span className="text-green-600 font-bold">
                    ₹{(footballPlan.originalPrice - footballPlan.totalPrice).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>


        </motion.div>

        {/* Right Column - Payment */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          {/* Payment Card */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 px-6 py-4 border-b border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 flex items-center">
                <span className="w-2 h-2 bg-purple-600 rounded-full mr-3"></span>
                Payment Details
              </h3>
            </div>

            <div className="p-6 space-y-6">
              {/* Status Messages */}
              {!isRazorpayLoaded && !paymentError && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-blue-50 border border-blue-200 rounded-xl p-4"
                >
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-3"></div>
                    <span className="text-blue-800 font-medium">Initializing secure payment...</span>
                  </div>
                </motion.div>
              )}

              {paymentError && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-red-50 border border-red-200 rounded-xl p-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <svg className="h-5 w-5 text-red-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                      <span className="text-red-800 font-medium">{paymentError}</span>
                    </div>
                    <button
                      onClick={clearError}
                      className="text-red-600 hover:text-red-800 text-sm font-medium"
                    >
                      Retry
                    </button>
                  </div>
                </motion.div>
              )}

              {isLoading && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-blue-50 border border-blue-200 rounded-xl p-4"
                >
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-3"></div>
                    <span className="text-blue-800 font-medium">Processing your payment...</span>
                  </div>
                </motion.div>
              )}

              {/* Payment Amount Display */}
              <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-6 text-center">
                <p className="text-gray-600 text-sm mb-2">Total Amount</p>
                <p className="text-4xl font-bold text-gray-900 mb-2">₹{footballPlan.totalPrice.toLocaleString()}</p>
                <p className="text-green-600 font-medium text-sm">
                  Includes all taxes • No hidden charges
                </p>
              </div>

              {/* Payment Methods */}
              <div className="space-y-3">
                <p className="text-sm font-medium text-gray-700 mb-3">Accepted Payment Methods</p>
                <div className="grid grid-cols-4 gap-3">
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <div className="text-2xl mb-1">💳</div>
                    <p className="text-xs text-gray-600">Cards</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <div className="text-2xl mb-1">🏦</div>
                    <p className="text-xs text-gray-600">Net Banking</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <div className="text-2xl mb-1">📱</div>
                    <p className="text-xs text-gray-600">UPI</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <div className="text-2xl mb-1">💰</div>
                    <p className="text-xs text-gray-600">Wallets</p>
                  </div>
                </div>
              </div>

              {/* Payment Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handlePaymentClick}
                disabled={isLoading || !isRazorpayLoaded}
                className="w-full relative overflow-hidden rounded-xl font-bold text-lg py-4 px-6 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-md bg-white/10 border-2 border-red-500 hover:bg-white/20 hover:border-red-600"
              >
                <div className="flex items-center justify-center text-red-600">
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-600 mr-3"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      Pay Securely ₹{footballPlan.totalPrice.toLocaleString()}
                    </>
                  )}
                </div>
              </motion.button>



              {/* Back Button */}
              <button
                onClick={onBack}
                disabled={isLoading}
                className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-xl font-semibold hover:bg-gray-200 disabled:opacity-50 transition-colors flex items-center justify-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Plan Selection
              </button>
            </div>
          </div>

          {/* Security & Trust Indicators */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <h4 className="font-bold text-gray-900 mb-4 flex items-center">
              <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Secure & Trusted
            </h4>
            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex items-center">
                <svg className="w-4 h-4 text-blue-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
                256-bit SSL encryption
              </div>
              <div className="flex items-center">
                <svg className="w-4 h-4 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                PCI DSS compliant
              </div>
              <div className="flex items-center">
                <svg className="w-4 h-4 text-purple-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Powered by Razorpay
              </div>
            </div>
          </div>
        </motion.div>
      </div>


    </div>
  );
};