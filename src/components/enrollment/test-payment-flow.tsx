import React, { useState } from 'react';
import { EnrollmentModal } from './EnrollmentModal';
import { Sport } from './types';

// Test component to verify payment flow
export const TestPaymentFlow: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSport, setSelectedSport] = useState<Sport>('football');

  const sports: { value: Sport; label: string; emoji: string }[] = [
    { value: 'football', label: 'Football', emoji: '⚽' },
    { value: 'basketball', label: 'Basketball', emoji: '🏀' },
    { value: 'badminton', label: 'Badminton', emoji: '🏸' },
    { value: 'swimming', label: 'Swimming', emoji: '🏊' },
  ];

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6 text-center">
            🧪 Payment Flow Test
          </h1>
          
          <div className="space-y-6">
            {/* Sport Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Sport to Test
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {sports.map((sport) => (
                  <button
                    key={sport.value}
                    onClick={() => setSelectedSport(sport.value)}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      selectedSport === sport.value
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-2xl mb-2">{sport.emoji}</div>
                    <div className="font-medium">{sport.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Test Instructions */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="font-semibold text-yellow-800 mb-2">
                🔍 Test Instructions
              </h3>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• Click "Open Enrollment Modal" to start the flow</li>
                <li>• Complete phone authentication (use development OTP)</li>
                <li>• Review court details and select a pricing plan</li>
                <li>• Test payment with Razorpay integration</li>
                <li>• Verify confirmation screen shows correct details</li>
              </ul>
            </div>

            {/* Razorpay Test Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-800 mb-2">
                💳 Razorpay Test Details
              </h3>
              <div className="text-sm text-blue-700 space-y-2">
                <div>
                  <strong>Test Card Numbers:</strong>
                  <ul className="ml-4 mt-1 space-y-1">
                    <li>• Success: 4111 1111 1111 1111</li>
                    <li>• Failure: 4000 0000 0000 0002</li>
                  </ul>
                </div>
                <div>
                  <strong>Test Details:</strong>
                  <ul className="ml-4 mt-1 space-y-1">
                    <li>• CVV: Any 3 digits</li>
                    <li>• Expiry: Any future date</li>
                    <li>• Name: Any name</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Environment Info */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-2">
                ⚙️ Environment Info
              </h3>
              <div className="text-sm text-gray-600 space-y-1">
                <div>Environment: {process.env.NODE_ENV}</div>
                <div>Razorpay Key: {import.meta.env.VITE_RAZORPAY_KEY_ID ? '✅ Configured' : '❌ Missing'}</div>
                <div>Convex URL: {import.meta.env.VITE_CONVEX_URL ? '✅ Configured' : '❌ Missing'}</div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => setIsModalOpen(true)}
                className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                🚀 Open Enrollment Modal
              </button>
              
              <button
                onClick={() => {
                  localStorage.clear();
                  window.location.reload();
                }}
                className="flex-1 bg-gray-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-gray-700 transition-colors"
              >
                🗑️ Clear Storage & Reload
              </button>
            </div>

            {/* Payment Flow Status */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-semibold text-green-800 mb-2">
                ✅ Expected Flow
              </h3>
              <ol className="text-sm text-green-700 space-y-1 list-decimal list-inside">
                <li>Phone authentication with OTP verification</li>
                <li>Court details and facility information</li>
                <li>Pricing plan selection with discount options</li>
                <li>Razorpay payment processing</li>
                <li>Confirmation with enrollment details</li>
                <li>Secondary platform registration (if applicable)</li>
              </ol>
            </div>
          </div>
        </div>
      </div>

      {/* Enrollment Modal */}
      <EnrollmentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        sport={selectedSport}
      />
    </div>
  );
};

export default TestPaymentFlow;