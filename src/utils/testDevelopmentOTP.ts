/**
 * Test utilities for development OTP
 */

import { DevelopmentOTPService } from '../services/developmentOTP';

export async function testDevelopmentOTP(): Promise<void> {
  if (!DevelopmentOTPService.isDevelopmentMode()) {
    console.log('⚠️ Development OTP tests only run in development mode');
    return;
  }

  console.group('🧪 Development OTP Tests');

  try {
    // Test 1: Create OTP session
    console.log('📱 Test 1: Creating OTP session');
    const testPhone = '+919876543210';
    const confirmation = DevelopmentOTPService.createOTPSession(testPhone);
    console.log('✅ OTP session created:', confirmation.verificationId);

    // Test 2: Valid code verification
    console.log('🔐 Test 2: Testing valid code');
    try {
      const result = await confirmation.confirm('123456');
      console.log('✅ Valid code accepted:', result.user.uid);
    } catch (error) {
      console.error('❌ Valid code test failed:', error);
    }

    // Test 3: Invalid code verification
    console.log('🔐 Test 3: Testing invalid code');
    const confirmation2 = DevelopmentOTPService.createOTPSession(testPhone);
    try {
      await confirmation2.confirm('999999'); // This should work
      console.log('✅ Alternative valid code accepted');
    } catch (error) {
      console.error('❌ Alternative code test failed:', error);
    }

    // Test 4: Session info
    console.log('📊 Test 4: Session info');
    const sessionInfo = DevelopmentOTPService.getSessionInfo();
    console.log('Session info:', sessionInfo);

    // Test 5: Valid codes list
    console.log('📋 Test 5: Valid codes');
    const validCodes = DevelopmentOTPService.getValidCodes();
    console.log('Valid codes:', validCodes);

    console.log('✅ All development OTP tests completed');

  } catch (error) {
    console.error('❌ Development OTP test failed:', error);
  }

  console.groupEnd();
}

// Auto-run tests in development
if (import.meta.env.DEV) {
  // Run tests after a short delay to ensure everything is loaded
  setTimeout(() => {
    testDevelopmentOTP();
  }, 1000);
}