import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import SecondaryPlatformCredentials from '../SecondaryPlatformCredentials';
import { RegistrationResult } from '../../services/secondaryPlatformService';

// Mock clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: vi.fn(),
  },
});

// Mock window.open
Object.defineProperty(window, 'open', {
  value: vi.fn(),
});

describe('SecondaryPlatformCredentials', () => {
  const mockPhoneNumber = '+1234567890';
  const mockOnRetryRegistration = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('when registration is successful with credentials', () => {
    const successfulResult: RegistrationResult = {
      success: true,
      enrollmentId: 'secondary_123',
      credentials: {
        username: 'user7890abcd',
        temporaryPassword: 'TempPass1',
      },
    };

    it('should display credentials and access information', () => {
      render(
        <SecondaryPlatformCredentials
          registrationResult={successfulResult}
          phoneNumber={mockPhoneNumber}
          onRetryRegistration={mockOnRetryRegistration}
        />
      );

      expect(screen.getByText('Coaching Platform Access Ready!')).toBeInTheDocument();
      expect(screen.getByText('user7890abcd')).toBeInTheDocument();
      expect(screen.getByText('••••••••')).toBeInTheDocument(); // Password hidden by default
      expect(screen.getByText('secondary_123')).toBeInTheDocument();
    });

    it('should show/hide password when toggle button is clicked', () => {
      render(
        <SecondaryPlatformCredentials
          registrationResult={successfulResult}
          phoneNumber={mockPhoneNumber}
          onRetryRegistration={mockOnRetryRegistration}
        />
      );

      const toggleButton = screen.getByTitle('Show password');
      fireEvent.click(toggleButton);

      expect(screen.getByText('TempPass1')).toBeInTheDocument();
      expect(screen.queryByText('••••••••')).not.toBeInTheDocument();

      fireEvent.click(toggleButton);
      expect(screen.getByText('••••••••')).toBeInTheDocument();
      expect(screen.queryByText('TempPass1')).not.toBeInTheDocument();
    });

    it('should copy username to clipboard when copy button is clicked', async () => {
      (navigator.clipboard.writeText as any).mockResolvedValue(undefined);

      render(
        <SecondaryPlatformCredentials
          registrationResult={successfulResult}
          phoneNumber={mockPhoneNumber}
          onRetryRegistration={mockOnRetryRegistration}
        />
      );

      const copyButtons = screen.getAllByTitle('Copy username');
      fireEvent.click(copyButtons[0]);

      expect(navigator.clipboard.writeText).toHaveBeenCalledWith('user7890abcd');

      // Check for success indicator
      await waitFor(() => {
        expect(screen.getByTitle('Copy username').querySelector('svg')).toHaveClass('text-green-500');
      });
    });

    it('should copy password to clipboard when copy button is clicked', async () => {
      (navigator.clipboard.writeText as any).mockResolvedValue(undefined);

      render(
        <SecondaryPlatformCredentials
          registrationResult={successfulResult}
          phoneNumber={mockPhoneNumber}
          onRetryRegistration={mockOnRetryRegistration}
        />
      );

      const copyButtons = screen.getAllByTitle('Copy password');
      fireEvent.click(copyButtons[0]);

      expect(navigator.clipboard.writeText).toHaveBeenCalledWith('TempPass1');
    });

    it('should copy enrollment ID to clipboard when copy button is clicked', async () => {
      (navigator.clipboard.writeText as any).mockResolvedValue(undefined);

      render(
        <SecondaryPlatformCredentials
          registrationResult={successfulResult}
          phoneNumber={mockPhoneNumber}
          onRetryRegistration={mockOnRetryRegistration}
        />
      );

      const copyButtons = screen.getAllByTitle('Copy enrollment ID');
      fireEvent.click(copyButtons[0]);

      expect(navigator.clipboard.writeText).toHaveBeenCalledWith('secondary_123');
    });

    it('should copy all credentials when copy all button is clicked', async () => {
      (navigator.clipboard.writeText as any).mockResolvedValue(undefined);

      render(
        <SecondaryPlatformCredentials
          registrationResult={successfulResult}
          phoneNumber={mockPhoneNumber}
          onRetryRegistration={mockOnRetryRegistration}
        />
      );

      const copyAllButton = screen.getByText('Copy All Credentials');
      fireEvent.click(copyAllButton);

      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
        'Username: user7890abcd\nPassword: TempPass1\nEnrollment ID: secondary_123'
      );
    });

    it('should open coaching platform when access button is clicked', () => {
      render(
        <SecondaryPlatformCredentials
          registrationResult={successfulResult}
          phoneNumber={mockPhoneNumber}
          onRetryRegistration={mockOnRetryRegistration}
        />
      );

      const accessButton = screen.getByText('Access Coaching Platform');
      fireEvent.click(accessButton);

      expect(window.open).toHaveBeenCalledWith('https://acoustic-flamingo-124.app.com', '_blank');
    });

    it('should handle clipboard copy errors gracefully', async () => {
      (navigator.clipboard.writeText as any).mockRejectedValue(new Error('Clipboard error'));
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      render(
        <SecondaryPlatformCredentials
          registrationResult={successfulResult}
          phoneNumber={mockPhoneNumber}
          onRetryRegistration={mockOnRetryRegistration}
        />
      );

      const copyButtons = screen.getAllByTitle('Copy username');
      fireEvent.click(copyButtons[0]);

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('Failed to copy to clipboard:', expect.any(Error));
      });

      consoleSpy.mockRestore();
    });
  });

  describe('when registration is successful without credentials', () => {
    const successfulResultNoCredentials: RegistrationResult = {
      success: true,
      enrollmentId: 'secondary_123',
    };

    it('should display success message without credentials', () => {
      render(
        <SecondaryPlatformCredentials
          registrationResult={successfulResultNoCredentials}
          phoneNumber={mockPhoneNumber}
          onRetryRegistration={mockOnRetryRegistration}
        />
      );

      expect(screen.getByText('Secondary Platform Registration Successful')).toBeInTheDocument();
      expect(screen.getByText(/Access credentials will be sent to your registered phone number/)).toBeInTheDocument();
      expect(screen.queryByText('Username')).not.toBeInTheDocument();
      expect(screen.queryByText('Temporary Password')).not.toBeInTheDocument();
    });
  });

  describe('when registration fails with retryable error', () => {
    const failedRetryableResult: RegistrationResult = {
      success: false,
      error: 'Network timeout error',
      retryable: true,
    };

    it('should display error message with retry button', () => {
      render(
        <SecondaryPlatformCredentials
          registrationResult={failedRetryableResult}
          phoneNumber={mockPhoneNumber}
          onRetryRegistration={mockOnRetryRegistration}
        />
      );

      expect(screen.getByText('Secondary Platform Registration')).toBeInTheDocument();
      expect(screen.getByText(/We encountered an issue while setting up your account/)).toBeInTheDocument();
      expect(screen.getByText('Network timeout error')).toBeInTheDocument();
      expect(screen.getByText('Retry Registration')).toBeInTheDocument();
    });

    it('should call onRetryRegistration when retry button is clicked', () => {
      render(
        <SecondaryPlatformCredentials
          registrationResult={failedRetryableResult}
          phoneNumber={mockPhoneNumber}
          onRetryRegistration={mockOnRetryRegistration}
        />
      );

      const retryButton = screen.getByText('Retry Registration');
      fireEvent.click(retryButton);

      expect(mockOnRetryRegistration).toHaveBeenCalledTimes(1);
    });

    it('should not show retry button when onRetryRegistration is not provided', () => {
      render(
        <SecondaryPlatformCredentials
          registrationResult={failedRetryableResult}
          phoneNumber={mockPhoneNumber}
        />
      );

      expect(screen.queryByText('Retry Registration')).not.toBeInTheDocument();
    });
  });

  describe('when registration fails with non-retryable error', () => {
    const failedNonRetryableResult: RegistrationResult = {
      success: false,
      error: 'Invalid data format',
      retryable: false,
    };

    it('should display error message with support contact information', () => {
      render(
        <SecondaryPlatformCredentials
          registrationResult={failedNonRetryableResult}
          phoneNumber={mockPhoneNumber}
          onRetryRegistration={mockOnRetryRegistration}
        />
      );

      expect(screen.getByText('Secondary Platform Registration')).toBeInTheDocument();
      expect(screen.getByText('Invalid data format')).toBeInTheDocument();
      expect(screen.getByText(/Please contact our support team/)).toBeInTheDocument();
      expect(screen.getByText('support@playgram.com')).toBeInTheDocument();
      expect(screen.getByText('+91-9876543210')).toBeInTheDocument();
      expect(screen.queryByText('Retry Registration')).not.toBeInTheDocument();
    });
  });

  describe('accessibility and user experience', () => {
    const successfulResult: RegistrationResult = {
      success: true,
      enrollmentId: 'secondary_123',
      credentials: {
        username: 'user7890abcd',
        temporaryPassword: 'TempPass1',
      },
    };

    it('should have proper ARIA labels and titles', () => {
      render(
        <SecondaryPlatformCredentials
          registrationResult={successfulResult}
          phoneNumber={mockPhoneNumber}
          onRetryRegistration={mockOnRetryRegistration}
        />
      );

      expect(screen.getByTitle('Show password')).toBeInTheDocument();
      expect(screen.getByTitle('Copy username')).toBeInTheDocument();
      expect(screen.getByTitle('Copy password')).toBeInTheDocument();
      expect(screen.getByTitle('Copy enrollment ID')).toBeInTheDocument();
    });

    it('should display platform features and instructions', () => {
      render(
        <SecondaryPlatformCredentials
          registrationResult={successfulResult}
          phoneNumber={mockPhoneNumber}
          onRetryRegistration={mockOnRetryRegistration}
        />
      );

      expect(screen.getByText('Platform Features')).toBeInTheDocument();
      expect(screen.getByText(/Track your coaching progress and performance metrics/)).toBeInTheDocument();
      expect(screen.getByText('How to Access Your Coaching Platform')).toBeInTheDocument();
      expect(screen.getByText(/Click the "Access Coaching Platform" button below/)).toBeInTheDocument();
    });

    it('should display security notice', () => {
      render(
        <SecondaryPlatformCredentials
          registrationResult={successfulResult}
          phoneNumber={mockPhoneNumber}
          onRetryRegistration={mockOnRetryRegistration}
        />
      );

      expect(screen.getByText('Important Security Notice')).toBeInTheDocument();
      expect(screen.getByText(/Please change your temporary password immediately/)).toBeInTheDocument();
    });

    it('should display support contact information', () => {
      render(
        <SecondaryPlatformCredentials
          registrationResult={successfulResult}
          phoneNumber={mockPhoneNumber}
          onRetryRegistration={mockOnRetryRegistration}
        />
      );

      expect(screen.getByText(/Need help\? Contact our support team/)).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'support@playgram.com' })).toHaveAttribute('href', 'mailto:support@playgram.com');
      expect(screen.getByRole('link', { name: '+91-9876543210' })).toHaveAttribute('href', 'tel:+919876543210');
    });
  });
});