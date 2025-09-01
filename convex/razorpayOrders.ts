import { v } from "convex/values";
import { action } from "./_generated/server";

// Create Razorpay order using Convex action with environment variables
export const createRazorpayOrder = action({
  args: {
    amount: v.number(),
    currency: v.string(),
    receipt: v.string(),
    notes: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    try {
      // Get Razorpay credentials from environment
      const razorpayKeyId = process.env.RAZORPAY_KEY_ID;
      const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;
      
      if (!razorpayKeyId || !razorpayKeySecret) {
        throw new Error("Razorpay credentials not configured");
      }
      
      // Create Razorpay order
      const orderData = {
        amount: args.amount, // amount in paise
        currency: args.currency,
        receipt: args.receipt,
        notes: args.notes || {}
      };
      
      const auth = btoa(`${razorpayKeyId}:${razorpayKeySecret}`);
      
      const response = await fetch('https://api.razorpay.com/v1/orders', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(orderData)
      });
      
      if (!response.ok) {
        const errorData = await response.text();
        console.error('Razorpay API error:', errorData);
        throw new Error(`Failed to create Razorpay order: ${response.status}`);
      }
      
      const razorpayOrder = await response.json();
      
      return {
        success: true,
        orderId: razorpayOrder.id,
        order: razorpayOrder
      };
      
    } catch (error) {
      console.error('Error creating Razorpay order:', error);
      throw new Error(error instanceof Error ? error.message : "Internal server error");
    }
  },
});

// Test function to check Razorpay order creation
export const testRazorpayOrder = action({
  args: {},
  handler: async (ctx) => {
    try {
      console.log('🧪 Testing Razorpay order creation...');
      
      // Get Razorpay credentials from environment
      const razorpayKeyId = process.env.RAZORPAY_KEY_ID;
      const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;
      
      console.log('🔑 Razorpay Key ID:', razorpayKeyId ? 'Present' : 'Missing');
      console.log('🔑 Razorpay Secret:', razorpayKeySecret ? 'Present' : 'Missing');
      
      if (!razorpayKeyId || !razorpayKeySecret) {
        return {
          success: false,
          error: "Razorpay credentials not configured",
          keyIdPresent: !!razorpayKeyId,
          secretPresent: !!razorpayKeySecret
        };
      }
      
      // Test order data
      const orderData = {
        amount: 100, // 1 rupee in paise
        currency: 'INR',
        receipt: `test_receipt_${Date.now()}`,
        notes: { test: 'enrollment_test' }
      };
      
      const auth = btoa(`${razorpayKeyId}:${razorpayKeySecret}`);
      
      console.log('📡 Making request to Razorpay API...');
      
      const response = await fetch('https://api.razorpay.com/v1/orders', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(orderData)
      });
      
      console.log('📊 Response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.text();
        console.error('❌ Razorpay API error:', errorData);
        return {
          success: false,
          error: `Razorpay API error: ${response.status}`,
          responseStatus: response.status,
          errorData
        };
      }
      
      const razorpayOrder = await response.json();
      console.log('✅ Razorpay order created successfully:', razorpayOrder.id);
      
      return {
        success: true,
        orderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        status: razorpayOrder.status
      };
      
    } catch (error) {
      console.error('❌ Test failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error"
      };
    }
  },
});

// Verify Razorpay payment
export const verifyRazorpayPayment = action({
  args: {
    razorpayOrderId: v.string(),
    razorpayPaymentId: v.string(),
    razorpaySignature: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;
      
      if (!razorpayKeySecret) {
        throw new Error("Razorpay secret not configured");
      }
      
      // Verify signature using Web Crypto API
      const encoder = new TextEncoder();
      const key = await crypto.subtle.importKey(
        'raw',
        encoder.encode(razorpayKeySecret),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
      );
      
      const signature = await crypto.subtle.sign(
        'HMAC',
        key,
        encoder.encode(`${args.razorpayOrderId}|${args.razorpayPaymentId}`)
      );
      
      const expectedSignature = Array.from(new Uint8Array(signature))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
      
      const isValid = expectedSignature === args.razorpaySignature;
      
      return {
        success: isValid,
        message: isValid ? 'Payment verified successfully' : 'Payment verification failed'
      };
      
    } catch (error) {
      console.error('Payment verification error:', error);
      throw new Error(error instanceof Error ? error.message : "Internal server error");
    }
  },
});

export default { createRazorpayOrder, verifyRazorpayPayment, testRazorpayOrder };