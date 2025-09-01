// Enrollment system constants

// Razorpay configuration as specified in requirements
export const RAZORPAY_CONFIG = {
  key_id: 'rzp_live_lSCoIp0EewCk9z',
  key_secret: '7ZcF5V5OJnvDN663RY3HvJhO',
  currency: 'INR',
  theme: {
    color: '#86D5F0'
  }
} as const;

// Secondary platform URL as specified in requirements
export const SECONDARY_PLATFORM_URL = 'https://acoustic-flamingo-124.convex.cloud';

// Authentication constants
export const AUTH_CONSTANTS = {
  MAX_OTP_ATTEMPTS: 3,
  LOCKOUT_DURATION_MINUTES: 5,
  OTP_LENGTH: 6,
  SESSION_TIMEOUT_MINUTES: 10
} as const;

// Popular country codes for phone authentication
export const POPULAR_COUNTRIES = [
  { code: '+91', name: 'India', flag: '🇮🇳' },
  { code: '+1', name: 'United States', flag: '🇺🇸' },
  { code: '+44', name: 'United Kingdom', flag: '🇬🇧' },
  { code: '+61', name: 'Australia', flag: '🇦🇺' },
  { code: '+971', name: 'UAE', flag: '🇦🇪' },
  { code: '+65', name: 'Singapore', flag: '🇸🇬' }
] as const;

// Error messages
export const ERROR_MESSAGES = {
  INVALID_PHONE: 'Please enter a valid phone number',
  INVALID_OTP: 'Invalid OTP. Please try again.',
  OTP_EXPIRED: 'OTP has expired. Please request a new one.',
  MAX_ATTEMPTS_REACHED: 'Maximum attempts reached. Please try again later.',
  NETWORK_ERROR: 'Network error. Please check your connection and try again.',
  PAYMENT_FAILED: 'Payment failed. Please try again.',
  GENERIC_ERROR: 'Something went wrong. Please try again.'
} as const;

// Step names for better UX
export const STEP_NAMES = {
  auth: 'Phone Verification',
  court: 'Court Details',
  pricing: 'Select Plan',
  payment: 'Payment',
  confirmation: 'Confirmation'
} as const;

// Pricing plans data - updated with PlayOn Sports Arena E City pricing
export const PRICING_PLANS = [
  {
    id: 'monthly',
    duration: '1 Month' as const,
    price: 4599,
    originalPrice: 4599, // No discount for 1 month
    totalPrice: 4599,
    sessions: 12,
    sessionsText: '12 classes per month',
    pricePerSession: 383,
    originalPricePerSession: 383,
    features: [
      'PlayOn Sports Arena - E City',
      'Monday, Wednesday, Friday - 5PM-6PM',
      'Professional coaching',
      'Equipment provided'
    ],
    popular: false,
    discount: '0% OFF'
  },
  {
    id: 'quarterly',
    duration: '3 Months' as const,
    price: 13107,
    originalPrice: 13788, // 36 * 383 = 13788
    totalPrice: 13107,
    sessions: 36,
    sessionsText: '36 classes in 3 months',
    pricePerSession: 364,
    originalPricePerSession: 383,
    features: [
      'PlayOn Sports Arena - E City',
      'Monday, Wednesday, Friday - 5PM-6PM',
      'Professional coaching',
      'Equipment provided'
    ],
    popular: true,
    discount: '5% OFF'
  },
  {
    id: 'halfyearly',
    duration: '6 Months' as const,
    price: 24559,
    originalPrice: 27576, // 72 * 383 = 27576
    totalPrice: 24559,
    sessions: 72,
    sessionsText: '72 classes in 6 months',
    pricePerSession: 341,
    originalPricePerSession: 383,
    features: [
      'PlayOn Sports Arena - E City',
      'Monday, Wednesday, Friday - 5PM-6PM',
      'Professional coaching',
      'Equipment provided'
    ],
    popular: false,
    discount: '11% OFF'
  },
  {
    id: 'yearly',
    duration: '12 Months' as const,
    price: 43047,
    originalPrice: 55152, // 144 * 383 = 55152
    totalPrice: 43047,
    sessions: 144,
    sessionsText: '144 classes in 12 months',
    pricePerSession: 299,
    originalPricePerSession: 383,
    features: [
      'PlayOn Sports Arena - E City',
      'Monday, Wednesday, Friday - 5PM-6PM',
      'Professional coaching',
      'Equipment provided'
    ],
    popular: false,
    discount: '22% OFF'
  }
] as const;