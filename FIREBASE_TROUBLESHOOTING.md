# Firebase Phone Authentication Troubleshooting

## Common Issues and Solutions

### 1. `auth/invalid-app-credential` Error

This error typically occurs when:

#### **Solution A: Enable Phone Authentication in Firebase Console**
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `playgram-f78d3`
3. Navigate to **Authentication** → **Sign-in method**
4. Enable **Phone** authentication
5. Add your domain to authorized domains (if testing locally, add `localhost`)

#### **Solution B: Verify API Key Permissions**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project: `playgram-f78d3`
3. Navigate to **APIs & Services** → **Credentials**
4. Find your API key and ensure it has these APIs enabled:
   - Firebase Authentication API
   - Identity Toolkit API

#### **Solution C: Check Domain Authorization**
1. In Firebase Console → **Authentication** → **Settings** → **Authorized domains**
2. Add your domains:
   - `localhost` (for development)
   - Your production domain
   - `127.0.0.1` (if needed)

### 2. reCAPTCHA Issues

Phone authentication requires reCAPTCHA verification:

1. Ensure your domain is authorized in Firebase Console
2. Check browser console for reCAPTCHA errors
3. Try using visible reCAPTCHA for testing:
   ```typescript
   this.recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
     size: 'normal', // Change from 'invisible' to 'normal' for testing
     callback: () => console.log('reCAPTCHA solved')
   });
   ```

### 3. Development Mode

The app automatically detects development mode and uses mock authentication when:
- Running in development (`import.meta.env.DEV` is true)
- Firebase configuration is incomplete

**Test OTP in Development Mode:** `123456`

### 4. Environment Variables

Ensure all required environment variables are set in `.env.local`:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### 5. Testing Steps

1. **Check Console Logs**: Open browser dev tools and look for Firebase validation messages
2. **Test with Mock**: Ensure development mode works with OTP `123456`
3. **Verify Configuration**: Check that all environment variables are loaded correctly
4. **Test reCAPTCHA**: Try with visible reCAPTCHA first

### 6. Firebase Project Setup Checklist

- [ ] Phone authentication enabled in Firebase Console
- [ ] Domain authorized in Firebase settings
- [ ] API key has correct permissions
- [ ] Identity Toolkit API enabled in Google Cloud Console
- [ ] Environment variables correctly set
- [ ] No typos in configuration values

## Current Configuration Status

Your current Firebase configuration:
- Project ID: `playgram-f78d3`
- Auth Domain: `playgram-f78d3.firebaseapp.com`
- API Key: `AIzaSyC6gBCp_QxzFHZEq5oX93FNind0tlEnWvo`

## Quick Fix for Development

If you want to bypass Firebase issues temporarily for development:

1. The app will automatically use mock authentication
2. Use phone number: any valid format (e.g., `+911234567890`)
3. Use OTP: `123456`
4. This allows you to test the rest of the enrollment flow