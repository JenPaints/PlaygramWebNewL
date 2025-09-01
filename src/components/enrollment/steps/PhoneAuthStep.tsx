import React, { useState, useEffect } from 'react';
import { ConfirmationResult } from 'firebase/auth';
import { aisensyOTPService } from '../../../services/aisensyOTP';
import { PhoneInputStep } from './PhoneInputStep';
import { OTPVerificationStep } from './OTPVerificationStep';
import { EnrollmentState } from '../types';

interface PhoneAuthStepProps {
  onNext: () => void;
  onBack?: () => void;
  enrollmentState: EnrollmentState;
  updateState: (updates: Partial<EnrollmentState>) => void;
}

type AuthState = 'phone-input' | 'otp-verification';

export const PhoneAuthStep: React.FC<PhoneAuthStepProps> = ({
  onNext,
  enrollmentState,
  updateState
}) => {
  const [authState, setAuthState] = useState<AuthState>('phone-input');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Initialize AISensy OTP service when component mounts
  useEffect(() => {
    console.log('🚀 Initializing AISensy OTP service');
    aisensyOTPService.initialize();
  }, []);

  const handlePhoneSubmit = async (phone: string) => {
    setIsLoading(true);
    setError('');

    try {
      // Check rate limiting for AISensy
      if (aisensyOTPService.isRateLimited(phone)) {
        setError('Please wait a minute before requesting another OTP.');
        return;
      }

      const confirmation = await aisensyOTPService.sendOTP(phone);
      setConfirmationResult(confirmation);
      setPhoneNumber(phone);
      setAuthState('otp-verification');

      console.log('✅ AISensy WhatsApp OTP sent successfully');
    } catch (err: any) {
      console.error('Error sending AISensy WhatsApp OTP:', err);
      console.error('Error code:', err.code);
      console.error('Error message:', err.message);

      // Handle specific errors
      let errorMessage = 'Failed to send AISensy WhatsApp verification code. Please try again.';

      if (err.code === 'auth/invalid-phone-number') {
        errorMessage = 'Invalid phone number format. Please check and try again.';
      } else if (err.code === 'auth/too-many-requests') {
        errorMessage = 'Too many verification attempts. Please wait a minute before trying again.';
      } else if (err.code === 'auth/network-request-failed') {
        errorMessage = 'Network error. Please check your connection and try again.';
      } else if (err.code === 'auth/internal-error') {
        errorMessage = 'Service temporarily unavailable. Please try again in a few minutes.';
      }

      setError(errorMessage);
      updateState({
        errors: {
          ...enrollmentState.errors,
          auth: errorMessage
        }
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOTPVerify = async (otp: string) => {
    if (!confirmationResult) {
      setError('No verification session found. Please try again.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const result = await confirmationResult.confirm(otp);

      if (result?.user) {
        console.log('✅ AISensy WhatsApp OTP verification successful');
        updateState({
          userPhone: phoneNumber,
          isAuthenticated: true,
          enrollmentData: {
            ...enrollmentState.enrollmentData,
            phoneNumber: phoneNumber
          },
          errors: {
            ...enrollmentState.errors,
            auth: ''
          }
        });
        onNext();
      } else {
        setError('Invalid AISensy verification code. Please try again.');
      }
    } catch (err: any) {
      console.error('Error verifying AISensy WhatsApp OTP:', err);

      let errorMessage = 'Invalid AISensy verification code. Please try again.';

      if (err.code === 'auth/invalid-verification-code') {
        errorMessage = 'Invalid verification code. Please check and try again.';
      } else if (err.code === 'auth/code-expired') {
        errorMessage = 'Verification code has expired. Please request a new one.';
      } else if (err.code === 'auth/too-many-requests') {
        errorMessage = 'Too many verification attempts. Please wait before trying again.';
      }

      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (!phoneNumber) return;

    setIsLoading(true);
    setError('');

    try {
      // Check rate limiting for AISensy
      if (aisensyOTPService.isRateLimited(phoneNumber)) {
        setError('Please wait a minute before requesting another OTP.');
        return;
      }

      const confirmation = await aisensyOTPService.sendOTP(phoneNumber);
      setConfirmationResult(confirmation);
      console.log('✅ AISensy WhatsApp OTP resent successfully');
    } catch (err: any) {
      console.error('Error resending AISensy WhatsApp OTP:', err);

      let errorMessage = 'Failed to resend AISensy WhatsApp verification code. Please try again.';
      if (err.code === 'auth/too-many-requests') {
        errorMessage = 'Please wait a minute before requesting another verification code.';
      }

      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToPhoneInput = () => {
    setAuthState('phone-input');
    setError('');
    setConfirmationResult(null);
  };

  if (authState === 'otp-verification') {
    return (
      <OTPVerificationStep
        phoneNumber={phoneNumber}
        onOTPVerify={handleOTPVerify}
        onResendOTP={handleResendOTP}
        onBack={handleBackToPhoneInput}
        isLoading={isLoading}
        error={error}
      />
    );
  }

  return (
    <PhoneInputStep
      onPhoneSubmit={handlePhoneSubmit}
      isLoading={isLoading}
      error={error}
    />
  );
};