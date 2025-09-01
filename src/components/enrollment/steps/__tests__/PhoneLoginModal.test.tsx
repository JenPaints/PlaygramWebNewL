import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import PhoneLoginModal from '../PhoneLoginModal';
import { convexService } from '../../services/convexService';

// Mock the convex service
vi.mock('../../services/convexService', () => ({
  convexService: {
    authenticateWithPhone: vi.fn(),
    updatePassword: vi.fn(),
  },
}));

// Mock window.open
Object.defineProperty(window, 'open', {
  value: vi.fn(),
});

describe('PhoneLoginModal', () => {
  const mockOnClose = vi.fn();
  const mockPhoneNumber = '+919876543210';

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('when modal is closed', () => {
    it('should not render when isOpen is false', () => {
      render(
        <PhoneLoginModal
          isOpen={false}
          onClose={mockOnClose}
          phoneNumber={mockPhoneNumber}
        />
      );

      expect(screen.queryByText('Login to Coaching Platform')).not.toBeInTheDocument();
    });
  });

  describe('when modal is open', () => {
    it('should render login form with pre-filled phone number', () => {
      render(
        <PhoneLoginModal
          isOpen={true}
          onClose={mockOnClose}
          phoneNumber={mockPhoneNumber}
        />
      );

      expect(screen.getByText('Login to Coaching Platform')).toBeInTheDocument();
      expect(screen.getByDisplayValue(mockPhoneNumber)).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Enter your password')).toBeInTheDocument();
      expect(screen.getByText('Login to Platform')).toBeInTheDocument();
    });

    it('should show/hide password when toggle button is clicked', () => {
      render(
        <PhoneLoginModal
          isOpen={true}
          onClose={mockOnClose}
          phoneNumber={mockPhoneNumber}
        />
      );

      const passwordInput = screen.getByPlaceholderText('Enter your password');
      const toggleButton = screen.getByRole('button', { name: '' }); // Eye icon button

      expect(passwordInput).toHaveAttribute('type', 'password');

      fireEvent.click(toggleButton);
      expect(passwordInput).toHaveAttribute('type', 'text');

      fireEvent.click(toggleButton);
      expect(passwordInput).toHaveAttribute('type', 'password');
    });

    it('should close modal when close button is clicked', () => {
      render(
        <PhoneLoginModal
          isOpen={true}
          onClose={mockOnClose}
          phoneNumber={mockPhoneNumber}
        />
      );

      const closeButton = screen.getByRole('button', { name: '' }); // Close X button
      fireEvent.click(closeButton);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should show validation error for empty fields', async () => {
      render(
        <PhoneLoginModal
          isOpen={true}
          onClose={mockOnClose}
          phoneNumber=""
        />
      );

      const loginButton = screen.getByText('Login to Platform');
      fireEvent.click(loginButton);

      await waitFor(() => {
        expect(screen.getByText('Please enter both phone number and password')).toBeInTheDocument();
      });
    });
  });

  describe('successful login flow', () => {
    it('should handle successful login without password change', async () => {
      (convexService.authenticateWithPhone as any).mockResolvedValue({
        success: true,
        userId: 'user123',
      });

      render(
        <PhoneLoginModal
          isOpen={true}
          onClose={mockOnClose}
          phoneNumber={mockPhoneNumber}
        />
      );

      const passwordInput = screen.getByPlaceholderText('Enter your password');
      const loginButton = screen.getByText('Login to Platform');

      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(loginButton);

      await waitFor(() => {
        expect(convexService.authenticateWithPhone).toHaveBeenCalledWith(
          mockPhoneNumber,
          'password123'
        );
      });

      await waitFor(() => {
        expect(screen.getByText('Login Successful!')).toBeInTheDocument();
        expect(screen.getByText('Redirecting you to the coaching platform...')).toBeInTheDocument();
      });

      // Fast-forward timers to trigger redirect
      vi.advanceTimersByTime(2000);

      await waitFor(() => {
        expect(window.open).toHaveBeenCalledWith('https://acoustic-flamingo-124.app.com', '_blank');
        expect(mockOnClose).toHaveBeenCalled();
      });
    });

    it('should handle successful login with password change required', async () => {
      (convexService.authenticateWithPhone as any).mockResolvedValue({
        success: true,
        userId: 'user123',
        credentials: {
          username: mockPhoneNumber,
          temporaryPassword: 'temp123',
        },
      });

      render(
        <PhoneLoginModal
          isOpen={true}
          onClose={mockOnClose}
          phoneNumber={mockPhoneNumber}
        />
      );

      const passwordInput = screen.getByPlaceholderText('Enter your password');
      const loginButton = screen.getByText('Login to Platform');

      fireEvent.change(passwordInput, { target: { value: 'temp123' } });
      fireEvent.click(loginButton);

      await waitFor(() => {
        expect(screen.getByText('Set New Password')).toBeInTheDocument();
        expect(screen.getByText('Password Change Required')).toBeInTheDocument();
      });
    });

    it('should handle login failure', async () => {
      (convexService.authenticateWithPhone as any).mockResolvedValue({
        success: false,
        error: 'Invalid credentials',
      });

      render(
        <PhoneLoginModal
          isOpen={true}
          onClose={mockOnClose}
          phoneNumber={mockPhoneNumber}
        />
      );

      const passwordInput = screen.getByPlaceholderText('Enter your password');
      const loginButton = screen.getByText('Login to Platform');

      fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
      fireEvent.click(loginButton);

      await waitFor(() => {
        expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
      });
    });
  });

  describe('password change flow', () => {
    beforeEach(async () => {
      (convexService.authenticateWithPhone as any).mockResolvedValue({
        success: true,
        userId: 'user123',
        credentials: {
          username: mockPhoneNumber,
          temporaryPassword: 'temp123',
        },
      });

      render(
        <PhoneLoginModal
          isOpen={true}
          onClose={mockOnClose}
          phoneNumber={mockPhoneNumber}
        />
      );

      const passwordInput = screen.getByPlaceholderText('Enter your password');
      const loginButton = screen.getByText('Login to Platform');

      fireEvent.change(passwordInput, { target: { value: 'temp123' } });
      fireEvent.click(loginButton);

      await waitFor(() => {
        expect(screen.getByText('Set New Password')).toBeInTheDocument();
      });
    });

    it('should show password change form after temporary password login', () => {
      expect(screen.getByText('Set New Password')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Enter new password')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Confirm new password')).toBeInTheDocument();
      expect(screen.getByText('Update Password & Login')).toBeInTheDocument();
    });

    it('should validate password confirmation', async () => {
      const newPasswordInput = screen.getByPlaceholderText('Enter new password');
      const confirmPasswordInput = screen.getByPlaceholderText('Confirm new password');
      const updateButton = screen.getByText('Update Password & Login');

      fireEvent.change(newPasswordInput, { target: { value: 'newpassword123' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'differentpassword' } });
      fireEvent.click(updateButton);

      await waitFor(() => {
        expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
      });
    });

    it('should validate password length', async () => {
      const newPasswordInput = screen.getByPlaceholderText('Enter new password');
      const confirmPasswordInput = screen.getByPlaceholderText('Confirm new password');
      const updateButton = screen.getByText('Update Password & Login');

      fireEvent.change(newPasswordInput, { target: { value: 'short' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'short' } });
      fireEvent.click(updateButton);

      await waitFor(() => {
        expect(screen.getByText('Password must be at least 8 characters long')).toBeInTheDocument();
      });
    });

    it('should handle successful password update', async () => {
      (convexService.updatePassword as any).mockResolvedValue({
        success: true,
      });

      const newPasswordInput = screen.getByPlaceholderText('Enter new password');
      const confirmPasswordInput = screen.getByPlaceholderText('Confirm new password');
      const updateButton = screen.getByText('Update Password & Login');

      fireEvent.change(newPasswordInput, { target: { value: 'newpassword123' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'newpassword123' } });
      fireEvent.click(updateButton);

      await waitFor(() => {
        expect(convexService.updatePassword).toHaveBeenCalledWith('user123', 'newpassword123');
      });

      await waitFor(() => {
        expect(screen.getByText('Login Successful!')).toBeInTheDocument();
      });

      // Fast-forward timers to trigger redirect
      vi.advanceTimersByTime(2000);

      await waitFor(() => {
        expect(window.open).toHaveBeenCalledWith('https://acoustic-flamingo-124.app.com', '_blank');
        expect(mockOnClose).toHaveBeenCalled();
      });
    });

    it('should handle password update failure', async () => {
      (convexService.updatePassword as any).mockResolvedValue({
        success: false,
        error: 'Password update failed',
      });

      const newPasswordInput = screen.getByPlaceholderText('Enter new password');
      const confirmPasswordInput = screen.getByPlaceholderText('Confirm new password');
      const updateButton = screen.getByText('Update Password & Login');

      fireEvent.change(newPasswordInput, { target: { value: 'newpassword123' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'newpassword123' } });
      fireEvent.click(updateButton);

      await waitFor(() => {
        expect(screen.getByText('Password update failed')).toBeInTheDocument();
      });
    });
  });

  describe('loading states', () => {
    it('should show loading state during login', async () => {
      (convexService.authenticateWithPhone as any).mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve({ success: true, userId: 'user123' }), 1000))
      );

      render(
        <PhoneLoginModal
          isOpen={true}
          onClose={mockOnClose}
          phoneNumber={mockPhoneNumber}
        />
      );

      const passwordInput = screen.getByPlaceholderText('Enter your password');
      const loginButton = screen.getByText('Login to Platform');

      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(loginButton);

      expect(screen.getByText('Logging in...')).toBeInTheDocument();
      expect(loginButton).toBeDisabled();
    });

    it('should show loading state during password update', async () => {
      // First, set up the password change state
      (convexService.authenticateWithPhone as any).mockResolvedValue({
        success: true,
        userId: 'user123',
        credentials: { username: mockPhoneNumber, temporaryPassword: 'temp123' },
      });

      render(
        <PhoneLoginModal
          isOpen={true}
          onClose={mockOnClose}
          phoneNumber={mockPhoneNumber}
        />
      );

      // Login first
      const passwordInput = screen.getByPlaceholderText('Enter your password');
      fireEvent.change(passwordInput, { target: { value: 'temp123' } });
      fireEvent.click(screen.getByText('Login to Platform'));

      await waitFor(() => {
        expect(screen.getByText('Set New Password')).toBeInTheDocument();
      });

      // Mock slow password update
      (convexService.updatePassword as any).mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve({ success: true }), 1000))
      );

      const newPasswordInput = screen.getByPlaceholderText('Enter new password');
      const confirmPasswordInput = screen.getByPlaceholderText('Confirm new password');
      const updateButton = screen.getByText('Update Password & Login');

      fireEvent.change(newPasswordInput, { target: { value: 'newpassword123' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'newpassword123' } });
      fireEvent.click(updateButton);

      expect(screen.getByText('Updating Password...')).toBeInTheDocument();
      expect(updateButton).toBeDisabled();
    });
  });

  describe('help section', () => {
    it('should display help information', () => {
      render(
        <PhoneLoginModal
          isOpen={true}
          onClose={mockOnClose}
          phoneNumber={mockPhoneNumber}
        />
      );

      expect(screen.getByText('Need Help?')).toBeInTheDocument();
      expect(screen.getByText(/Use the same phone number from your enrollment/)).toBeInTheDocument();
      expect(screen.getByText(/Your temporary password was provided after enrollment/)).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'Contact Support' })).toHaveAttribute('href', 'mailto:support@playgram.com');
    });
  });
});