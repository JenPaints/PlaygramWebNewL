# Firebase Production Setup Guide

## Current Issue: Rate Limiting (auth/too-many-requests)

You're experiencing Firebase's free tier limitations. Here's how to resolve this for production:

## 1. Upgrade Firebase Plan

### Go to Firebase Console:
1. Visit https://console.firebase.google.com/project/playgram-f78d3
2. Navigate to "Usage and billing" → "Details & settings"
3. Upgrade to **Blaze Plan** (Pay-as-you-go)

### Why Upgrade is Needed:
- **Spark Plan (Free)**: Limited to 10 phone auth verifications per day
- **Blaze Plan**: Up to 10,000 free verifications per month, then $0.06 per verification

## 2. Configure Phone Authentication Quotas

### In Firebase Console:
1. Go to "Authentication" → "Settings" → "Usage"
2. Set appropriate quotas:
   - **Daily SMS quota**: 1000+ (recommended for production)
   - **Per-IP rate limiting**: 5 requests per hour per IP
   - **Per-phone rate limiting**: 5 requests per day per phone number

## 3. Enable reCAPTCHA v3 (Recommended)

### Benefits:
- Reduces abuse and spam
- Better user experience
- Lower costs

### Setup:
1. Go to Authentication → Settings → Sign-in method
2. Click on "Phone" provider
3. Enable "reCAPTCHA Enterprise" or "reCAPTCHA v3"

## 4. Implement Production Error Handling

The code has been updated with proper production error handling:

- ✅ Removed development fallbacks
- ✅ Added proper error messages
- ✅ Implemented rate limiting guidance
- ✅ Added retry mechanisms

## 5. Alternative Solutions (If needed)

### Option A: Third-party SMS Service
- Integrate Twilio, AWS SNS, or TextLocal
- More control over costs and delivery
- Better for high-volume applications

### Option B: Email + SMS Hybrid
- Use email as primary verification
- SMS as optional secondary verification
- Reduces SMS costs significantly

## 6. Monitoring and Optimization

### Set up monitoring:
1. Firebase Console → Analytics → Events
2. Monitor authentication success rates
3. Track failed verification attempts
4. Set up alerts for quota limits

### Cost optimization:
- Implement phone number validation before sending OTP
- Add cooldown periods between requests
- Use reCAPTCHA to prevent abuse

## 7. Testing in Production

### Recommended approach:
1. Start with Blaze plan
2. Monitor usage for first week
3. Adjust quotas based on actual usage
4. Implement additional security measures if needed

## Current Configuration Status:
- ✅ Firebase project: playgram-f78d3
- ✅ Phone authentication enabled
- ⚠️ **Action needed**: Upgrade to Blaze plan
- ⚠️ **Action needed**: Configure production quotas

## Immediate Next Steps:
1. **Upgrade to Blaze plan** (most important)
2. **Wait 15-30 minutes** for current rate limit to reset
3. **Test with real phone numbers**
4. **Monitor usage** in Firebase console

## Cost Estimate:
- First 10,000 verifications/month: **FREE**
- Additional verifications: **$0.06 each**
- Typical small business: **$5-20/month**