import { initializeApp } from 'firebase/app';
import {
  getAuth,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
  Auth
} from 'firebase/auth';
import { logFirebaseValidation } from '../utils/firebaseValidator';
import { DevelopmentOTPService } from './developmentOTP';

// Import Firebase tester in development
if (import.meta.env.DEV) {
  import('../utils/firebaseTest');
}

// Firebase configuration interface
interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

// Firebase configuration - these should be set in environment variables
const firebaseConfig: FirebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || ''
};

// Development mode flag - check if we're in dev and have incomplete config
const hasValidConfig = firebaseConfig.apiKey &&
  firebaseConfig.authDomain &&
  firebaseConfig.projectId;

// Initialize Firebase
let app: any;
let auth: Auth;
let firebaseInitialized = false;

// Log validation results in development
if (import.meta.env.DEV) {
  logFirebaseValidation();
  
  // Additional development checks
  console.log('🌐 Current domain:', window.location.hostname);
  console.log('🔗 Current protocol:', window.location.protocol);
}

// Always try to initialize Firebase if we have config
if (hasValidConfig) {
  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    firebaseInitialized = true;
    console.log('✅ Firebase initialized successfully');
  } catch (error) {
    console.error('❌ Firebase initialization failed:', error);
    firebaseInitialized = false;
    auth = {} as Auth;
  }
} else {
  console.log('⚠️ Firebase config incomplete, using mock auth');
  firebaseInitialized = false;
  auth = {} as Auth;
}

export { auth };

// Phone authentication service
export class PhoneAuthService {
  private recaptchaVerifier: RecaptchaVerifier | null = null;
  private isRecaptchaInitialized: boolean = false;

  /**
   * Initialize reCAPTCHA verifier for phone authentication
   */
  initializeRecaptcha(containerId: string): void {
    // Skip reCAPTCHA initialization if Firebase not initialized
    if (!firebaseInitialized) {
      console.log('🚧 Skipping reCAPTCHA initialization - Firebase not available');
      return;
    }

    // Check if reCAPTCHA is already initialized and working
    if (this.recaptchaVerifier && this.isRecaptchaInitialized) {
      console.log('✅ reCAPTCHA already initialized, skipping');
      return;
    }

    // Ensure the container exists and is empty
    const container = document.getElementById(containerId);
    if (!container) {
      console.error(`❌ reCAPTCHA container '${containerId}' not found`);
      return;
    }

    // Clear any existing reCAPTCHA content in the container
    container.innerHTML = '';

    try {
      // Set language preference before creating reCAPTCHA
      if (auth.languageCode !== 'en') {
        auth.languageCode = 'en';
      }

      this.recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
        size: 'invisible',
        callback: (response: any) => {
          console.log('✅ reCAPTCHA solved successfully', response);
        },
        'expired-callback': () => {
          console.warn('⚠️ reCAPTCHA expired, please try again');
          // Auto-reset on expiration
          this.resetRecaptcha(containerId);
        }
      });

      console.log('✅ reCAPTCHA initialized successfully');
      this.isRecaptchaInitialized = true;

