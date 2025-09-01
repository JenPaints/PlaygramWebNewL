import { Id } from '../../convex/_generated/dataModel';

// Razorpay configuration for enrollment payments
const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_your_key_id';

interface EnrollmentPaymentData {
  amount: number;
  currency: string;
  receipt: string;
  notes: {
    sportId: string;
    batchId: string;
    packageDuration: string;
    customerPhone: string;
    customerName: string;
  };
}

interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpayResponse) => void;
  prefill: {
    name: string;
    contact: string;
  };
  theme: {
    color: string;
  };
  modal: {
    ondismiss: () => void;
  };
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

class EnrollmentPaymentService {
  private convex: any;

  setConvexClient(convex: any) {
    this.convex = convex;
  }

  async createRazorpayOrder(paymentData: EnrollmentPaymentData): Promise<string> {
    try {
      if (!this.convex) {
        throw new Error('Convex client not initialized');
      }

      // Use Convex action to create Razorpay order
      const result = await this.convex.action('razorpayOrders:createRazorpayOrder', {
        amount: paymentData.amount,
        currency: paymentData.currency,
        receipt: paymentData.receipt,
        notes: paymentData.notes,
      });

      if (!result.success) {
        throw new Error('Failed to create Razorpay order');
      }

      return result.order.id; // Razorpay order ID
    } catch (error) {
      console.error('Error creating Razorpay order:', error);
      throw error;
    }
  }

  async processEnrollmentPayment(
    sportId: Id<"sportsPrograms">,
    batchId: Id<"batches">,
    packageData: {
      duration: string;
      price: number;
      sessions: number;
    },
    customerName: string,
    customerPhone: string
  ): Promise<{ success: boolean; paymentId?: string; orderId?: string }> {
    try {
      // Load Razorpay script
      const scriptLoaded = await this.loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error('Failed to load Razorpay script');
      }

      // Create payment data
      const paymentData: EnrollmentPaymentData = {
        amount: packageData.price * 100, // Convert to paise
        currency: 'INR',
        receipt: `enrollment_${Date.now()}`,
        notes: {
          sportId: sportId,
          batchId: batchId,
          packageDuration: packageData.duration,
          customerPhone: customerPhone,
          customerName: customerName,
        },
      };

      // Create Razorpay order
      const orderId = await this.createRazorpayOrder(paymentData);

      // Return promise that resolves when payment is complete
      return new Promise((resolve, reject) => {
        const options: RazorpayOptions = {
          key: RAZORPAY_KEY_ID,
          amount: paymentData.amount,
          currency: paymentData.currency,
          name: 'Playgram Sports',
          description: `Enrollment for ${packageData.duration} package`,
          order_id: orderId,
          handler: async (response: RazorpayResponse) => {
            try {
              // Verify payment on backend
              const verificationResult = await this.verifyPayment(
                response.razorpay_order_id,
                response.razorpay_payment_id,
                response.razorpay_signature
              );

              if (verificationResult.success) {
                resolve({
                  success: true,
                  paymentId: response.razorpay_payment_id,
                  orderId: response.razorpay_order_id,
                });
              } else {
                reject(new Error('Payment verification failed'));
              }
            } catch (error) {
              reject(error);
            }
          },
          prefill: {
            name: customerName,
            contact: customerPhone,
          },
          theme: {
            color: '#3B82F6',
          },
          modal: {
            ondismiss: () => {
              reject(new Error('Payment cancelled by user'));
            },
          },
        };

        const razorpay = new window.Razorpay(options);
        razorpay.open();
      });
    } catch (error) {
      console.error('Payment processing error:', error);
      return { success: false };
    }
  }

  async verifyPayment(
    orderId: string,
    paymentId: string,
    signature: string
  ): Promise<{ success: boolean }> {
    try {
      if (!this.convex) {
        throw new Error('Convex client not initialized');
      }

      // Use Convex action to verify payment
      const result = await this.convex.action('razorpayOrders:verifyRazorpayPayment', {
        razorpayOrderId: orderId,
        razorpayPaymentId: paymentId,
        razorpaySignature: signature,
      });

      return { success: result.success };
    } catch (error) {
      console.error('Payment verification error:', error);
      return { success: false };
    }
  }

  loadRazorpayScript(): Promise<boolean> {
    return new Promise((resolve) => {
      // Check if script is already loaded
      if (window.Razorpay) {
        resolve(true);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => {
        resolve(true);
      };
      script.onerror = () => {
        resolve(false);
      };
      document.body.appendChild(script);
    });
  }

  // Helper method to format currency
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }

  // Helper method to generate receipt
  generateReceipt(type: string): string {
    const timestamp = Date.now();
    return `${type}_${timestamp}`;
  }
}

export const enrollmentPaymentService = new EnrollmentPaymentService();
export default enrollmentPaymentService;

// Export types for use in components
export type { EnrollmentPaymentData, RazorpayResponse };