import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import EnrollmentModal from '../EnrollmentModal';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

describe('EnrollmentModal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    sport: 'football' as const,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Mock document.body.style
    Object.defineProperty(document.body, 'style', {
      value: { overflow: '' },
      writable: true,
    });
  });

  afterEach(() => {
    document.body.style.overflow = 'unset';
  });

  it('renders modal when isOpen is true', () => {
    render(<EnrollmentModal {...defaultProps} />);
    
    expect(screen.getByText('Enroll in Football Coaching')).toBeInTheDocument();
    expect(screen.getByText('Step 1 of 5: Authentication')).toBeInTheDocument();
  });

  it('does not render modal when isOpen is false', () => {
    render(<EnrollmentModal {...defaultProps} isOpen={false} />);
    
    expect(screen.queryByText('Enroll in Football Coaching')).not.toBeInTheDocument();
  });

  it('displays progress indicator with correct steps', () => {
    render(<EnrollmentModal {...defaultProps} />);
    
    expect(screen.getByText('Authentication')).toBeInTheDocument();
    expect(screen.getByText('Court Details')).toBeInTheDocument();
    expect(screen.getByText('Pricing')).toBeInTheDocument();
    expect(screen.getByText('Payment')).toBeInTheDocument();
    expect(screen.getByText('Confirmation')).toBeInTheDocument();
  });

  it('highlights current step in progress indicator', () => {
    render(<EnrollmentModal {...defaultProps} />);
    
    // First step should be highlighted (current)
    const authStep = screen.getByText('🔐');
    expect(authStep.closest('div')).toHaveClass('bg-blue-600');
  });

  it('allows step navigation via test buttons', async () => {
    render(<EnrollmentModal {...defaultProps} />);
    
    // Click on Court Details step
    const courtButton = screen.getByText('🏟️ Court Details');
    fireEvent.click(courtButton);
    
    await waitFor(() => {
      expect(screen.getByText('Step 2 of 5: Court Details')).toBeInTheDocument();
    });
  });

  it('calls onClose when close button is clicked', () => {
    const onClose = vi.fn();
    render(<EnrollmentModal {...defaultProps} onClose={onClose} />);
    
    const closeButton = screen.getByLabelText('Close modal');
    fireEvent.click(closeButton);
    
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when backdrop is clicked', () => {
    const onClose = vi.fn();
    render(<EnrollmentModal {...defaultProps} onClose={onClose} />);
    
    const backdrop = screen.getByRole('dialog').parentElement;
    fireEvent.click(backdrop!);
    
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('prevents background scrolling when modal is open', () => {
    render(<EnrollmentModal {...defaultProps} />);
    
    expect(document.body.style.overflow).toBe('hidden');
  });

  it('restores background scrolling when modal is closed', () => {
    const { rerender } = render(<EnrollmentModal {...defaultProps} />);
    
    expect(document.body.style.overflow).toBe('hidden');
    
    rerender(<EnrollmentModal {...defaultProps} isOpen={false} />);
    
    expect(document.body.style.overflow).toBe('unset');
  });

  it('handles escape key to close modal', () => {
    const onClose = vi.fn();
    render(<EnrollmentModal {...defaultProps} onClose={onClose} />);
    
    fireEvent.keyDown(document, { key: 'Escape' });
    
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('saves state to localStorage when modal is open', () => {
    render(<EnrollmentModal {...defaultProps} />);
    
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'enrollment_state',
      expect.stringContaining('"sport":"football"')
    );
  });

  it('restores state from localStorage on initialization', () => {
    const savedState = {
      state: {
        currentStep: 'pricing',
        userPhone: '+1234567890',
        isAuthenticated: true,
        selectedPlan: null,
        paymentStatus: 'pending',
        enrollmentData: {
          phoneNumber: '+1234567890',
          sport: 'basketball',
          planId: '',
          status: 'pending',
          enrollmentDate: new Date()
        },
        errors: {}
      },
      timestamp: Date.now() - 5000 // 5 seconds ago
    };
    
    localStorageMock.getItem.mockReturnValue(JSON.stringify(savedState));
    
    render(<EnrollmentModal {...defaultProps} />);
    
    expect(screen.getByText('Step 3 of 5: Pricing')).toBeInTheDocument();
    expect(screen.getByText('Phone: +1234567890')).toBeInTheDocument();
    expect(screen.getByText('Authenticated: Yes')).toBeInTheDocument();
  });

  it('ignores expired state from localStorage', () => {
    const expiredState = {
      state: {
        currentStep: 'pricing',
        userPhone: '+1234567890',
        isAuthenticated: true,
      },
      timestamp: Date.now() - (15 * 60 * 1000) // 15 minutes ago (expired)
    };
    
    localStorageMock.getItem.mockReturnValue(JSON.stringify(expiredState));
    
    render(<EnrollmentModal {...defaultProps} />);
    
    // Should start from beginning
    expect(screen.getByText('Step 1 of 5: Authentication')).toBeInTheDocument();
    expect(screen.getByText('Authenticated: No')).toBeInTheDocument();
  });

  it('updates state when test buttons are clicked', async () => {
    render(<EnrollmentModal {...defaultProps} />);
    
    // Initially not authenticated
    expect(screen.getByText('Authenticated: No')).toBeInTheDocument();
    
    // Click toggle auth button
    const toggleAuthButton = screen.getByText('Toggle Auth');
    fireEvent.click(toggleAuthButton);
    
    await waitFor(() => {
      expect(screen.getByText('Authenticated: Yes')).toBeInTheDocument();
    });
  });

  it('clears saved state when clear button is clicked', () => {
    render(<EnrollmentModal {...defaultProps} />);
    
    const clearButton = screen.getByText('Clear Saved State');
    fireEvent.click(clearButton);
    
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('enrollment_state');
  });
});