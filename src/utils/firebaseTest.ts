/**
 * Firebase Test Utilities
 * Used to test Firebase configuration and authentication in development
 */

import { phoneAuthService } from '../services/firebase';
import { DevelopmentOTPService } from '../services/developmentOTP';

export async function testFirebaseConfig(): Promise<void> {
  console.group('🧪 Firebase Configuration Test');
  
  try {
    // Test 1: Check environment variables
    console.log('📋 Environment Variables:');
    console.log('- API Key:', import.meta.env.VITE_FIREBASE_API_KEY ? '✅ Set' : '❌ Missing');
    console.log('- Auth Domain:', import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ? '✅ Set' : '❌ Missing');
    console.log('- Project ID:', import.meta.env.VITE_FIREBASE_PROJECT_ID ? '✅ Set' : '❌ Missing');
    console.log('- App ID:', import.meta.env.VITE_FIREBASE_APP_ID ? '✅ Set' : '❌ Missing');
    
    // Test 2: Check reCAPTCHA initialization
    console.log('🔒 reCAPTCHA Status:');
    console.log('- Ready:', phoneAuthService.isRecaptchaReady() ? '✅ Yes' : '⚠️ Not initialized');
    
    // Test 2.5: Development OTP status
    console.log('🧪 Development OTP Status:');
    console.log('- Available:', DevelopmentOTPService.isDevelopmentMode() ? '✅ Yes' : '❌ No');
    console.log('- Valid codes:', DevelopmentOTPService.getValidCodes().join(', '));
    
    // Test 3: Test phone number validation
    console.log('📱 Phone Number Validation:');
    const testNumbers = [
      '+919876543210', // Valid Indian number
      '+1234567890',   // Valid US number (mock)
      '+44123456789',  // Valid UK number (mock)
    ];
    
    testNumbers.forEach(number => {
      const isValid = /^\+\d{10,15}$/.test(number);
      console.log(`- ${number}:`, isValid ? '✅ Valid format' : '❌ Invalid format');
    });
    
    console.log('✅ Firebase test completed');
    
  } catch (error) {
    console.error('❌ Firebase test failed:', error);
  }
  
  console.groupEnd();
}

export function createTestPhoneNumber(): string {
  // Generate a test phone number for development
  const testNumbers = [
    '+919876543210',
    '+1234567890',
    '+447123456789',
    '+61412345678',
    '+971501234567'
  ];
  
  return testNumbers[Math.floor(Math.random() * testNumbers.length)];
}

export function isTestPhoneNumber(phoneNumber: string): boolean {
  const testNumbers = [
    '+919876543210',
    '+1234567890',
    '+447123456789',
    '+61412345678',
    '+971501234567'
  ];
  
  return testNumbers.includes(phoneNumber);
}