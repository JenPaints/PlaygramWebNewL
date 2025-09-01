import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api } from "./_generated/api";

const http = httpRouter();

// Razorpay order creation endpoint
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
      const razorpayKeyId = process.env.RAZORPAY_KEY_ID;
      const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;
      
      if (!razorpayKeyId || !razorpayKeySecret) {
        return new Response(
          JSON.stringify({ error: "Razorpay credentials not configured" }),
          { status: 500, headers: { "Content-Type": "application/json" } }
        );
      }
      
      // Create Razorpay order
      const orderData = {
        amount: amount, // amount in paise
        currency: currency,
        receipt: receipt,
        notes: notes || {}
      };
      
      const auth = Buffer.from(`${razorpayKeyId}:${razorpayKeySecret}`).toString('base64');
      
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
        return new Response(
          JSON.stringify({ error: "Failed to create Razorpay order" }),
          { status: response.status, headers: { "Content-Type": "application/json" } }
        );
      }
      
      const razorpayOrder = await response.json();
      
      return new Response(
        JSON.stringify(razorpayOrder),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
      
    } catch (error) {
      console.error('Error creating Razorpay order:', error);
      return new Response(
        JSON.stringify({ error: "Internal server error" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
  })
});

// Razorpay webhook endpoint for automatic payment status updates
http.route({
  path: "/api/razorpay-webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const body = await request.json();
      const { event, payload } = body;
      
      console.log('🔔 Razorpay webhook received:', { event, orderId: payload?.payment?.entity?.order_id });
      
      // Handle payment.captured event
      if (event === 'payment.captured') {
        const payment = payload.payment.entity;
        const orderId = payment.order_id;
        const paymentId = payment.id;
        const amount = payment.amount;
        const status = payment.status;
        
        console.log('💳 Payment captured:', { orderId, paymentId, amount, status });
        
        // Update payment status in all relevant tables
         await ctx.runMutation(api.payments.updatePaymentStatusFromWebhook, {
           razorpayOrderId: orderId,
           razorpayPaymentId: paymentId,
           status: 'completed',
           amount: amount / 100, // Convert from paise to rupees
           webhookData: payment
         });
         
         // Also try to update merchandise orders if this is a merchandise payment
         try {
           await ctx.runMutation(api.merchandiseOrders.updateOrderPayment, {
             razorpayOrderId: orderId,
             razorpayPaymentId: paymentId,
             paymentStatus: 'paid'
           });
         } catch (merchError) {
           console.log('ℹ️ Not a merchandise payment or already processed:', merchError);
         }
        
        return new Response(
          JSON.stringify({ success: true, message: 'Payment status updated' }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        );
      }
      
      // Handle payment.failed event
      if (event === 'payment.failed') {
        const payment = payload.payment.entity;
        const orderId = payment.order_id;
        const paymentId = payment.id;
        
        console.log('❌ Payment failed:', { orderId, paymentId });
        
        await ctx.runMutation(api.payments.updatePaymentStatusFromWebhook, {
          razorpayOrderId: orderId,
          razorpayPaymentId: paymentId,
          status: 'failed',
          webhookData: payment
        });
        
        return new Response(
          JSON.stringify({ success: true, message: 'Payment failure recorded' }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        );
      }
      
      // Log other events for debugging
      console.log('ℹ️ Unhandled webhook event:', event);
      
      return new Response(
        JSON.stringify({ success: true, message: 'Event logged' }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
      
    } catch (error) {
      console.error('❌ Webhook processing error:', error);
      return new Response(
        JSON.stringify({ error: "Webhook processing failed" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
  })
});

export default http;