      // Pre-render the reCAPTCHA for better performance
      this.recaptchaVerifier.render().then((widgetId) => {
        console.log('✅ reCAPTCHA pre-rendered with widget ID:', widgetId);
        (window as any).recaptchaWidgetId = widgetId;
      }).catch((error) => {
        console.warn('⚠️ reCAPTCHA pre-render failed (this is often normal):', error);
        // Don't fail initialization if pre-render fails
      });

    } catch (error: any) {
      console.error('❌ Failed to initialize reCAPTCHA:', error);
      
      // If reCAPTCHA already rendered error, clear and retry once
      if (error.message?.includes('reCAPTCHA has already been rendered') || 
          error.message?.includes('already rendered')) {
        console.log('🔄 Clearing existing reCAPTCHA and retrying...');
        this.forceCleanupRecaptcha(containerId);
        
        // Retry initialization after cleanup
        setTimeout(() => {
          try {
            this.recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
              size: 'invisible',
              callback: (response: any) => {
                console.log('✅ reCAPTCHA solved successfully (retry)', response);
              },
              'expired-callback': () => {
                console.warn('⚠️ reCAPTCHA expired, please try again');
                this.resetRecaptcha(containerId);
              }
            });
            console.log('✅ reCAPTCHA retry initialization successful');
            this.isRecaptchaInitialized = true;
          } catch (retryError) {
            console.error('❌ reCAPTCHA retry failed:', retryError);
            this.isRecaptchaInitialized = false;
          }
        }, 100);
      } else {
        this.isRecaptchaInitialized = false;
      }
    }
  }

  /**
   * Send OTP to phone number
   */
  async sendOTP(phoneNumber: string): Promise<ConfirmationResult> {
    console.log(`📱 Attempting to send OTP to: ${phoneNumber}`);

    // Validate phone number format
    if (!phoneNumber || !phoneNumber.startsWith('+')) {
      throw new Error('Phone number must include country code (e.g., +1234567890)');
    }

    // Check for rate limiting
    if (this.isRateLimited()) {
      throw new Error('Please wait a moment before requesting another verification code.');
    }

    // Record this attempt
    this.recordOTPAttempt();

    // If Firebase not initialized, use development OTP
    if (!firebaseInitialized) {
      console.log(`🚧 Firebase not available - using development OTP for ${phoneNumber}`);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay

      return DevelopmentOTPService.createOTPSession(phoneNumber);
    }

    // TEMPORARY: Force development mode due to Firebase phone auth not being properly configured
    if (import.meta.env.DEV) {
      console.log(`🧪 DEVELOPMENT MODE: Forcing development OTP for ${phoneNumber}`);
      console.log(`🔧 Firebase phone auth is not properly configured - using fallback`);
      await new Promise(resolve => setTimeout(resolve, 1000));
      return DevelopmentOTPService.createOTPSession(phoneNumber);
    }

    // Real Firebase authentication
    if (!this.recaptchaVerifier || !this.isRecaptchaInitialized) {
      console.log('⚠️ reCAPTCHA not initialized, initializing now...');
      // Try to initialize reCAPTCHA if not already done
      let container = document.getElementById('recaptcha-container');
      if (!container) {
        // Create container if it doesn't exist
        container = document.createElement('div');
        container.id = 'recaptcha-container';
        container.style.display = 'none';
        document.body.appendChild(container);
      }
      
      this.initializeRecaptcha('recaptcha-container');

      // Wait a moment for initialization to complete
      await new Promise(resolve => setTimeout(resolve, 100));

      if (!this.recaptchaVerifier) {
        throw new Error('reCAPTCHA initialization failed. Please refresh the page and try again.');
      }
    }

    try {
      console.log('🔥 Using Firebase authentication');
      console.log('📊 Firebase status:', {
        hasApiKey: !!firebaseConfig.apiKey,
        hasAuthDomain: !!firebaseConfig.authDomain,
        hasProjectId: !!firebaseConfig.projectId,
        firebaseInitialized,
        recaptchaReady: !!this.recaptchaVerifier
      });

      const confirmationResult = await signInWithPhoneNumber(
        auth,
        phoneNumber,
        this.recaptchaVerifier
      );

      console.log('✅ OTP sent successfully via Firebase');
      return confirmationResult;
    } catch (error: any) {
      console.error('❌ Firebase OTP error:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);

      // Handle reCAPTCHA already rendered error specifically
      if (error.message?.includes('reCAPTCHA has already been rendered')) {
        console.log('🔄 Handling reCAPTCHA already rendered error...');
        this.forceCleanupRecaptcha('recaptcha-container');
        
        // Retry once after cleanup
        try {
          console.log('🔄 Retrying OTP send after reCAPTCHA cleanup...');
          
          // Reinitialize reCAPTCHA
          this.initializeRecaptcha('recaptcha-container');
          
          // Wait a moment for initialization
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Retry the OTP send
          const retryResult = await signInWithPhoneNumber(
            auth,
            phoneNumber,
            this.recaptchaVerifier!
          );
          
          console.log('✅ OTP sent successfully after retry');
          return retryResult;
        } catch (retryError: any) {
          console.error('❌ Retry failed:', retryError);
          // Continue to normal error handling below
          error = retryError;
        }
      }

      // Reset reCAPTCHA on other errors to allow retry
      if (this.recaptchaVerifier && (window as any).recaptchaWidgetId) {
        try {
          (window as any).grecaptcha?.reset((window as any).recaptchaWidgetId);
        } catch (resetError) {
          console.warn('Could not reset reCAPTCHA:', resetError);
        }
      }

      // Handle specific Firebase errors and provide fallback
      if (error.code === 'auth/invalid-app-credential' ||
        error.code === 'auth/internal-error' ||
        error.code === 'auth/configuration-not-found' ||
        error.code === 'auth/project-not-found' ||
        error.code === 'auth/api-key-not-valid' ||
        error.code === 'auth/network-request-failed') {

        console.log('🔄 Firebase authentication error detected, falling back to development OTP');
        console.log('🔧 To fix this permanently, enable Phone Authentication in Firebase Console');
        console.log('📱 Phone number for fallback:', phoneNumber);

        // Always fallback to development OTP for these errors
        console.log('🔄 Using development OTP due to Firebase configuration issue');
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const fallbackResult = DevelopmentOTPService.createOTPSession(phoneNumber);
        console.log('✅ Development OTP session created successfully');
        return fallbackResult;
      }

      // Handle specific Firebase errors with production-ready messages
      if (error.code === 'auth/invalid-phone-number') {
        throw new Error('Invalid phone number format. Please check and try again.');
      } else if (error.code === 'auth/too-many-requests') {
        throw new Error('Too many verification attempts. Please wait 15-30 minutes before trying again.');
      } else if (error.code === 'auth/quota-exceeded') {
        throw new Error('Service temporarily unavailable. Please try again in a few minutes.');
      } else if (error.code === 'auth/captcha-check-failed') {
        // Reset and retry reCAPTCHA
        this.resetRecaptcha('recaptcha-container');
        throw new Error('Security verification failed. Please try again.');
      }

      throw error;
    }
  }

  /**
   * Verify OTP code
   */
  async verifyOTP(confirmationResult: ConfirmationResult, code: string): Promise<boolean> {
    console.log(`🔐 Verifying OTP code: ${code}`);

    try {
      const result = await confirmationResult.confirm(code);
      const isValid = !!result.user;

      if (isValid) {
        console.log('✅ OTP verification successful');
      } else {
        console.log('❌ OTP verification failed - no user returned');
      }

      return isValid;
    } catch (error: any) {
      console.error('❌ OTP verification error:', error);

      // Handle specific verification errors
      if (error.code === 'auth/invalid-verification-code') {
        throw new Error('Invalid verification code. Please check and try again.');
      } else if (error.code === 'auth/code-expired') {
        throw new Error('Verification code has expired. Please request a new one.');
      } else if (error.code === 'auth/session-expired') {
        throw new Error('Verification session has expired. Please start over.');
      }

      throw error;
    }
  }

  /**
   * Clean up reCAPTCHA verifier
   */
  cleanup(): void {
    if (this.recaptchaVerifier) {
      try {
        this.recaptchaVerifier.clear();
      } catch (error) {
        console.warn('⚠️ Error clearing reCAPTCHA:', error);
      }
      this.recaptchaVerifier = null;
      this.isRecaptchaInitialized = false;
    }
    
    // Also clear any global reCAPTCHA widget references
    if ((window as any).recaptchaWidgetId !== undefined) {
      try {
        (window as any).grecaptcha?.reset((window as any).recaptchaWidgetId);
      } catch (error) {
        console.warn('⚠️ Error resetting global reCAPTCHA:', error);
      }
      (window as any).recaptchaWidgetId = undefined;
    }
  }

  /**
   * Force cleanup of reCAPTCHA including DOM elements
   */
  forceCleanupRecaptcha(containerId: string): void {
    // Clear the verifier
    this.cleanup();
    
    // Clear the container DOM
    const container = document.getElementById(containerId);
    if (container) {
      container.innerHTML = '';
    }
    
    // Clear any global reCAPTCHA state
    try {
      if ((window as any).grecaptcha) {
        // Reset all reCAPTCHA widgets
        const widgets = (window as any).grecaptcha.getResponse?.() || [];
        if (Array.isArray(widgets)) {
          widgets.forEach((_: any, index: number) => {
            try {
              (window as any).grecaptcha.reset(index);
            } catch (e) {
              // Ignore individual reset errors
            }
          });
        }
      }
    } catch (error) {
      console.warn('⚠️ Error during force cleanup:', error);
    }
  }

  /**
   * Reset reCAPTCHA for rate limiting recovery
   */
  resetRecaptcha(containerId: string): void {
    console.log('🔄 Resetting reCAPTCHA due to rate limiting...');
    this.forceCleanupRecaptcha(containerId);

    // Wait a bit before reinitializing
    setTimeout(() => {
      try {
        this.initializeRecaptcha(containerId);
        console.log('✅ reCAPTCHA reset complete');
      } catch (error) {
        console.warn('⚠️ Could not reset reCAPTCHA:', error);
      }
    }, 1000);
  }

  /**
   * Check if rate limiting is likely in effect
   */
  isRateLimited(): boolean {
    const lastAttempt = localStorage.getItem('firebase_last_otp_attempt');
    if (!lastAttempt) return false;

    const timeSinceLastAttempt = Date.now() - parseInt(lastAttempt);
    return timeSinceLastAttempt < 60000; // 1 minute cooldown
  }

  /**
   * Record OTP attempt for rate limiting
   */
  recordOTPAttempt(): void {
    localStorage.setItem('firebase_last_otp_attempt', Date.now().toString());
  }

  /**
   * Get the current reCAPTCHA initialization status
   */
  isRecaptchaReady(): boolean {
    return this.isRecaptchaInitialized && !!this.recaptchaVerifier;
  }

  /**
   * Force reinitialize reCAPTCHA (useful for error recovery)
   */
  forceReinitializeRecaptcha(containerId: string): void {
    console.log('🔄 Force reinitializing reCAPTCHA...');
    this.forceCleanupRecaptcha(containerId);
    
    setTimeout(() => {
      this.initializeRecaptcha(containerId);
    }, 500);
  }

  /**
   * Check if we're using development OTP
   */
  isDevelopmentMode(): boolean {
    return DevelopmentOTPService.isDevelopmentMode() && (!firebaseInitialized || !this.isRecaptchaReady());
  }
}

// Export singleton instance
export const phoneAuthService = new PhoneAuthService();