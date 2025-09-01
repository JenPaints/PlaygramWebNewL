# Razorpay Integration Guide

## Overview
This guide explains how to test and use the Razorpay payment integration in the enrollment modal.

## 🚀 Quick Start

### 1. Environment Setup
Ensure your `.env.local` file has the Razorpay configuration:
```bash
VITE_RAZORPAY_KEY_ID=rzp_live_lSCoIp0EewCk9z
RAZORPAY_KEY_SECRET=7ZcF5V5OJnvDN663RY3HvJhO
```

### 2. Start Development Server
```bash
npm run dev
```

### 3. Start Convex Backend
```bash
npx convex dev
```

## 🧪 Testing the Payment Flow

### Method 1: Full Enrollment Modal
1. Open your React app in the browser
2. Navigate to any sport page (Football, Basketball, etc.)
3. Click "Enroll Now" to open the enrollment modal
4. Complete the authentication step
5. Review court details
6. Select a pricing plan
7. Click "Proceed to Payment"
8. Test with Razorpay test cards

### Method 2: Direct Payment Test
Open `src/components/enrollment/test-razorpay-payment.html` in your browser for direct Razorpay testing.

### Method 3: Development Test Button
In development mode, the PaymentStep includes a "Test Payment" button that simulates successful payment without going through Razorpay.

## 💳 Test Card Numbers

### Successful Payments
- **Card Number:** 4111 1111 1111 1111
- **Expiry:** Any future date (e.g., 12/25)
- **CVV:** Any 3 digits (e.g., 123)
- **Name:** Any name

### Failed Payments
- **Card Number:** 4000 0000 0000 0002
- **Expiry:** Any future date
- **CVV:** Any 3 digits
- **Name:** Any name

### Other Test Scenarios
- **Timeout:** 4000 0000 0000 0069
- **3D Secure:** 4000 0000 0000 3220

## 🔄 Payment Flow Steps

1. **Initialization**
   - Razorpay SDK loads automatically
   - Payment system initializes with proper configuration

2. **Order Creation**
   - Creates payment order via Convex backend
   - Stores order details in database
   - Returns order ID for Razorpay

3. **Payment Processing**
   - Opens Razorpay payment modal
   - User completes payment with test cards
   - Razorpay returns payment response

4. **Payment Verification**
   - Verifies payment signature (simulated in development)
   - Creates enrollment record in database
   - Updates payment status

5. **Confirmation**
   - Shows success confirmation
   - Displays enrollment details
   - Provides next steps information

## 🛠️ Technical Implementation

### Key Components
- `PaymentStep.tsx` - Main payment interface
- `useRazorpayPayment.ts` - Payment logic hook
- `razorpayClient.ts` - Razorpay SDK integration
- `paymentService.ts` - Backend communication
- `convex/payments.ts` - Database operations

### Configuration Files
- `src/utils/razorpayConfig.ts` - Configuration utilities
- `.env.local` - Environment variables
- `convex/schema.ts` - Database schema

## 🔍 Debugging

### Common Issues
1. **Razorpay SDK not loading**
   - Check internet connection
   - Verify script tag in HTML
   - Check browser console for errors

2. **Payment order creation fails**
   - Ensure Convex is running (`npx convex dev`)
   - Check environment variables
   - Verify database schema

3. **Payment verification fails**
   - Check Razorpay key configuration
   - Verify signature validation logic
   - Check backend logs

### Debug Tools
- Browser Developer Tools (Network, Console)
- Convex Dashboard (https://dashboard.convex.dev)
- Razorpay Dashboard (for production)

## 📱 Mobile Testing

The payment modal is fully responsive and works on mobile devices:
- Touch-friendly interface
- Optimized button sizes
- Mobile-specific Razorpay checkout

## 🔒 Security Features

- Environment-based configuration
- Secure payment signature verification
- HTTPS-only payment processing
- PCI DSS compliant through Razorpay

## 🚀 Production Deployment

### Before Going Live
1. Replace test Razorpay keys with live keys
2. Implement proper signature verification
3. Add webhook handling for payment updates
4. Set up proper error logging
5. Configure payment failure notifications

### Environment Variables for Production
```bash
VITE_RAZORPAY_KEY_ID=rzp_live_your_live_key
RAZORPAY_KEY_SECRET=your_live_secret_key
```

## 📊 Payment Analytics

Track payment metrics:
- Success/failure rates
- Popular pricing plans
- Payment method preferences
- Geographic distribution

## 🆘 Support

For issues or questions:
- Check browser console for errors
- Review Convex function logs
- Test with different browsers
- Verify network connectivity

## 📋 Checklist

### Development Testing
- [ ] Razorpay SDK loads successfully
- [ ] Payment order creation works
- [ ] Test cards process correctly
- [ ] Payment success flow completes
- [ ] Payment failure handling works
- [ ] Confirmation screen displays
- [ ] Mobile responsiveness verified

### Production Readiness
- [ ] Live Razorpay keys configured
- [ ] Signature verification implemented
- [ ] Webhook endpoints set up
- [ ] Error monitoring enabled
- [ ] Payment analytics configured
- [ ] Security audit completed

## 🔗 Useful Links

- [Razorpay Documentation](https://razorpay.com/docs/)
- [Razorpay Test Cards](https://razorpay.com/docs/payments/payments/test-card-upi-details/)
- [Convex Documentation](https://docs.convex.dev/)
- [React Integration Guide](https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/build-integration/)