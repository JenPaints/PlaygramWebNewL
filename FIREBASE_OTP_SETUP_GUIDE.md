# Firebase OTP Authentication Setup Guide

This guide will help you set up Firebase OTP authentication properly for your application.

## 1. Firebase Console Setup

### Enable Phone Authentication
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project (`playgram-f78d3`)
3. Navigate to **Authentication** > **Sign-in method**
4. Enable **Phone** provider
5. Click **Save**

### Configure Authorized Domains
1. In the **Sign-in method** tab, scroll down to **Authorized domains**
2. Add your domains:
   - `localhost` (for development)
   - Your production domain
   - Any staging domains

### Test Phone Numbers (Optional for Development)
1. In the **Sign-in method** tab, scroll down to **Phone numbers for testing**
2. Add test numbers:
   - Phone: `+1 650-555-3434`
   - Code: `123456`
   - Phone: `+91 98765 43210`
   - Code: `123456`

## 2. Environment Configuration

Your `.env.local` file should have these variables:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=AIzaSyC6gBCp_QxzFHZEq5oX93FNind0tlEnWvo
VITE_FIREBASE_AUTH_DOMAIN=playgram-f78d3.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=playgram-f78d3
VITE_FIREBASE_STORAGE_BUCKET=playgram-f78d3.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=149679535822
VITE_FIREBASE_APP_ID=1:149679535822:web:cf54a356097c990ec0429f
VITE_FIREBASE_MEASUREMENT_ID=G-XGPVDNHK2Y
```

## 3. Common Issues and Solutions

### Issue: "reCAPTCHA has already been rendered"
**Solution**: The code now handles this automatically with cleanup and retry logic.

### Issue: "auth/invalid-app-credential"
**Solutions**:
1. Verify your API key is correct
2. Check that your domain is authorized
3. Ensure your Firebase project is active

### Issue: "auth/too-many-requests"
**Solutions**:
1. Wait 15-30 minutes before trying again
2. Use test phone numbers during development
3. Implement proper rate limiting

### Issue: "auth/captcha-check-failed"
**Solutions**:
1. Ensure your domain is authorized in Firebase Console
2. Check that reCAPTCHA is loading properly
3. Try refreshing the page

## 4. Development Testing

### Using Test Phone Numbers
1. Use the test numbers configured in Firebase Console
2. Always use the test verification code `123456`
3. Test numbers won't send actual SMS messages

### Mock Authentication
The code includes fallback mock authentication for development:
- Any phone number will work in development mode
- Use OTP code `123456` for testing
- Mock users have ID `mock-user-id` or `fallback-user-id`

## 5. Production Checklist

- [ ] Phone authentication enabled in Firebase Console
- [ ] Production domain added to authorized domains
- [ ] Environment variables set correctly
- [ ] Test phone numbers removed or secured
- [ ] Rate limiting implemented
- [ ] Error handling tested
- [ ] SMS quota sufficient for expected usage

## 6. Debugging

### Enable Debug Logging
The code includes comprehensive logging. Check browser console for:
- Firebase initialization status
- reCAPTCHA status
- Environment variable validation
- Error details with codes

### Test Firebase Configuration
In development mode, the app automatically runs configuration tests and displays results in the console.

## 7. Security Considerations

### Rate Limiting
- Firebase automatically rate limits OTP requests
- Additional client-side rate limiting is implemented
- Users are locked out after 3 failed attempts for 5 minutes

### Domain Security
- Only authorized domains can use your Firebase project
- reCAPTCHA prevents automated abuse
- Phone numbers are validated before sending OTP

### Data Protection
- Phone numbers are encrypted in transit
- No sensitive data is stored locally
- Firebase handles all security aspects of OTP delivery

## 8. Troubleshooting Commands

### Check Firebase Status
```javascript
// In browser console
console.log('Firebase initialized:', window.firebaseInitialized);
console.log('reCAPTCHA ready:', window.phoneAuthService?.isRecaptchaReady());
```

### Test Phone Number Format
```javascript
// In browser console
const testNumber = '+919876543210';
console.log('Valid format:', /^\+\d{10,15}$/.test(testNumber));
```

### Reset reCAPTCHA
```javascript
// In browser console
window.phoneAuthService?.forceReinitializeRecaptcha('recaptcha-container');
```

## 9. Support

If you continue to have issues:
1. Check the browser console for detailed error messages
2. Verify your Firebase project settings
3. Ensure your domain is properly configured
4. Test with the provided test phone numbers first