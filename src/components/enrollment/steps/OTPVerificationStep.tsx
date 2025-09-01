import React, { useState, useEffect, useRef } from 'react';

interface OTPVerificationStepProps {
  phoneNumber: string;
  onOTPVerify: (otp: string) => void;
  onResendOTP: () => void;
  isLoading?: boolean;
  error?: string;
  onBack: () => void;
}

export const OTPVerificationStep: React.FC<OTPVerificationStepProps> = ({
  phoneNumber,
  onOTPVerify,
  onResendOTP,
  isLoading = false,
  error,
  onBack
}) => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timeLeft, setTimeLeft] = useState(60); // 60 seconds countdown
  const [canResend, setCanResend] = useState(false);
  const [attemptCount, setAttemptCount] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockTimeLeft, setLockTimeLeft] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const MAX_ATTEMPTS = 3;
  const LOCKOUT_DURATION = 300; // 5 minutes in seconds

  // Countdown timer for resend
  useEffect(() => {
    if (timeLeft > 0 && !canResend) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      setCanResend(true);
    }
  }, [timeLeft, canResend]);

  // Lockout timer
  useEffect(() => {
    if (lockTimeLeft > 0) {
      const timer = setTimeout(() => setLockTimeLeft(lockTimeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (lockTimeLeft === 0 && isLocked) {
      setIsLocked(false);
      setAttemptCount(0);
    }
  }, [lockTimeLeft, isLocked]);

  // Auto-focus first input on mount
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleInputChange = (index: number, value: string) => {
    // Only allow single digit
    if (value.length > 1) return;

    // Only allow numbers
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Handle backspace
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }

    // Handle paste
    if (e.key === 'v' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      navigator.clipboard.readText().then(text => {
        const digits = text.replace(/\D/g, '').slice(0, 6);
        if (digits.length === 6) {
          const newOtp = digits.split('');
          setOtp(newOtp);
          inputRefs.current[5]?.focus();
        }
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (isLocked) return;

    const otpString = otp.join('');
    if (otpString.length !== 6) {
      return;
    }

    // Increment attempt count
    const newAttemptCount = attemptCount + 1;
    setAttemptCount(newAttemptCount);

    // Check if we should lock after this attempt
    if (newAttemptCount >= MAX_ATTEMPTS) {
      setIsLocked(true);
      setLockTimeLeft(LOCKOUT_DURATION);
    }

    onOTPVerify(otpString);
  };

  const handleResend = () => {
    if (!canResend || isLocked) return;

    setTimeLeft(60);
    setCanResend(false);
    setOtp(['', '', '', '', '', '']);
    onResendOTP();

    // Focus first input after resend
    setTimeout(() => {
      inputRefs.current[0]?.focus();
    }, 100);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const maskedPhoneNumber = phoneNumber.replace(/(\+\d{1,3})\d+(\d{4})/, '$1****$2');

  return (
    <div className="w-full max-w-md mx-auto p-6">
      {/* Logo Section */}
      <div className="text-center mb-8">
        <div className="mb-6">
          <img
            src="https://jenpaints.art/wp-content/uploads/2025/08/Screenshot_2025-07-13_at_22.16.29-removebg-preview.png"
            alt="PlayGram Logo"
            className="h-16 w-auto mx-auto"
          />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-3">
          Verify Your WhatsApp Number
        </h2>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
          <div className="flex items-center space-x-2 mb-2">
            <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
            </svg>
            <p className="text-gray-700 text-sm font-medium">
              We've sent a 6-digit code via AISensy WhatsApp to
            </p>
          </div>
          <p className="font-semibold text-green-900 text-lg">
            {maskedPhoneNumber}
          </p>
        </div>
      </div>

      {isLocked && (
        <div className="mb-6 p-4 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-lg shadow-sm">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <svg className="w-6 h-6 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-red-800 font-semibold text-sm">Account Temporarily Locked</p>
              <p className="text-red-600 text-sm mt-1">
                Too many failed attempts. Try again in <span className="font-mono font-semibold">{formatTime(lockTimeLeft)}</span>
              </p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* OTP Input Fields */}
        <div className="flex justify-center space-x-3 mb-6">
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={el => { inputRefs.current[index] = el; }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={e => handleInputChange(index, e.target.value)}
              onKeyDown={e => handleKeyDown(index, e)}
              disabled={isLoading || isLocked}
              className={`w-14 h-14 text-center text-xl font-bold border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-sm ${digit
                ? 'border-blue-500 bg-blue-50 text-blue-900 shadow-md transform scale-105'
                : 'border-gray-300 bg-white hover:border-gray-400'
                } ${isLocked ? 'bg-gray-100 cursor-not-allowed opacity-50' : 'hover:shadow-md'}`}
            />
          ))}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div className="text-center flex-1">
                <p className="text-red-700 text-sm font-medium">{error}</p>
                {attemptCount > 0 && attemptCount < MAX_ATTEMPTS && (
                  <p className="mt-1 text-red-600 text-xs">
                    {MAX_ATTEMPTS - attemptCount} attempt{MAX_ATTEMPTS - attemptCount !== 1 ? 's' : ''} remaining
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full bg-transparent border-2 border-black font-semibold py-3 px-6 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed mb-4 focus:outline-none focus:ring-2 focus:ring-black focus:ring-opacity-50"
          disabled={isLoading || otp.join('').length !== 6 || isLocked}
          style={{
            color: 'black'
          }}
          onMouseEnter={(e) => {
            if (!e.currentTarget.disabled) {
              e.currentTarget.style.backgroundColor = 'black';
              e.currentTarget.style.color = 'white';
              e.currentTarget.style.borderColor = 'black';
            }
          }}
          onMouseLeave={(e) => {
            if (!e.currentTarget.disabled) {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = 'black';
              e.currentTarget.style.borderColor = 'black';
            }
          }}
        >
          {isLoading ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
              <span>Verifying...</span>
            </div>
          ) : (
            <span>Verify Code</span>
          )}
        </button>

        {/* Resend Section */}
        <div className="text-center space-y-3">
          <div className="flex items-center justify-center space-x-4">
            {!canResend ? (
              <div className="flex items-center space-x-2 text-gray-600 text-sm">
                <svg className="w-4 h-4 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Resend code in <span className="font-mono font-semibold">{timeLeft}s</span></span>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleResend}
                disabled={isLocked}
                className="flex items-center justify-center space-x-3 bg-green-50 border border-green-200 hover:border-green-300 text-green-700 hover:text-green-900 text-sm font-medium disabled:text-gray-400 disabled:cursor-not-allowed transition-all duration-200 hover:bg-green-100 hover:shadow-md px-4 py-3 rounded-lg min-w-[200px]"
              >
                <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                </svg>
                <span>Send WhatsApp Code</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={onBack}
            className="flex items-center justify-center space-x-2 w-full text-gray-600 hover:text-gray-800 text-sm hover:bg-gray-50 py-2 px-4 rounded-lg transition-colors duration-200"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span>Change Phone Number</span>
          </button>
        </div>
      </form>

      {/* Help Text */}
      <div className="mt-6 text-center space-y-3">
        <div className="flex items-center justify-center space-x-2 text-xs text-gray-500">
          <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
          </svg>
          <span>Didn't receive the code? Check your AISensy WhatsApp messages</span>
        </div>
        <div className="flex items-center justify-center space-x-2 text-xs text-gray-500">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <span>Your verification is secure and encrypted</span>
        </div>
        {import.meta.env.DEV && (
          <div className="mt-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <span className="text-lg">🧪</span>
              <div className="text-left">
                <p className="text-sm text-green-800 font-semibold">Development Mode Active</p>
                <p className="text-xs text-green-700 mt-1">
                  The OTP code was shown in a popup alert when you requested it. If you missed it, check the browser console or request a new code.
                </p>
                <p className="text-xs text-green-600 mt-1">
                  In production, users will receive the OTP via AISensy WhatsApp message.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    // Check AISensy OTP sessions
                    const keys = Object.keys(localStorage);
                    const aisensyOtpKeys = keys.filter(key => key.startsWith('aisensy_otp_sessions'));
                    
                    if (aisensyOtpKeys.length > 0) {
                      const sessionData = localStorage.getItem(aisensyOtpKeys[0]);
                      if (sessionData) {
                        const sessions = JSON.parse(sessionData);
                        const session = Object.values(sessions)[0] as any;
                        if (session) {
                          alert(`🔑 Current AISensy OTP Code: ${session.otpCode}\nPhone: ${session.phoneNumber}`);
                        } else {
                          alert('❌ No active AISensy OTP session found. Please request a new code.');
                        }
                      } else {
                        alert('❌ No active AISensy OTP session found. Please request a new code.');
                      }
                    } else {
                      alert('❌ No AISensy OTP sessions found. Please request a new code.');
                    }
                  }}
                  className="mt-2 px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors"
                >
                  Show Current OTP
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};