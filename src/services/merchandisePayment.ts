import { Id } from '../../convex/_generated/dataModel';

// Razorpay configuration for merchandise payments
const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_your_key_id';

interface MerchandiseOrderItem {
  merchandiseId: Id<"merchandise">;
  quantity: number;
  size?: string;
  color?: string;
  price: number;
}

interface CreateMerchandiseOrderParams {
  customerPhone: string;
  customerName: string;
  items: MerchandiseOrderItem[];
  totalAmount: number;
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

class MerchandisePaymentService {
  private convex: any;

  setConvexClient(convex: any) {
    this.convex = convex;
  }

  async createOrder(orderData: CreateMerchandiseOrderParams): Promise<{ orderId: Id<"merchandiseOrders">; orderNumber: string }> {
    if (!this.convex) {
      throw new Error('Convex client not initialized');
    }

    try {
      // Create order in database first
      const result = await this.convex.mutation('merchandiseOrders:createOrder', orderData);
      return result;
    } catch (error) {
      console.error('Error creating merchandise order:', error);
      throw new Error('Failed to create order');
    }
  }

  async createRazorpayOrder(amount: number, orderId: string): Promise<string> {
    try {
      if (!this.convex) {
        throw new Error('Convex client not initialized');
      }

      const result = await this.convex.action('razorpayOrders:createRazorpayOrder', {
        amount: amount * 100, // Convert to paise
        currency: 'INR',
        receipt: `merch_${orderId}`,
        notes: {
          type: 'merchandise',
          orderId: orderId
        }
      });

      if (!result.success) {
        throw new Error('Failed to create Razorpay order');
      }

      return result.orderId; // Razorpay order ID
    } catch (error) {
      console.error('Error creating Razorpay order:', error);
      throw new Error('Failed to create payment order');
    }
  }

  async processPayment(
    orderId: Id<"merchandiseOrders">,
    orderNumber: string,
    amount: number,
    customerName: string,
    customerPhone: string
  ): Promise<void> {
    return new Promise(async (resolve, reject) => {
      try {
        // Load Razorpay script first
        const scriptLoaded = await this.loadRazorpayScript();
        if (!scriptLoaded) {
          reject(new Error('Failed to load Razorpay script'));
          return;
        }

        // Create Razorpay order
        const razorpayOrderId = await this.createRazorpayOrder(amount, orderNumber);

        // Update order with Razorpay order ID
        await this.convex.mutation('merchandiseOrders:updateOrderPayment', {
          orderId,
          razorpayOrderId,
          paymentStatus: 'pending'
        });

        const options: RazorpayOptions = {
          key: RAZORPAY_KEY_ID,
          amount: amount * 100, // Amount in paise
          currency: 'INR',
          name: 'Playgram Merchandise',
          description: `Order #${orderNumber}`,
          order_id: razorpayOrderId,
          handler: async (response: RazorpayResponse) => {
            try {
              // Verify payment using universal payment verification
              const verificationResult = await this.convex.mutation('payments:verifyPaymentUniversal', {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                paymentType: 'merchandise',
                amount: amount
              });

              if (verificationResult.success) {
                console.log('✅ Merchandise payment verified successfully:', verificationResult);
                resolve();
              } else {
                console.error('❌ Merchandise payment verification failed:', verificationResult.error);
                reject(new Error(verificationResult.error || 'Payment verification failed'));
              }
            } catch (error) {
              console.error('Error verifying payment:', error);
              reject(error);
            }
          },
          prefill: {
            name: customerName,
            contact: customerPhone,
          },
          theme: {
            color: '#3B82F6', // Blue color matching the UI
          },
          modal: {
            ondismiss: () => {
              reject(new Error('Payment cancelled by user'));
            },
          },
        };

        const razorpay = new window.Razorpay(options);
        razorpay.open();
      } catch (error) {
        console.error('Error processing payment:', error);
        reject(error);
      }
    });
  }

  async getOrderStatus(orderId: Id<"merchandiseOrders">) {
    if (!this.convex) {
      throw new Error('Convex client not initialized');
    }

    try {
      const order = await this.convex.query('merchandiseOrders:getOrderById', { orderId });
      return order;
    } catch (error) {
      console.error('Error fetching order status:', error);
      throw new Error('Failed to fetch order status');
    }
  }

  // Load Razorpay script dynamically
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
}

export const merchandisePaymentService = new MerchandisePaymentService();
export default merchandisePaymentService;

// Helper function to format currency
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// Helper function to generate order receipt
export const generateOrderReceipt = (orderNumber: string): string => {
  return `MERCH_${orderNumber}_${Date.now()}`;
};