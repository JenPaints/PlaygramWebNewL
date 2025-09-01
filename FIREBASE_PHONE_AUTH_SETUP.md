# Firebase Phone Authentication Setup Guide

## 🚀 Quick Setup (Recommended)

Run the automated setup checker:
```bash
node scripts/firebase-setup-checker.js
```

This will verify your configuration and provide specific guidance.

## 📋 Manual Setup Steps

### Step 1: Enable Phone Authentication in Firebase Console

1. **Go to Firebase Console**
   - Visit: https://console.firebase.google.com/project/playgram-f78d3/authentication/providers
   - Or navigate: Firebase Console → Your Project → Authentication → Sign-in method

2. **Enable Phone Provider**
   - Find **Phone** in the list of providers
   - Click on **Phone** to configure it
   - Toggle the **Enable** switch to ON
   - Click **Save**

### Step 2: Configure Authorized Domains

1. **Navigate to Authentication Settings**
   - Go to: https://console.firebase.google.com/project/playgram-f78d3/authentication/settings
   - Or: Authentication → Settings tab (gear icon)

2. **Add Authorized Domains**
   - Scroll down to **Authorized domains** section
   - Add these domains:
     - `localhost` (for development)
     - `127.0.0.1` (if needed for local testing)
     - Your production domain (when you deploy)

### Step 3: Enable Required APIs in Google Cloud Console

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/apis/library?project=playgram-f78d3
   - Select your project: `playgram-f78d3`

2. **Enable Required APIs**
   - Search and enable these APIs:
     - **Identity Toolkit API**
     - **Firebase Authentication API**

### Step 4: Configure reCAPTCHA (Important!)

Based on Firebase documentation, reCAPTCHA is required for phone authentication:

1. **reCAPTCHA is automatically handled** by our implementation
2. **For development**: We use invisible reCAPTCHA
3. **For production**: Ensure your domain is authorized

## 🔧 Current Configuration Status

Your Firebase config (from `.env.local`):
```
Project ID: playgram-f78d3
Auth Domain: playgram-f78d3.firebaseapp.com
API Key: AIzaSyC6gBCp_QxzFHZEq5oX93FNind0tlEnWvo
```

## 🧪 Testing Your Setup

### Option 1: Automated Testing
```bash
npm run dev
```
Then open browser console and run:
```javascript
FirebaseTestUtility.runAllTests()
```

### Option 2: Manual Testing

1. **Start development server**
   ```bash
   npm run dev
   ```

2. **Test phone authentication**
   - Open the enrollment modal
   - Enter a real phone number (with country code)
   - You should receive an SMS with OTP
   - Enter the received OTP

3. **Check console messages**
   - Look for "✅ Firebase initialized successfully"
   - Should see "🔥 Using Firebase authentication"

### Option 3: Mock Testing (Always Works)

If Firebase isn't configured yet:
- Enter any phone number (e.g., `+1234567890`)
- Use OTP code: `123456`
- This allows testing the complete flow

## 🚨 Common Issues and Solutions

### Issue: `auth/invalid-app-credential`
**Cause:** Phone Authentication not enabled in Firebase Console
**Solution:** 
1. Go to Firebase Console → Authentication → Sign-in method
2. Enable Phone provider
3. Save changes

### Issue: `auth/unauthorized-domain`
**Cause:** Domain not authorized for authentication
**Solution:**
1. Go to Firebase Console → Authentication → Settings
2. Add your domain to Authorized domains
3. For local development, add `localhost`

### Issue: `auth/captcha-check-failed`
**Cause:** reCAPTCHA verification failed
**Solution:**
1. Ensure domain is authorized in Firebase
2. Check for browser extensions blocking reCAPTCHA
3. Try in incognito mode
4. Our app automatically resets reCAPTCHA on failure

### Issue: `auth/too-many-requests`
**Cause:** Rate limiting from Firebase
**Solution:**
1. Wait 15-30 minutes before trying again
2. Use a different phone number for testing
3. Our app has built-in rate limiting protection

### Issue: SMS not received
**Possible Causes & Solutions:**
1. **Phone number format**: Ensure it includes country code (e.g., `+1234567890`)
2. **Firebase quota**: Check Firebase Console for SMS usage
3. **Billing**: Ensure billing is enabled for production use
4. **Network**: Try with a different phone number

## 📊 Implementation Details

Our implementation follows Firebase best practices:

### reCAPTCHA Handling
- **Invisible reCAPTCHA** for better UX
- **Automatic reset** on errors
- **Pre-rendering** for performance
- **Graceful fallback** if reCAPTCHA fails

### Error Handling
- **Specific error messages** for each Firebase error code
- **Automatic fallback** to mock authentication
- **Rate limiting protection**
- **User-friendly error messages**

### Development Experience
- **Mock authentication** when Firebase not configured
- **Comprehensive testing utilities**
- **Detailed console logging**
- **Automatic configuration detection**

## 🎯 Testing Checklist

Before going to production:

- [ ] Phone Authentication enabled in Firebase Console
- [ ] Authorized domains configured (including production domain)
- [ ] Identity Toolkit API enabled in Google Cloud Console
- [ ] Firebase Authentication API enabled
- [ ] Billing enabled in Firebase Console (for production SMS)
- [ ] Rate limiting and security rules configured
- [ ] Real phone number testing completed
- [ ] OTP delivery confirmed

## 🔍 Debug Commands

Open browser console and use these commands:

```javascript
// Check configuration
checkFirebaseStatus()

// Test Firebase initialization
FirebaseTestUtility.testFirebaseInit()

// Test OTP sending
FirebaseTestUtility.testOTPSending()

// Test OTP verification
FirebaseTestUtility.testOTPVerification()

// Run all tests
FirebaseTestUtility.runAllTests()
```

## 📱 Production Considerations

### SMS Billing
- Firebase charges for SMS messages in production
- Set up billing in Firebase Console
- Monitor usage to avoid unexpected charges

### Security
- Configure security rules for your project
- Set up proper rate limiting
- Monitor for abuse patterns

### Monitoring
- Check Firebase Console for authentication metrics
- Monitor SMS delivery rates
- Set up alerts for authentication failures

## 🆘 Need Help?

1. **Run the setup checker**: `node scripts/firebase-setup-checker.js`
2. **Check browser console** for detailed error messages
3. **Verify all steps** above are completed
4. **Try with different phone number**
5. **Test in incognito mode** to rule out browser extensions

## ✅ Success Indicators

You'll know it's working when you see:
- ✅ "Firebase initialized successfully" in console
- 📱 Real SMS received with OTP code
- 🔥 "Using Firebase authentication" in console logs
- 🎉 Successful authentication and enrollment flow