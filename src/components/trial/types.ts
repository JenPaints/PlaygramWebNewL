// Free trial booking system types

export type TrialStep = 'sport' | 'calendar' | 'auth' | 'details' | 'confirmation';
export type TrialSport = 'football' | 'basketball';
export type TrialStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'failed';

// Main trial booking state
export interface TrialBookingState {
  currentStep: TrialStep;
  selectedSport: TrialSport | null;
  selectedDate: Date | null;
  userPhone: string;
  isAuthenticated: boolean;
  userDetails: TrialUserDetails | null;
  bookingStatus: TrialStatus;
  actualBookingId?: string; // The actual Convex booking ID
  errors: Record<string, string>;
}

// User details for trial booking
export interface TrialUserDetails {
  name: string;
  age: number;
  email: string;
  phoneNumber: string;
}

// Trial booking data
export interface TrialBookingData {
  id?: string;
  phoneNumber: string;
  sport: TrialSport;
  selectedDate: Date;
  userDetails: TrialUserDetails;
  status: TrialStatus;
  bookingDate: Date;
  courtLocation?: string;
}

// Confirmation data
export interface TrialConfirmationData {
  bookingId: string;
  sport: TrialSport;
  date: Date;
  time: string;
  courtLocation: string;
  coachDetails: {
    name: string;
    contact: string;
  };
  instructions: string[];
}

// Modal props
export interface FreeTrialModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialSport?: TrialSport;
}

// Step component props
export interface TrialStepProps {
  onNext: () => void;
  onBack?: () => void;
  trialState: TrialBookingState;
  updateState: (updates: Partial<TrialBookingState>) => void;
}

// Available trial slots (Sundays only)
export interface TrialSlot {
  date: Date;
  available: boolean;
  timeSlot: string;
  maxCapacity: number | null; // null means no capacity limit
  currentBookings: number;
}