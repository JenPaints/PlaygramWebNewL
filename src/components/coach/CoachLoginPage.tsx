import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Phone, Shield, ArrowLeft } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { toast } from 'sonner';
import { useConvex } from 'convex/react';
import { api } from '../../../convex/_generated/api';

interface CoachLoginPageProps {
  onBack: () => void;
  onSuccess: () => void;
}

export const CoachLoginPage: React.FC<CoachLoginPageProps> = ({ onBack, onSuccess }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [isLoading, setIsLoading] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState<any>(null);
  const { login, setAuthenticatedUser } = useAuth();
  const convex = useConvex();

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber.trim()) {
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
      
      // Handle coach login flow
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
        
        // Check if user is a coach
        if (loginResult.user?.userType !== 'coach') {
          toast.error('Access denied. This login is for coaches only.');
          return;
        }
        
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
        
        setAuthenticatedUser(userData);
        toast.success('Welcome to Coach Dashboard!');
        onSuccess();
      } catch (dbError) {
        console.error('Error in coach login flow:', dbError);
        toast.error('Login failed. Please contact admin.');
      }
    } catch (error: any) {
      console.error('OTP verification error:', error);
      toast.error(error.message || 'Invalid OTP');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 relative"
      >
        {/* Back Button */}
        <button
          onClick={onBack}
          className="absolute top-4 left-4 p-2 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-8 mt-4">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Coach Login
          </h2>
          <p className="text-gray-600">
            {step === 'phone' ? 'Enter your phone number to continue' : 'Enter the OTP sent to your WhatsApp'}
          </p>
        </div>

        {/* Phone Step */}
        {step === 'phone' && (
          <form onSubmit={handlePhoneSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  disabled={isLoading}
                />
              </div>
            </div>
            
            <button
              type="submit"
              disabled={isLoading || !phoneNumber.trim()}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Sending OTP...' : 'Send OTP'}
            </button>
          </form>
        )}

        {/* OTP Step */}
        {step === 'otp' && (
          <form onSubmit={handleOtpSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Enter OTP
              </label>
              <div className="relative">
                <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="123456"
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-center text-lg tracking-widest"
                  disabled={isLoading}
                  maxLength={6}
                />
              </div>
              <p className="text-sm text-gray-500 mt-2">
                OTP sent to {phoneNumber}
              </p>
            </div>
            
            <div className="space-y-3">
              <button
                type="submit"
                disabled={isLoading || !otp.trim()}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Verifying...' : 'Verify & Login'}
              </button>
              
              <button
                type="button"
                onClick={() => setStep('phone')}
                className="w-full text-gray-600 py-2 text-sm hover:text-gray-800 transition-colors"
              >
                Change Phone Number
              </button>
            </div>
          </form>
        )}

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-500">
            For coaches only. Contact admin if you need access.
          </p>
        </div>
      </motion.div>
    </div>
  );
};