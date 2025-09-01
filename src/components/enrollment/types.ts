// Core enrollment system types and interfaces

export type EnrollmentStep = 'auth' | 'court' | 'pricing' | 'payment' | 'confirmation';
export type PaymentStatus = 'pending' | 'processing' | 'success' | 'failed';
export type PlanDuration = '1-month' | '3-month' | '12-month';
export type Sport = 'football' | 'basketball' | 'badminton' | 'swimming';

// Main enrollment state interface
export interface EnrollmentState {
  currentStep: EnrollmentStep;
  userPhone: string;
  isAuthenticated: boolean;
  selectedPlan: PricingPlan | null;
  paymentStatus: PaymentStatus;
  enrollmentData: EnrollmentData;
  errors: Record<string, string>;
}

// User data interfaces
export interface UserData {
  phoneNumber: string;
  countryCode: string;
  isVerified: boolean;
  otpAttempts: number;
  lastOtpSent?: Date;
  lockoutUntil?: Date;
}

// Pricing plan interface
export interface PricingPlan {
  id: string;
  duration: PlanDuration;
  price: number;
  originalPrice: number;
  totalPrice: number;
  sessions: number;
  features: string[];
  popular: boolean;
  discount?: string;
}

// Court details interface
export interface CourtDetails {
  name: string;
  location: string;
  facilities: string[];
  amenities: string[];
  specifications: {
    size: string;
    surface: string;
    lighting: string;
  };
  timeSlots: TimeSlot[];
  images: string[];
}

// Time slot interface
export interface TimeSlot {
  id: string;
  startTime: string;
  endTime: string;
  available: boolean;
  coachName?: string;
  recommended?: boolean;
}

// Payment data interface
export interface PaymentData {
  orderId: string;
  amount: number;
  currency: string;
  planId: string;
  userPhone: string;
  timestamp: number;
}

// Payment order interface (from Razorpay)
export interface PaymentOrder {
  id: string;
  entity: string;
  amount: number;
  amount_paid: number;
  amount_due: number;
  currency: string;
  receipt: string;
  status: string;
  attempts: number;
  notes: Record<string, string>;
  created_at: number;
}

// Payment verification interface
export interface PaymentVerification {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

// Razorpay payment response interface
export interface RazorpayPaymentResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

// Payment record model
export interface PaymentRecord {
  id: string;
  enrollmentId: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  amount: number;
  currency: string;
  status: 'created' | 'authorized' | 'captured' | 'failed';
  createdAt: Date;
  updatedAt: Date;
}

// Enrollment data interface
export interface EnrollmentData {
  id?: string;
  phoneNumber: string;
  sport: Sport;
  planId: string;
  paymentId?: string;
  status: 'active' | 'pending' | 'cancelled';
  enrollmentDate: Date;
  sessionStartDate?: Date;
  courtLocation?: string;
  secondaryPlatformId?: string;
}

// Confirmation data interface
export interface ConfirmationData {
  enrollmentId: string;
  sessionStartDate: Date;
  courtLocation: string;
  coachDetails: {
    name: string;
    contact: string;
  };
  schedule: SessionSchedule[];
  paymentReference: string;
}

// Session schedule interface
export interface SessionSchedule {
  id: string;
  enrollmentId: string;
  date: Date;
  startTime: string;
  endTime: string;
  courtId: string;
  coachId: string;
  status: 'scheduled' | 'completed' | 'cancelled';
}

// API Response interfaces
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
}

export interface AuthResponse {
  success: boolean;
  verified: boolean;
  error?: string;
  lockoutUntil?: Date;
}

export interface PaymentResponse {
  success: boolean;
  paymentId?: string;
  orderId?: string;
  error?: string;
  retryable?: boolean;
}

export interface SecondaryPlatformResponse {
  success: boolean;
  userId?: string;
  credentials?: {
    username: string;
    temporaryPassword: string;
  };
  error?: string;
}

// Error handling interfaces
export interface ErrorState {
  type: 'validation' | 'network' | 'payment' | 'auth' | 'system';
  message: string;
  code?: string;
  retryable: boolean;
  context?: Record<string, any>;
}

// Firebase configuration interface
export interface FirebaseAuthConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  appId: string;
}

// Razorpay configuration interface
export interface RazorpayConfig {
  key_id: string;
  key_secret: string;
  currency: string;
  theme: {
    color: string;
  };
}

// Environment configuration interface
export interface EnvironmentConfig {
  FIREBASE_API_KEY: string;
  FIREBASE_AUTH_DOMAIN: string;
  FIREBASE_PROJECT_ID: string;
  FIREBASE_APP_ID: string;
  RAZORPAY_KEY_ID: string;
  RAZORPAY_KEY_SECRET: string;
  SECONDARY_PLATFORM_URL: string;
  SECONDARY_PLATFORM_API_KEY: string;
}

// Modal props interface
export interface EnrollmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  sport: Sport;
}

// Step component props interface
export interface StepComponentProps {
  onNext: () => void;
  onBack?: () => void;
  enrollmentState: EnrollmentState;
  updateState: (updates: Partial<EnrollmentState>) => void;
}