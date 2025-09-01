import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api } from "./_generated/api";

const http = httpRouter();

// Create Razorpay order for enrollment
http.route({
  path: "/api/create-razorpay-order",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const body = await request.json();
      const { amount, currency, receipt, notes } = body;

      // Validate required fields
      if (!amount || !currency || !receipt) {
        return new Response(
          JSON.stringify({ error: "Missing required fields" }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }

      // Get Razorpay credentials from environment
      const keyId = process.env.RAZORPAY_KEY_ID;
      const keySecret = process.env.RAZORPAY_KEY_SECRET;

      if (!keyId || !keySecret) {
        return new Response(
          JSON.stringify({ error: "Razorpay credentials not configured" }),
          { status: 500, headers: { "Content-Type": "application/json" } }
        );
      }

      // Create Razorpay order
      const orderData = {
        amount: amount, // Amount in paise
        currency: currency,
        receipt: receipt,
        notes: notes || {},
      };

      const auth = Buffer.from(`${keyId}:${keySecret}`).toString('base64');
      
      const response = await fetch('https://api.razorpay.com/v1/orders', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Razorpay API error:', errorData);
        return new Response(
          JSON.stringify({ error: "Failed to create Razorpay order" }),
          { status: 500, headers: { "Content-Type": "application/json" } }
        );
      }

      const order = await response.json();
      
      // Order is created via Razorpay API, no need to store separately
      // The order details are already handled by the existing razorpayOrders functions

      return new Response(
        JSON.stringify(order),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    } catch (error) {
      console.error('Error creating Razorpay order:', error);
      return new Response(
        JSON.stringify({ error: "Internal server error" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
  }),
});

// Verify Razorpay payment
http.route({
  path: "/api/verify-payment",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const body = await request.json();
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

      // Validate required fields
      if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
        return new Response(
          JSON.stringify({ error: "Missing required fields", success: false }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }

      // Get Razorpay secret from environment
      const keySecret = process.env.RAZORPAY_KEY_SECRET;
      if (!keySecret) {
        return new Response(
          JSON.stringify({ error: "Razorpay secret not configured", success: false }),
          { status: 500, headers: { "Content-Type": "application/json" } }
        );
      }

      // Verify signature
      const crypto = require('crypto');
      const expectedSignature = crypto
        .createHmac('sha256', keySecret)
        .update(razorpay_order_id + '|' + razorpay_payment_id)
        .digest('hex');

      const isSignatureValid = expectedSignature === razorpay_signature;

      if (isSignatureValid) {
        // Verify payment using existing function
        const verificationResult = await ctx.runAction(api.razorpayOrders.verifyRazorpayPayment, {
          razorpayOrderId: razorpay_order_id,
          razorpayPaymentId: razorpay_payment_id,
          razorpaySignature: razorpay_signature,
        });

        return new Response(
          JSON.stringify({ success: verificationResult.success, message: "Payment verified successfully" }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        );
      } else {
        // Payment signature is invalid

        return new Response(
          JSON.stringify({ success: false, error: "Invalid payment signature" }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }
    } catch (error) {
      console.error('Error verifying payment:', error);
      return new Response(
        JSON.stringify({ success: false, error: "Internal server error" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
  }),
});

export default http;