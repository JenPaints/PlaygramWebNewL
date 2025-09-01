import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ConfirmationStep } from '../ConfirmationStep';
import { EnrollmentState, ConfirmationData } from '../../types';

// Mock the secondary platform service
vi.mock('../../services/secondaryPlatformService', () => ({
  secondaryPlatformService: {
    handleRegistrationWithRetry: vi.fn().mockResolvedValue({
      success: true,
      userId: 'user_123'
    })
  }
}));

// Mock SessionScheduleView component
vi.mock('../SessionScheduleView', () => ({
  default: ({ confirmationData }: { confirmationData: any }) => (
    <div data-testid="session-schedule-view">
      Session Schedule for {confirmationData.coachDetails.name}
    </div>
  )
}));

// Mock SecondaryPlatformCredentials component
vi.mock('../SecondaryPlatformCredentials', () => ({
  default: ({ phoneNumber }: { phoneNumber: string }) => (
    <div data-testid="secondary-platform-credentials">
      Platform Credentials for {phoneNumber}
    </div>
  )
}));

describe('ConfirmationStep', () => {
  const mockEnrollmentState: EnrollmentState = {
    currentStep: 'confirmation',
    userPhone: '+919876543210',
    isAuthenticated: true,
    selectedPlan: {
      id: 'plan_12month',
      duration: '12-month',
      price: 20000,
      originalPrice: 25000,
      totalPrice: 20000,
      sessions: 48,
      features: ['Professional Coaching', 'Equipment Included'],
      popular: true,
      discount: '20% OFF'
    },
    paymentStatus: 'success',
    enrollmentData: {
      phoneNumber: '+919876543210',
      sport: 'football',
      planId: 'plan_12month',
      status: 'active',
      enrollmentDate: new Date(),
      sessionStartDate: new Date('2024-02-01'),
      courtLocation: 'Central Sports Complex'
    },
    errors: {}
  };

  const mockConfirmationData: ConfirmationData = {
    enrollmentId: 'enroll_123',
    sessionStartDate: new Date('2024-02-01'),
    courtLocation: 'Central Sports Complex, Sector 15',
    coachDetails: {
      name: 'John Doe',
      contact: '+919876543211'
    },
    schedule: [
      {
        id: 'session_1',
        enrollmentId: 'enroll_123',
        date: new Date('2024-02-01'),
        startTime: '18:00',
        endTime: '19:30',
        courtId: 'court_1',
        coachId: 'coach_1',
        status: 'scheduled'
      }
    ],
    paymentReference: 'PAY_123456789'
  };

  const defaultProps = {
    enrollmentState: mockEnrollmentState,
    confirmationData: mockConfirmationData,
    onNext: vi.fn(),
    updateState: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders confirmation header with success message', () => {
    render(<ConfirmationStep {...defaultProps} />);
    
    expect(screen.getByText('Enrollment Confirmed!')).toBeInTheDocument();
    expect(screen.getByText('Welcome to your football coaching journey. Your enrollment has been successfully processed.')).toBeInTheDocument();
  });

  it('displays enrollment details correctly', () => {
    render(<ConfirmationStep {...defaultProps} />);
    
    expect(screen.getByText('Enrollment Details')).toBeInTheDocument();
    expect(screen.getByText('12 Month Program')).toBeInTheDocument();
    expect(screen.getByText('48 sessions included')).toBeInTheDocument();
    expect(screen.getByText('Central Sports Complex, Sector 15')).toBeInTheDocument();
  });

  it('displays payment information', () => {
    render(<ConfirmationStep {...defaultProps} />);
    
    expect(screen.getByText('Payment Reference')).toBeInTheDocument();
    expect(screen.getByText('PAY_123456789')).toBeInTheDocument();
    expect(screen.getByText('₹20,000')).toBeInTheDocument();
  });

  it('displays contact information', () => {
    render(<ConfirmationStep {...defaultProps} />);
    
    expect(screen.getByText('Contact Information')).toBeInTheDocument();
    expect(screen.getByText('Court: +91 98765 43210')).toBeInTheDocument();
    expect(screen.getByText('Support: +91 87654 32109')).toBeInTheDocument();
  });

  it('shows secondary platform credentials component when provided', () => {
    const propsWithSecondaryPlatform = {
      ...defaultProps,
      secondaryPlatformResult: {
        success: true,
        userId: 'user_123',
        credentials: {
          username: 'testuser',
          temporaryPassword: 'temp123'
        }
      }
    };
    
    render(<ConfirmationStep {...propsWithSecondaryPlatform} />);
    
    expect(screen.getByTestId('secondary-platform-credentials')).toBeInTheDocument();
  });

  it('displays important information section', () => {
    render(<ConfirmationStep {...defaultProps} />);
    
    expect(screen.getByText('Important Information')).toBeInTheDocument();
    expect(screen.getByText(/Please arrive 15 minutes before your first session/)).toBeInTheDocument();
    expect(screen.getByText(/Bring your own water bottle and towel/)).toBeInTheDocument();
    expect(screen.getByText(/Wear appropriate sports attire and football boots/)).toBeInTheDocument();
  });

  it('toggles session schedule view when button is clicked', async () => {
    render(<ConfirmationStep {...defaultProps} />);
    
    // Initially schedule should be hidden
    expect(screen.queryByTestId('session-schedule-view')).not.toBeInTheDocument();
    
    // Click to show schedule
    const toggleButton = screen.getByText('View Session Schedule & Coach Details');
    fireEvent.click(toggleButton);
    
    await waitFor(() => {
      expect(screen.getByTestId('session-schedule-view')).toBeInTheDocument();
      expect(screen.getByText('Session Schedule for John Doe')).toBeInTheDocument();
    });
    
    // Button text should change
    expect(screen.getByText('Hide Schedule')).toBeInTheDocument();
  });

  it('handles different plan durations correctly', () => {
    const monthlyPlan = {
      ...mockEnrollmentState.selectedPlan!,
      duration: '1-month' as const
    };
    
    const propsWithMonthlyPlan = {
      ...defaultProps,
      enrollmentState: {
        ...mockEnrollmentState,
        selectedPlan: monthlyPlan
      }
    };
    
    render(<ConfirmationStep {...propsWithMonthlyPlan} />);
    
    expect(screen.getByText('1 Month Program')).toBeInTheDocument();
  });

  it('calls onNext when continue button is clicked', () => {
    const onNext = vi.fn();
    render(<ConfirmationStep {...defaultProps} onNext={onNext} />);
    
    const continueButton = screen.getByText('Continue to Dashboard');
    fireEvent.click(continueButton);
    
    expect(onNext).toHaveBeenCalledTimes(1);
  });

  it('handles print confirmation button', () => {
    // Mock window.print
    const mockPrint = vi.fn();
    Object.defineProperty(window, 'print', {
      value: mockPrint,
      writable: true
    });
    
    render(<ConfirmationStep {...defaultProps} />);
    
    const printButton = screen.getByText('Print Confirmation');
    fireEvent.click(printButton);
    
    expect(mockPrint).toHaveBeenCalledTimes(1);
  });

  it('formats session start date correctly', () => {
    render(<ConfirmationStep {...defaultProps} />);
    
    // Should display formatted date
    expect(screen.getByText(/Thursday, February 1, 2024/)).toBeInTheDocument();
  });

  it('displays enrollment confirmation without SMS functionality', () => {
    render(<ConfirmationStep {...defaultProps} />);
    
    // Should display confirmation without SMS-related elements
    expect(screen.getByText('Enrollment Confirmed!')).toBeInTheDocument();
    expect(screen.getByText('Keep this confirmation for your records')).toBeInTheDocument();
    expect(screen.getByText('Contact support for any questions or changes')).toBeInTheDocument();
  });
});