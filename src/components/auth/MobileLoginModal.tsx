import React, { useState } from 'react';
import { X, ChevronLeft } from 'lucide-react';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';
import { useConvex } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { UserOnboardingModal } from './UserOnboardingModal';
import { Id } from '../../../convex/_generated/dataModel';
import { useModalBackButton } from '../../hooks/useModalBackButton';

interface MobileLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const MobileLoginModal: React.FC<MobileLoginModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [isLoading, setIsLoading] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState<any>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [newUserId, setNewUserId] = useState<Id<"users"> | null>(null);
  const { login, setAuthenticatedUser } = useAuth();
  const convex = useConvex();

  // Handle back button for modal
  useModalBackButton({ 
    isOpen: isOpen && !showOnboarding, 
    onClose: () => {
      if (step === 'otp') {
        setStep('phone');
      } else {
        onClose();
      }
    }
  });

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullPhoneNumber = `+91${phoneNumber}`;
    
    if (!phoneNumber.trim() || phoneNumber.length < 10) {
      toast.error('Please enter a valid phone number');
      return;
    }

    setIsLoading(true);
    try {
      const result = await login(fullPhoneNumber);
      setConfirmationResult(result);
      setStep('otp');
      toast.success('OTP sent to your WhatsApp!');
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error(error.message || 'Failed to send OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    
    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpString = otp.join('');
    
    if (otpString.length !== 6) {
      toast.error('Please enter the complete OTP');
      return;
    }

    setIsLoading(true);
    console.log('🔄 MobileLoginModal: Starting OTP verification for:', otpString);
    
    try {
      // Add timeout for OTP verification
      const verificationPromise = confirmationResult.confirm(otpString);
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('OTP verification timeout')), 30000)
      );
      
      const result = await Promise.race([verificationPromise, timeoutPromise]);
      
      // Handle complete login flow
      try {
        const deviceInfo = {
          deviceType: navigator.platform || 'Unknown',
          browser: navigator.userAgent.includes('Chrome') ? 'Chrome' : 
                   navigator.userAgent.includes('Firefox') ? 'Firefox' : 
                   navigator.userAgent.includes('Safari') ? 'Safari' : 'Unknown',
          os: navigator.platform || 'Unknown',
          isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
        };
        
        const loginResult = await convex.mutation(api.auth.handleUserLogin, {
          phoneNumber: result.user.phoneNumber,
          deviceInfo,
          ipAddress: undefined,
          userAgent: navigator.userAgent,
          location: undefined,
        });
        
        const userData = {
          uid: result.user.uid,
          phoneNumber: result.user.phoneNumber,
          isAnonymous: false,
          name: loginResult.user?.name,
          fullName: loginResult.user?.fullName,
          studentId: loginResult.user?.studentId,
          email: loginResult.user?.email,
          userType: loginResult.user?.userType,
          status: loginResult.user?.status,
          city: loginResult.user?.city,
          registrationSource: loginResult.user?.registrationSource,
          lastActivity: loginResult.user?.lastActivity,
          lastLoginTime: loginResult.user?.lastLoginTime,
          createdAt: loginResult.user?.createdAt
        };
        
        if (loginResult.isFirstTimeLogin) {
          setNewUserId(loginResult.user!._id);
          setShowOnboarding(true);
          toast.success(`Welcome to Playgram! Your Student ID: ${loginResult.user?.studentId}`);
        } else {
          console.log('🔄 MobileLoginModal: Setting authenticated user and calling success');
          await setAuthenticatedUser(userData);
          toast.success('Welcome back!');
          
          // Add a small delay to ensure state updates are processed
          setTimeout(() => {
            console.log('✅ MobileLoginModal: Calling onSuccess and onClose');
            onSuccess();
            onClose();
          }, 100);
        }
      } catch (dbError) {
        console.error('❌ Error in login flow:', dbError);
        const userData = {
          uid: result.user.uid,
          phoneNumber: result.user.phoneNumber,
          isAnonymous: false
        };
        console.log('🔄 MobileLoginModal: Fallback - setting authenticated user after DB error');
        await setAuthenticatedUser(userData);
        
        // Add delay for fallback case too
        setTimeout(() => {
          console.log('✅ MobileLoginModal: Fallback - calling onSuccess and onClose');
          toast.success('Login successful!');
          onSuccess();
          onClose();
        }, 100);
      }
    } catch (error: any) {
      console.error('❌ OTP verification failed:', error);
      toast.error(error.message || 'Invalid OTP. Please try again.');
      
      // Reset OTP on error
      setOtp(['', '', '', '', '', '']);
      
      // Focus first OTP input
       setTimeout(() => {
         const firstInput = document.querySelector('input[type="text"]') as HTMLInputElement;
         if (firstInput) {
           firstInput.focus();
         }
       }, 100);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOnboardingComplete = (updatedUserData: any) => {
    if (!updatedUserData) {
      console.error('No user data received in handleOnboardingComplete');
      toast.error('Failed to complete profile. Please try again.');
      return;
    }
    
    const userData = {
      uid: updatedUserData?.uid || updatedUserData?.phone || `+91${phoneNumber}` || `aisensy_${Date.now()}`,
      phoneNumber: updatedUserData?.phone || `+91${phoneNumber}`,
      isAnonymous: false,
      name: updatedUserData?.name,
      fullName: updatedUserData?.fullName,
      studentId: updatedUserData?.studentId,
      email: updatedUserData?.email,
      userType: updatedUserData?.userType,
      status: updatedUserData?.status,
      city: updatedUserData?.city,
      registrationSource: updatedUserData?.registrationSource,
      lastActivity: updatedUserData?.lastActivity,
      lastLoginTime: updatedUserData?.lastLoginTime,
      createdAt: updatedUserData?.createdAt
    };
    
    setAuthenticatedUser(userData);
    setShowOnboarding(false);
    onSuccess();
    onClose();
  };

  const handleOnboardingClose = () => {
    setShowOnboarding(false);
    onClose();
  };

  const resetModal = () => {
    setStep('phone');
    setPhoneNumber('');
    setOtp(['', '', '', '', '', '']);
    setConfirmationResult(null);
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  if (!isOpen && !showOnboarding) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 mobile-modal" style={{ backgroundColor: '#f0f0f0' }}>
        {/* Background Image */}
        <div className="absolute inset-0 overflow-hidden">
          <img
            src="https://jenpaints.art/wp-content/uploads/2025/08/image_2025-08-31_025057715.png"
            alt="Background"
            className="absolute inset-0 w-full h-full object-cover"
            style={{
              objectPosition: 'center bottom',
              minHeight: '100%',
              minWidth: '100%'
            }}
            onError={(e) => {
              console.error('Background image failed to load:', e);
              // Fallback to a solid color
              e.currentTarget.style.display = 'none';
            }}
          />
          {/* Gradient Overlay */}
          <div 
            className="absolute inset-0 z-10"
            style={{
              background: 'linear-gradient(180.32deg, rgba(255, 255, 255, 0) 18.58%, #FFFFFF 49.62%)',
              width: '100%',
              height: '100%'
            }}
          ></div>
        </div>

        {/* Content with Safe Area */}
        <div className="relative z-20 flex flex-col h-full native-mobile-container">
          {/* Logo */}
          <div className="flex justify-center safe-area-top mt-8 mb-8 sm:mb-12">
            <img
              src="https://jenpaints.art/wp-content/uploads/2025/07/PHOTO-2025-07-05-01-14-22-removebg-preview.png"
              alt="Playgram Logo"
              className="w-48 h-12 sm:w-60 sm:h-16 object-contain"
            />
          </div>

          {/* Main Content */}
          <div className="flex-1 px-4 sm:px-6 safe-area-left safe-area-right">
            {step === 'phone' ? (
              <>
                {/* Title */}
                <div className="text-center mb-6 sm:mb-8">
                  <h1 className="text-xl sm:text-2xl font-extrabold text-black mb-2" style={{ fontFamily: 'Manrope, sans-serif' }}>
                    Unlock Your Potential
                  </h1>
                  <p className="text-sm text-gray-500" style={{ fontFamily: 'Manrope, sans-serif' }}>
                    Please enter your phone number to login.
                  </p>
                </div>

                {/* Phone Input */}
                <form onSubmit={handlePhoneSubmit}>
                  <div 
                    className="flex items-center px-3 sm:px-4 py-3 mb-4 sm:mb-6 rounded-md border mobile-form-input"
                    style={{ 
                      backgroundColor: '#F3FAFD',
                      borderColor: '#86D5F0'
                    }}
                  >
                    <span className="text-black font-medium text-base sm:text-lg mr-2 sm:mr-3">+91</span>
                    <div 
                      className="w-px h-5 sm:h-6 mr-2 sm:mr-3"
                      style={{ backgroundColor: '#86D5F0' }}
                    ></div>
                    <input
                      type="tel"
                      inputMode="numeric"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      placeholder="90876 54312"
                      className="flex-1 bg-transparent text-base sm:text-lg font-medium text-gray-400 placeholder-gray-400 outline-none mobile-focus"
                      style={{ fontFamily: 'Manrope, sans-serif' }}
                      disabled={isLoading}
                      autoComplete="tel"
                    />
                  </div>

                  {/* Terms */}
                  <p className="text-xs text-gray-500 text-center mb-6 sm:mb-8 leading-relaxed px-2" style={{ fontFamily: 'Manrope, sans-serif' }}>
                    By continuing, you confirm that you've read and agreed to our{' '}
                    <span className="underline">Terms & Conditions</span> and{' '}
                    <span className="underline">Privacy Policy</span>.
                  </p>

                  {/* Get OTP Button */}
                  <button
                    type="submit"
                    disabled={isLoading || phoneNumber.length < 10}
                    className="w-full py-3 sm:py-4 rounded-md font-semibold text-white text-base sm:text-lg disabled:opacity-50 disabled:cursor-not-allowed mobile-button haptic-feedback"
                    style={{ backgroundColor: '#E11C41' }}
                  >
                    {isLoading ? 'Sending OTP...' : 'Get OTP'}
                  </button>
                </form>
              </>
            ) : (
              <>
                {/* Back Button */}
                <button
                  onClick={() => setStep('phone')}
                  className="flex items-center gap-2 mb-4 sm:mb-6 text-gray-600"
                >
                  <ChevronLeft className="w-5 h-5" />
                  <span className="text-sm">Back</span>
                </button>

                {/* Title */}
                <div className="text-center mb-6 sm:mb-8">
                  <h1 className="text-xl sm:text-2xl font-extrabold text-black mb-2" style={{ fontFamily: 'Manrope, sans-serif' }}>
                    Enter OTP
                  </h1>
                  <p className="text-sm text-gray-500" style={{ fontFamily: 'Manrope, sans-serif' }}>
                    OTP sent to WhatsApp +91 {phoneNumber}
                  </p>
                </div>

                {/* OTP Input */}
                <form onSubmit={handleOtpSubmit}>
                  <div className="flex justify-center gap-2 sm:gap-3 mb-6 sm:mb-8">
                    {otp.map((digit, index) => (
                      <input
                        key={index}
                        id={`otp-${index}`}
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        value={digit}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                        className="w-10 h-10 sm:w-12 sm:h-12 text-center text-lg sm:text-xl font-bold border-2 rounded-lg focus:outline-none mobile-focus mobile-button"
                        style={{ borderColor: digit ? '#E11C41' : '#86D5F0' }}
                        maxLength={1}
                        disabled={isLoading}
                        autoComplete="one-time-code"
                      />
                    ))}
                  </div>

                  {/* Resend OTP */}
                  <div className="text-center mb-4 sm:mb-6">
                    <p className="text-sm text-gray-500 mb-2">Didn't receive OTP?</p>
                    <button
                      type="button"
                      className="text-sm font-medium underline"
                      style={{ color: '#E11C41' }}
                    >
                      Resend OTP
                    </button>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isLoading || otp.some(digit => !digit)}
                    className="w-full py-3 sm:py-4 rounded-md font-semibold text-white text-base sm:text-lg disabled:opacity-50 disabled:cursor-not-allowed mobile-button haptic-feedback"
                    style={{ backgroundColor: '#E11C41' }}
                  >
                    {isLoading ? 'Verifying...' : 'Submit'}
                  </button>
                </form>
              </>
            )}
          </div>

          {/* Safe Area Bottom Padding */}
          <div className="safe-area-bottom pb-4"></div>
        </div>
      </div>

      {showOnboarding && newUserId && (
        <UserOnboardingModal
          isOpen={showOnboarding}
          onClose={handleOnboardingClose}
          onComplete={handleOnboardingComplete}
          userId={newUserId}
          phoneNumber={`+91${phoneNumber}`}
        />
      )}
    </>
  );
};