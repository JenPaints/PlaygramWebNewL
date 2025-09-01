import React, { useState } from 'react';
import { Eye, EyeOff, Phone, Lock, ExternalLink, AlertCircle, CheckCircle } from 'lucide-react';
import { convexService } from '../services/convexService';

interface PhoneLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  phoneNumber?: string;
}

export const PhoneLoginModal: React.FC<PhoneLoginModalProps> = ({
  isOpen,
  onClose,
  phoneNumber: initialPhoneNumber = '',
}) => {
  const [phoneNumber, setPhoneNumber] = useState(initialPhoneNumber);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [requiresPasswordChange, setRequiresPasswordChange] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [userId, setUserId] = useState<string | null>(null);

  // Reset form when modal opens/closes
  React.useEffect(() => {
    if (isOpen) {
      setPhoneNumber(initialPhoneNumber);
      setPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setError(null);
      setLoginSuccess(false);
      setRequiresPasswordChange(false);
      setUserId(null);
    }
  }, [isOpen, initialPhoneNumber]);

  // Handle phone login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!phoneNumber.trim() || !password.trim()) {
      setError('Please enter both phone number and password');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await convexService.authenticateWithPhone(phoneNumber, password);
      
      if (result.success && result.userId) {
        setUserId(result.userId);
        
        // Check if user needs to change temporary password
        if (result.credentials) {
          setRequiresPasswordChange(true);
        } else {
          setLoginSuccess(true);
          // Redirect to platform after short delay
          setTimeout(() => {
            window.open('https://acoustic-flamingo-124.app.com', '_blank');
            onClose();
          }, 2000);
        }
      } else {
        setError(result.error || 'Login failed');
      }
    } catch (error: any) {
      setError(error.message || 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle password change
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newPassword.trim() || !confirmPassword.trim()) {
      setError('Please enter and confirm your new password');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    if (!userId) {
      setError('User session expired. Please login again.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await convexService.updatePassword(userId, newPassword);
      
      if (result.success) {
        setLoginSuccess(true);
        // Redirect to platform after short delay
        setTimeout(() => {
          window.open('https://acoustic-flamingo-124.app.com', '_blank');
          onClose();
        }, 2000);
      } else {
        setError(result.error || 'Failed to update password');
      }
    } catch (error: any) {
      setError(error.message || 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  // Format phone number for display
  const formatPhoneNumber = (phone: string) => {
    if (phone.startsWith('+91')) {
      return phone.replace('+91', '+91 ');
    }
    return phone;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[10000] p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[95vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-1">
                {requiresPasswordChange ? 'Set New Password' : 'Login to Coaching Platform'}
              </h2>
              <p className="text-sm text-gray-600">
                {requiresPasswordChange 
                  ? 'Please create a secure password for your account'
                  : 'Access your coaching dashboard and progress'
                }
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 hover:bg-white/80 rounded-full p-2 transition-all duration-200"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {loginSuccess ? (
            // Success State
            <div className="text-center space-y-4">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
              <h3 className="text-xl font-semibold text-gray-900">Login Successful!</h3>
              <p className="text-gray-600">
                Redirecting you to the coaching platform...
              </p>
              <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span>Opening platform...</span>
              </div>
            </div>
          ) : requiresPasswordChange ? (
            // Password Change Form
            <form onSubmit={handlePasswordChange} className="space-y-6">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-yellow-900">Password Change Required</h4>
                    <p className="text-sm text-yellow-800 mt-1">
                      For security, please create a new password to replace your temporary one.
                    </p>
                  </div>
                </div>
              </div>

              {/* New Password */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter new password"
                    required
                    minLength={8}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                <p className="text-xs text-gray-500">
                  Password must be at least 8 characters long
                </p>
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Confirm new password"
                    required
                    minLength={8}
                  />
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="w-5 h-5 text-red-500" />
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Updating Password...</span>
                  </div>
                ) : (
                  'Update Password & Login'
                )}
              </button>
            </form>
          ) : (
            // Login Form
            <form onSubmit={handleLogin} className="space-y-6">
              {/* Phone Number */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="+91 7888388817"
                    required
                  />
                </div>
                <p className="text-xs text-gray-500">
                  Use the same phone number from your enrollment
                </p>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                <p className="text-xs text-gray-500">
                  Use the temporary password from your enrollment confirmation
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="w-5 h-5 text-red-500" />
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Logging in...</span>
                  </div>
                ) : (
                  'Login to Platform'
                )}
              </button>
            </form>
          )}

          {/* Help Section */}
          {!loginSuccess && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h4 className="font-medium text-gray-900 mb-2">Need Help?</h4>
              <div className="space-y-2 text-sm text-gray-600">
                <p>• Use the same phone number from your enrollment</p>
                <p>• Your temporary password was provided after enrollment</p>
                <p>• Check your enrollment confirmation for credentials</p>
              </div>
              <div className="mt-4 text-center">
                <p className="text-sm text-gray-600">
                  Still having trouble?{' '}
                  <a href="mailto:support@playgram.com" className="text-blue-600 hover:underline">
                    Contact Support
                  </a>
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PhoneLoginModal;