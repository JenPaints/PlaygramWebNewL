import React, { useState } from 'react';
import { X, Phone, Shield } from 'lucide-react';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';
import { useConvex } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { UserOnboardingModal } from './UserOnboardingModal';
import { Id } from '../../../convex/_generated/dataModel';
import { useModalBackButton } from '../../hooks/useModalBackButton';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [phoneNumber, setPhoneNumber] = useState('+91 ');
  const [otp, setOtp] = useState('');
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
    if (!phoneNumber.trim() || phoneNumber.trim() === '+91') {
      toast.error('Please enter your phone number');
      return;
    }

    setIsLoading(true);
    try {
      const result = await login(phoneNumber);
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

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp.trim()) {
      toast.error('Please enter the OTP');
      return;
    }

    setIsLoading(true);
    try {
      const result = await confirmationResult.confirm(otp);
      
      // Handle complete login flow - create/update user, assign student ID, track login
      try {
        // Get device and location info
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
          ipAddress: undefined, // Could be obtained from a service
          userAgent: navigator.userAgent,
          location: undefined, // Could be obtained from geolocation API
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
        
        // Handle first-time vs returning users
         if (loginResult.isFirstTimeLogin) {
           // Show onboarding modal for first-time users
           setNewUserId(loginResult.user!._id);
           setShowOnboarding(true);
           toast.success(`Welcome to Playgram! Your Student ID: ${loginResult.user?.studentId}`);
         } else {
           // Set user in auth context for returning users
           setAuthenticatedUser(userData);
           toast.success('Welcome back!');
           onSuccess();
           onClose();
         }
      } catch (dbError) {
        console.error('Error in login flow:', dbError);
        // Fallback to basic user data
        const userData = {
          uid: result.user.uid,
          phoneNumber: result.user.phoneNumber,
          isAnonymous: false
        };
        setAuthenticatedUser(userData);
        toast.success('Login successful!');
        onSuccess();
        onClose();
      }
    } catch (error: any) {
      console.error('OTP verification error:', error);
      toast.error(error.message || 'Invalid OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOnboardingComplete = (updatedUserData: any) => {
    // Add null check to prevent errors
    if (!updatedUserData) {
      console.error('No user data received in handleOnboardingComplete');
      toast.error('Failed to complete profile. Please try again.');
      return;
    }
    
    // Set the complete user data in auth context
    // For AISensy login, use phone number as uid since there's no Firebase user
    const userData = {
      uid: updatedUserData?.uid || updatedUserData?.phone || phoneNumber || `aisensy_${Date.now()}`,
      phoneNumber: updatedUserData?.phone || phoneNumber,
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
    setPhoneNumber('+91 ');
    setOtp('');
    setConfirmationResult(null);
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  if (!isOpen && !showOnboarding) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full p-6 relative">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X size={24} />
        </button>

        <div className="text-center mb-6">
          <div className="w-20 h-20 mx-auto mb-4 relative flex items-center justify-center">
            {/* PlayGram Logo */}
            <img
              src="https://jenpaints.art/wp-content/uploads/2025/08/Screenshot_2025-07-13_at_22.16.29-removebg-preview.png"
              alt="PlayGram Logo"
              className="w-16 h-16 object-contain"
            />
          </div>
          <h2 className="text-2xl font-bold mb-2 text-gray-900" style={{ fontFamily: 'Manrope, sans-serif' }}>
            {step === 'phone' ? 'Login to Playgram' : 'Verify OTP'}
          </h2>
          <p className="text-gray-600">
            {step === 'phone' 
              ? 'Enter your phone number to get started'
              : 'Enter the OTP sent to your WhatsApp'
            }
          </p>
        </div>

        {step === 'phone' ? (
          <form onSubmit={handlePhoneSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => {
                    const value = e.target.value;
                    // Ensure +91 prefix is always present
                    if (!value.startsWith('+91')) {
                      setPhoneNumber('+91 ' + value.replace(/^\+?91\s*/, ''));
                    } else {
                      setPhoneNumber(value);
                    }
                  }}
                  onKeyDown={(e) => {
                    // Prevent deletion of +91 prefix
                    if ((e.key === 'Backspace' || e.key === 'Delete') && 
                        phoneNumber.length <= 4 && phoneNumber.startsWith('+91')) {
                      e.preventDefault();
                    }
                  }}
                  placeholder="+91 9876543210"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  disabled={isLoading}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-transparent border-2 border-blue-400 text-blue-600 py-3 rounded-lg font-medium hover:bg-blue-400/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
            >
              {isLoading ? 'Sending OTP...' : 'Send OTP'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleOtpSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Enter OTP
              </label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="123456"
                maxLength={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 text-center text-lg tracking-widest"
                disabled={isLoading}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-transparent border-2 border-blue-400 text-blue-600 py-3 rounded-lg font-medium hover:bg-blue-400/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
            >
              {isLoading ? 'Verifying...' : 'Verify OTP'}
            </button>

            <button
              type="button"
              onClick={() => setStep('phone')}
              className="w-full py-2 text-sm hover:underline font-medium"
              style={{
                background: 'linear-gradient(135deg, #E11C41 0%, #86D5F0 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}
            >
              Change Phone Number
            </button>
          </form>
        )}
      </div>
      
      {showOnboarding && newUserId && (
        <UserOnboardingModal
          isOpen={showOnboarding}
          onClose={handleOnboardingClose}
          onComplete={handleOnboardingComplete}
          userId={newUserId}
          phoneNumber={phoneNumber}
        />
      )}
    </div>
  );
};