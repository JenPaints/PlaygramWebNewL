import React, { useState, useEffect } from 'react';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';

// Popular countries with their codes
const POPULAR_COUNTRIES = [
  { code: '+91', name: 'India', flag: '🇮🇳' },
  { code: '+1', name: 'United States', flag: '🇺🇸' },
  { code: '+44', name: 'United Kingdom', flag: '🇬🇧' },
  { code: '+61', name: 'Australia', flag: '🇦🇺' },
  { code: '+971', name: 'UAE', flag: '🇦🇪' },
  { code: '+65', name: 'Singapore', flag: '🇸🇬' },
  { code: '+60', name: 'Malaysia', flag: '🇲🇾' },
  { code: '+49', name: 'Germany', flag: '🇩🇪' },
  { code: '+33', name: 'France', flag: '🇫🇷' },
  { code: '+81', name: 'Japan', flag: '🇯🇵' }
];

interface PhoneInputStepProps {
  onPhoneSubmit: (phoneNumber: string) => void;
  isLoading?: boolean;
  error?: string;
}

export const PhoneInputStep: React.FC<PhoneInputStepProps> = ({
  onPhoneSubmit,
  isLoading = false,
  error
}) => {
  const [selectedCountry, setSelectedCountry] = useState(POPULAR_COUNTRIES[0]);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [validationError, setValidationError] = useState('');

  // Phone number validation regex patterns
  const validatePhoneNumber = (number: string, countryCode: string): boolean => {
    // Remove any non-digit characters
    const cleanNumber = number.replace(/\D/g, '');
    
    // Country-specific validation patterns
    const patterns: Record<string, RegExp> = {
      '+91': /^[6-9]\d{9}$/, // India: 10 digits starting with 6-9
      '+1': /^\d{10}$/, // US/Canada: 10 digits
      '+44': /^[1-9]\d{9,10}$/, // UK: 10-11 digits
      '+61': /^[2-9]\d{8}$/, // Australia: 9 digits starting with 2-9
      '+971': /^[5]\d{8}$/, // UAE: 9 digits starting with 5
      '+65': /^[689]\d{7}$/, // Singapore: 8 digits starting with 6,8,9
      '+60': /^1[0-9]\d{7,8}$/, // Malaysia: 9-10 digits starting with 1
      '+49': /^1[5-7]\d{8,9}$/, // Germany: 10-11 digits starting with 15-17
      '+33': /^[67]\d{8}$/, // France: 9 digits starting with 6 or 7
      '+81': /^[789]0\d{8}$/ // Japan: 10 digits starting with 70,80,90
    };

    const pattern = patterns[countryCode];
    return pattern ? pattern.test(cleanNumber) : cleanNumber.length >= 7 && cleanNumber.length <= 15;
  };

  // Format phone number for display
  const formatPhoneNumber = (number: string, countryCode: string): string => {
    const cleanNumber = number.replace(/\D/g, '');
    
    if (countryCode === '+91' && cleanNumber.length === 10) {
      return cleanNumber.replace(/(\d{5})(\d{5})/, '$1 $2');
    } else if (countryCode === '+1' && cleanNumber.length === 10) {
      return cleanNumber.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
    } else if (countryCode === '+44' && cleanNumber.length >= 10) {
      return cleanNumber.replace(/(\d{4})(\d{3})(\d{3,4})/, '$1 $2 $3');
    }
    
    return cleanNumber;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, ''); // Only allow digits
    const formatted = formatPhoneNumber(value, selectedCountry.code);
    setPhoneNumber(formatted);
    
    // Clear validation error when user starts typing
    if (validationError) {
      setValidationError('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const cleanNumber = phoneNumber.replace(/\D/g, '');
    
    if (!cleanNumber) {
      setValidationError('Please enter your phone number');
      return;
    }
    
    if (!validatePhoneNumber(cleanNumber, selectedCountry.code)) {
      setValidationError('Please enter a valid phone number');
      return;
    }
    
    const fullPhoneNumber = `${selectedCountry.code}${cleanNumber}`;
    onPhoneSubmit(fullPhoneNumber);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.country-selector')) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="w-full max-w-md mx-auto p-8">
      {/* Logo Section */}
      <div className="text-center mb-10">
        <div className="mb-8">
          <img 
            src="https://jenpaints.art/wp-content/uploads/2025/08/Screenshot_2025-07-13_at_22.16.29-removebg-preview.png" 
            alt="PlayGram Logo" 
            className="h-20 w-auto mx-auto drop-shadow-sm"
          />
        </div>
        <div className="space-y-3">
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
            Enter Your Phone Number
          </h2>
          <p className="text-gray-600 text-lg leading-relaxed">
            We'll send you a verification code to confirm your number
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex space-x-3">
          {/* Country Code Selector */}
          <div className="relative country-selector">
            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center space-x-3 px-4 py-4 border-2 border-gray-200 rounded-xl bg-white hover:bg-gray-50 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <span className="text-xl">{selectedCountry.flag}</span>
              <span className="text-sm font-semibold text-gray-700">{selectedCountry.code}</span>
              <svg
                className={`w-4 h-4 text-gray-500 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Dropdown */}
            {isDropdownOpen && (
              <div className="absolute top-full left-0 mt-3 w-72 bg-white border-2 border-gray-100 rounded-xl shadow-2xl z-50 max-h-64 overflow-y-auto backdrop-blur-sm">
                {POPULAR_COUNTRIES.map((country) => (
                  <button
                    key={country.code}
                    type="button"
                    onClick={() => {
                      setSelectedCountry(country);
                      setIsDropdownOpen(false);
                    }}
                    className="w-full flex items-center space-x-4 px-5 py-4 text-left hover:bg-blue-50 focus:bg-blue-50 focus:outline-none transition-colors duration-200 first:rounded-t-xl last:rounded-b-xl"
                  >
                    <span className="text-xl">{country.flag}</span>
                    <span className="text-sm font-semibold text-gray-700 min-w-[3rem]">{country.code}</span>
                    <span className="text-sm text-gray-600 flex-1">{country.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Phone Number Input */}
          <div className="flex-1">
            <Input
              type="tel"
              value={phoneNumber}
              onChange={handlePhoneChange}
              placeholder="Enter phone number"
              className="h-14 px-4 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-200 bg-white hover:border-gray-300 text-gray-900 placeholder:text-gray-500"
              disabled={isLoading}
            />
          </div>
        </div>

        {/* Error Messages */}
        {(validationError || error) && (
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
            <div className="flex items-center space-x-3">
              <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span className="text-red-700 font-medium">
                {validationError || error}
              </span>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full flex items-center justify-center space-x-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] py-4 px-6 rounded-xl shadow-lg hover:shadow-xl disabled:shadow-none"
          disabled={isLoading || !phoneNumber.trim()}
        >
          {isLoading ? (
            <>
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span className="text-lg">Sending Code...</span>
            </>
          ) : (
            <>
              <img 
                src="https://jenpaints.art/wp-content/uploads/2025/08/Screenshot_2025-07-13_at_22.16.29-removebg-preview.png" 
                alt="PlayGram" 
                className="h-6 w-6 object-contain brightness-0 invert"
              />
              <span className="text-lg">Send Verification Code</span>
              <img 
                src="https://jenpaints.art/wp-content/uploads/2025/08/Screenshot_2025-07-13_at_22.16.29-removebg-preview.png" 
                alt="PlayGram" 
                className="h-6 w-6 object-contain brightness-0 invert"
              />
            </>
          )}
        </button>
      </form>

      {/* Help Text */}
      <div className="mt-8 text-center space-y-4">
        <div className="flex items-center justify-center space-x-3 text-sm text-gray-500">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <span className="font-medium">Your information is secure and encrypted</span>
        </div>
        <p className="text-sm text-gray-500 leading-relaxed max-w-sm mx-auto">
          By continuing, you agree to receive verification messages for authentication purposes.
          Standard message rates may apply.
        </p>

      </div>
    </div>
  );
};