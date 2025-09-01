import React, { useState } from 'react';
import { Eye, EyeOff, Copy, ExternalLink, CheckCircle, AlertCircle, LogIn } from 'lucide-react';
import { RegistrationResult } from '../services/secondaryPlatformService';
import PhoneLoginModal from './PhoneLoginModal';

interface SecondaryPlatformCredentialsProps {
  registrationResult: RegistrationResult;
  phoneNumber: string;
  onRetryRegistration?: () => void;
}

export const SecondaryPlatformCredentials: React.FC<SecondaryPlatformCredentialsProps> = ({
  registrationResult,
  phoneNumber,
  onRetryRegistration,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Handle copy to clipboard
  const handleCopy = async (text: string, fieldName: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldName);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  // Handle opening secondary platform
  const handleOpenPlatform = () => {
    // In a real implementation, this would open the actual secondary platform URL
    const platformUrl = 'https://acoustic-flamingo-124.app.com';
    window.open(platformUrl, '_blank');
  };

  if (!registrationResult.success) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <div className="flex items-start space-x-3">
          <AlertCircle className="w-6 h-6 text-yellow-600 mt-1 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-yellow-900 mb-2">
              Secondary Platform Registration
            </h3>
            <p className="text-yellow-800 mb-4">
              We encountered an issue while setting up your account on our coaching management platform. 
              Don't worry - your enrollment is still confirmed and you can access all services.
            </p>
            
            <div className="bg-yellow-100 rounded-lg p-4 mb-4">
              <p className="text-sm text-yellow-800">
                <strong>Error:</strong> {registrationResult.error}
              </p>
            </div>

            {registrationResult.retryable && onRetryRegistration && (
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={onRetryRegistration}
                  className="bg-yellow-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-yellow-700 transition-colors"
                >
                  Retry Registration
                </button>
                <p className="text-sm text-yellow-700 self-center">
                  We'll automatically retry setting up your secondary platform access.
                </p>
              </div>
            )}

            {!registrationResult.retryable && (
              <div className="bg-yellow-100 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                  Please contact our support team at <strong>support@playgram.com</strong> or 
                  <strong> +91-9876543210</strong> to manually set up your coaching platform access.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (!registrationResult.credentials) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-center space-x-3">
          <CheckCircle className="w-6 h-6 text-blue-600" />
          <div>
            <h3 className="text-lg font-semibold text-blue-900">
              Secondary Platform Registration Successful
            </h3>
            <p className="text-blue-800">
              Your account has been created on our coaching management platform. 
              Access credentials will be sent to your registered phone number shortly.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const { username, temporaryPassword } = registrationResult.credentials;

  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-6 space-y-6">
      <div className="flex items-start space-x-3">
        <CheckCircle className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-green-900 mb-2">
            Coaching Platform Access Ready!
          </h3>
          <p className="text-green-800 mb-4">
            Your account has been successfully created on our coaching management platform. 
            Use the credentials below to access additional features and track your progress.
          </p>
        </div>
      </div>

      {/* Credentials Section */}
      <div className="bg-white border border-green-200 rounded-lg p-4 space-y-4">
        <h4 className="font-semibold text-gray-900 mb-3">Your Access Credentials</h4>
        
        {/* Phone Number (Login Username) */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Login Phone Number
          </label>
          <div className="flex items-center space-x-2">
            <div className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 font-mono text-sm">
              {phoneNumber}
            </div>
            <button
              onClick={() => handleCopy(phoneNumber, 'phone')}
              className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
              title="Copy phone number"
            >
              {copiedField === 'phone' ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          </div>
          <p className="text-xs text-gray-500">Use this phone number to login to the platform</p>
        </div>

        {/* Password */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Temporary Password
          </label>
          <div className="flex items-center space-x-2">
            <div className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 font-mono text-sm">
              {showPassword ? temporaryPassword : '••••••••'}
            </div>
            <button
              onClick={() => setShowPassword(!showPassword)}
              className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
              title={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
            <button
              onClick={() => handleCopy(temporaryPassword, 'password')}
              className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
              title="Copy password"
            >
              {copiedField === 'password' ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Enrollment ID */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Enrollment ID
          </label>
          <div className="flex items-center space-x-2">
            <div className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 font-mono text-sm">
              {registrationResult.enrollmentId}
            </div>
            <button
              onClick={() => handleCopy(registrationResult.enrollmentId || '', 'enrollmentId')}
              className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
              title="Copy enrollment ID"
            >
              {copiedField === 'enrollmentId' ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Access Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 mb-2">How to Access Your Coaching Platform</h4>
        <div className="space-y-3">
          <div>
            <h5 className="font-medium text-blue-900 text-sm">Option 1: Direct Phone Login (Recommended)</h5>
            <ol className="list-decimal list-inside space-y-1 text-sm text-blue-800 ml-2">
              <li>Click "Login with Phone Number" button</li>
              <li>Enter your phone number and temporary password</li>
              <li>Create a new secure password when prompted</li>
              <li>Access your coaching dashboard</li>
            </ol>
          </div>
          <div>
            <h5 className="font-medium text-blue-900 text-sm">Option 2: Manual Platform Access</h5>
            <ol className="list-decimal list-inside space-y-1 text-sm text-blue-800 ml-2">
              <li>Click "Open Platform" to visit the website</li>
              <li>Use your phone number as username</li>
              <li>Enter your temporary password</li>
              <li>Complete profile setup to get started</li>
            </ol>
          </div>
        </div>
      </div>

      {/* Platform Features */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-semibold text-gray-900 mb-2">Platform Features</h4>
        <ul className="space-y-1 text-sm text-gray-700">
          <li>• Track your coaching progress and performance metrics</li>
          <li>• Schedule and manage your training sessions</li>
          <li>• Access training videos and resources</li>
          <li>• Communicate with your coach directly</li>
          <li>• View your payment history and plan details</li>
          <li>• Join community discussions and challenges</li>
        </ul>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={() => setShowLoginModal(true)}
          className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
        >
          <LogIn className="w-4 h-4" />
          <span>Login with Phone Number</span>
        </button>
        <button
          onClick={handleOpenPlatform}
          className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
        >
          <ExternalLink className="w-4 h-4" />
          <span>Open Platform</span>
        </button>
        <button
          onClick={() => handleCopy(`Phone: ${phoneNumber}\nPassword: ${temporaryPassword}\nEnrollment ID: ${registrationResult.enrollmentId}`, 'all')}
          className="bg-gray-100 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2"
        >
          <Copy className="w-4 h-4" />
          <span>Copy All Credentials</span>
        </button>
      </div>

      {/* Security Notice */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h4 className="font-semibold text-yellow-900 mb-2">Important Security Notice</h4>
        <ul className="space-y-1 text-sm text-yellow-800">
          <li>• Please change your temporary password immediately after first login</li>
          <li>• Keep your credentials secure and don't share them with others</li>
          <li>• If you forget your password, use the "Forgot Password" option on the login page</li>
          <li>• Contact support if you experience any login issues</li>
        </ul>
      </div>

      {/* Support Information */}
      <div className="text-center text-sm text-gray-600">
        <p>
          Need help? Contact our support team at{' '}
          <a href="mailto:support@playgram.com" className="text-blue-600 hover:underline">
            support@playgram.com
          </a>{' '}
          or{' '}
          <a href="tel:+919876543210" className="text-blue-600 hover:underline">
            +91-9876543210
          </a>
        </p>
      </div>

      {/* Phone Login Modal */}
      <PhoneLoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        phoneNumber={phoneNumber}
      />
    </div>
  );
};

export default SecondaryPlatformCredentials;