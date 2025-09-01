import React, { useState, useEffect } from 'react';
import { useConvex } from 'convex/react';

interface PaymentDebuggerProps {
  selectedPlan?: any;
  userPhone?: string;
  enrollmentData?: any;
}

export const PaymentDebugger: React.FC<PaymentDebuggerProps> = ({
  selectedPlan,
  userPhone,
  enrollmentData,
}) => {
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [isExpanded, setIsExpanded] = useState(false);
  const convex = useConvex();

  useEffect(() => {
    const checkEnvironment = () => {
      const info = {
        timestamp: new Date().toISOString(),
        environment: {
          nodeEnv: process.env.NODE_ENV,
          razorpayKeyId: import.meta.env.VITE_RAZORPAY_KEY_ID ? '✅ Configured' : '❌ Missing',
          convexUrl: import.meta.env.VITE_CONVEX_URL ? '✅ Configured' : '❌ Missing',
          protocol: window.location.protocol,
          host: window.location.host,
        },
        razorpay: {
          sdkLoaded: !!window.Razorpay,
          keyId: import.meta.env.VITE_RAZORPAY_KEY_ID?.substring(0, 10) + '...',
        },
        convex: {
          clientAvailable: !!convex,
          clientType: typeof convex,
        },
        paymentData: {
          selectedPlan: selectedPlan ? {
            id: selectedPlan.id,
            duration: selectedPlan.duration,
            totalPrice: selectedPlan.totalPrice,
            sessions: selectedPlan.sessions,
          } : null,
          userPhone,
          enrollmentData: enrollmentData ? {
            sport: enrollmentData.sport,
            phoneNumber: enrollmentData.phoneNumber,
            status: enrollmentData.status,
          } : null,
        },
        localStorage: {
          enrollmentState: !!localStorage.getItem('enrollment_state'),
          paymentSession: !!sessionStorage.getItem('payment_session'),
        },
      };
      
      setDebugInfo(info);
    };

    checkEnvironment();
    
    // Check periodically for changes
    const interval = setInterval(checkEnvironment, 2000);
    return () => clearInterval(interval);
  }, [selectedPlan, userPhone, enrollmentData, convex]);

  const testRazorpaySDK = async () => {
    try {
      if (!window.Razorpay) {
        console.log('Loading Razorpay SDK...');
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        
        await new Promise((resolve, reject) => {
          script.onload = resolve;
          script.onerror = reject;
          document.head.appendChild(script);
        });
      }
      
      console.log('Razorpay SDK loaded successfully');
      alert('Razorpay SDK is working! ✅');
    } catch (error) {
      console.error('Razorpay SDK test failed:', error);
      alert('Razorpay SDK test failed! ❌');
    }
  };

  const testPaymentFlow = () => {
    if (!window.Razorpay) {
      alert('Razorpay SDK not loaded');
      return;
    }

    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: 100000, // ₹1000 in paise
      currency: 'INR',
      name: 'Playgram Sports - Debug Test',
      description: 'Test Payment',
      order_id: 'test_order_' + Date.now(),
      handler: function(response: any) {
        console.log('Test payment success:', response);
        alert('Test payment successful! ✅');
      },
      prefill: {
        contact: userPhone || '9999999999',
      },
      theme: {
        color: '#86D5F0',
      },
      modal: {
        ondismiss: function() {
          console.log('Test payment dismissed');
          alert('Test payment cancelled');
        },
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.on('payment.failed', function(response: any) {
      console.error('Test payment failed:', response);
      alert('Test payment failed! ❌');
    });
    
    rzp.open();
  };

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="bg-purple-600 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-purple-700 transition-colors"
      >
        🐛 Debug {isExpanded ? '▼' : '▲'}
      </button>
      
      {isExpanded && (
        <div className="absolute bottom-12 right-0 w-96 max-h-96 overflow-y-auto bg-white border border-gray-300 rounded-lg shadow-xl p-4">
          <h3 className="font-bold text-gray-900 mb-3">Payment Debug Info</h3>
          
          <div className="space-y-3 text-sm">
            {/* Environment Status */}
            <div>
              <h4 className="font-semibold text-gray-700">Environment</h4>
              <div className="ml-2 space-y-1">
                <div>Mode: {debugInfo.environment?.nodeEnv}</div>
                <div>Razorpay: {debugInfo.environment?.razorpayKeyId}</div>
                <div>Convex: {debugInfo.environment?.convexUrl}</div>
                <div>Protocol: {debugInfo.environment?.protocol}</div>
              </div>
            </div>

            {/* Razorpay Status */}
            <div>
              <h4 className="font-semibold text-gray-700">Razorpay</h4>
              <div className="ml-2 space-y-1">
                <div>SDK: {debugInfo.razorpay?.sdkLoaded ? '✅ Loaded' : '❌ Not Loaded'}</div>
                <div>Key: {debugInfo.razorpay?.keyId}</div>
              </div>
            </div>

            {/* Payment Data */}
            <div>
              <h4 className="font-semibold text-gray-700">Payment Data</h4>
              <div className="ml-2 space-y-1">
                <div>Plan: {debugInfo.paymentData?.selectedPlan?.id || 'None'}</div>
                <div>Amount: ₹{debugInfo.paymentData?.selectedPlan?.totalPrice || 0}</div>
                <div>Phone: {debugInfo.paymentData?.userPhone || 'None'}</div>
                <div>Sport: {debugInfo.paymentData?.enrollmentData?.sport || 'None'}</div>
              </div>
            </div>

            {/* Test Buttons */}
            <div className="space-y-2 pt-2 border-t">
              <button
                onClick={testRazorpaySDK}
                className="w-full bg-blue-500 text-white py-1 px-2 rounded text-xs hover:bg-blue-600"
              >
                Test Razorpay SDK
              </button>
              <button
                onClick={testPaymentFlow}
                className="w-full bg-green-500 text-white py-1 px-2 rounded text-xs hover:bg-green-600"
              >
                Test Payment Flow
              </button>
              <button
                onClick={() => console.log('Debug Info:', debugInfo)}
                className="w-full bg-gray-500 text-white py-1 px-2 rounded text-xs hover:bg-gray-600"
              >
                Log to Console
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentDebugger;