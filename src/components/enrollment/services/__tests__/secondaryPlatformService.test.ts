import { describe, it, expect, vi, beforeEach } from 'vitest';
import { 
  SecondaryPlatformService, 
  secondaryPlatformService,
  RegistrationResult,
  AccountLinkingData 
} from '../secondaryPlatformService';
import { convexService } from '../convexService';
import type { EnrollmentData, PaymentRecord } from '../../types';

// Mock the convex service
vi.mock('../convexService', () => ({
  convexService: {
    createEnrollment: vi.fn(),
    updateEnrollmentPayment: vi.fn(),
    generateUserCredentials: vi.fn(),
    healthCheck: vi.fn(),
  },
}));

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('SecondaryPlatformService', () => {
  let service: SecondaryPlatformService;
  let mockEnrollmentData: EnrollmentData;
  let mockPaymentRecord: PaymentRecord;

  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue('[]');
    
    service = new SecondaryPlatformService();
    
    mockEnrollmentData = {
      phoneNumber: '+1234567890',
      sport: 'football',
      planId: 'plan_12_month',
      status: 'active',
      enrollmentDate: new Date(),
      id: 'enrollment_123',
      paymentId: 'payment_456',
      sessionStartDate: new Date(),
      courtLocation: 'Court A',
    };

    mockPaymentRecord = {
      id: 'payment_456',
      enrollmentId: 'enrollment_123',
      razorpayOrderId: 'order_789',
      razorpayPaymentId: 'payment_abc',
      amount: 5000,
      currency: 'INR',
      status: 'captured',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  });

  describe('registerUserAfterPayment', () => {
    it('should register user successfully on first attempt', async () => {
      const mockSecondaryEnrollmentId = 'secondary_enrollment_123';
      const mockCredentials = {
        username: 'user7890abcd',
        temporaryPassword: 'TempPass1',
        enrollmentId: mockSecondaryEnrollmentId,
        accessInstructions: 'Instructions...',
      };

      (convexService.createEnrollment as any).mockResolvedValue({
        success: true,
        userId: mockSecondaryEnrollmentId,
      });

      (convexService.updateEnrollmentPayment as any).mockResolvedValue({
        success: true,
      });

      (convexService.generateUserCredentials as any).mockReturnValue(mockCredentials);

      const result = await service.registerUserAfterPayment(mockEnrollmentData, mockPaymentRecord);

      expect(result.success).toBe(true);
      expect(result.enrollmentId).toBe(mockSecondaryEnrollmentId);
      expect(result.credentials).toEqual({
        username: mockCredentials.username,
        temporaryPassword: mockCredentials.temporaryPassword,
      });

      expect(convexService.createEnrollment).toHaveBeenCalledWith({
        phoneNumber: '+1234567890',
        sport: 'football',
        planId: 'plan_12_month',
        planDuration: '12-month',
        amount: 5000,
        currency: 'INR',
        paymentStatus: 'success',
        razorpayOrderId: 'order_789',
      });

      expect(convexService.updateEnrollmentPayment).toHaveBeenCalledWith({
        enrollmentId: mockSecondaryEnrollmentId,
        paymentId: 'payment_abc',
        paymentStatus: 'success',
        razorpayPaymentId: 'payment_abc',
        sessionStartDate: mockEnrollmentData.sessionStartDate?.getTime(),
        courtLocation: 'Court A',
      });
    });

    it('should handle enrollment creation failure', async () => {
      (convexService.createEnrollment as any).mockResolvedValue({
        success: false,
        error: 'Database connection failed',
      });

      const result = await service.registerUserAfterPayment(mockEnrollmentData, mockPaymentRecord);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Database connection failed');
      expect(result.retryable).toBe(true);
    });

    it('should handle payment update failure', async () => {
      (convexService.createEnrollment as any).mockResolvedValue({
        success: true,
        userId: 'secondary_enrollment_123',
      });

      (convexService.updateEnrollmentPayment as any).mockResolvedValue({
        success: false,
        error: 'Payment update failed',
      });

      const result = await service.registerUserAfterPayment(mockEnrollmentData, mockPaymentRecord);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Payment update failed');
    });

    it('should stop retrying after maximum attempts', async () => {
      (convexService.createEnrollment as any).mockResolvedValue({
        success: false,
        error: 'Persistent error',
      });

      // Simulate multiple failed attempts
      for (let i = 0; i < 3; i++) {
        await service.registerUserAfterPayment(mockEnrollmentData, mockPaymentRecord);
      }

      // Fourth attempt should return max attempts exceeded
      const result = await service.registerUserAfterPayment(mockEnrollmentData, mockPaymentRecord);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Maximum registration attempts exceeded');
      expect(result.retryable).toBe(false);
    });
  });

  describe('handleRegistrationWithRetry', () => {
    it('should succeed on first attempt', async () => {
      const mockSecondaryEnrollmentId = 'secondary_enrollment_123';
      
      (convexService.createEnrollment as any).mockResolvedValue({
        success: true,
        userId: mockSecondaryEnrollmentId,
      });

      (convexService.updateEnrollmentPayment as any).mockResolvedValue({
        success: true,
      });

      (convexService.generateUserCredentials as any).mockReturnValue({
        username: 'user7890abcd',
        temporaryPassword: 'TempPass1',
        enrollmentId: mockSecondaryEnrollmentId,
        accessInstructions: 'Instructions...',
      });

      const result = await service.handleRegistrationWithRetry(mockEnrollmentData, mockPaymentRecord);

      expect(result.success).toBe(true);
      expect(result.enrollmentId).toBe(mockSecondaryEnrollmentId);
    });

    it('should retry on retryable failures', async () => {
      let attemptCount = 0;
      
      (convexService.createEnrollment as any).mockImplementation(() => {
        attemptCount++;
        if (attemptCount < 3) {
          return Promise.resolve({
            success: false,
            error: 'Network timeout',
          });
        }
        return Promise.resolve({
          success: true,
          userId: 'secondary_enrollment_123',
        });
      });

      (convexService.updateEnrollmentPayment as any).mockResolvedValue({
        success: true,
      });

      (convexService.generateUserCredentials as any).mockReturnValue({
        username: 'user7890abcd',
        temporaryPassword: 'TempPass1',
        enrollmentId: 'secondary_enrollment_123',
        accessInstructions: 'Instructions...',
      });

      const result = await service.handleRegistrationWithRetry(mockEnrollmentData, mockPaymentRecord);

      expect(result.success).toBe(true);
      expect(attemptCount).toBe(3);
    });

    it('should stop retrying on non-retryable failures', async () => {
      (convexService.createEnrollment as any).mockResolvedValue({
        success: false,
        error: 'Invalid data format',
      });

      // Mock isRetryableError to return false for this error
      const originalIsRetryableError = (service as any).isRetryableError;
      (service as any).isRetryableError = vi.fn().mockReturnValue(false);

      const result = await service.handleRegistrationWithRetry(mockEnrollmentData, mockPaymentRecord);

      expect(result.success).toBe(false);
      expect(result.retryable).toBe(false);

      // Restore original method
      (service as any).isRetryableError = originalIsRetryableError;
    });
  });

  describe('storeAccountLinking and getAccountLinking', () => {
    it('should store and retrieve account linking data', async () => {
      const linkingData: AccountLinkingData = {
        primaryEnrollmentId: 'primary_123',
        secondaryEnrollmentId: 'secondary_456',
        phoneNumber: '+1234567890',
        linkingTimestamp: Date.now(),
      };

      // Store linking data
      await (service as any).storeAccountLinking(linkingData);

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'account_linking_+1234567890',
        JSON.stringify([linkingData])
      );

      // Mock localStorage to return the stored data
      localStorageMock.getItem.mockReturnValue(JSON.stringify([linkingData]));

      // Retrieve linking data
      const retrievedData = await service.getAccountLinking('+1234567890');

      expect(retrievedData).toEqual([linkingData]);
      expect(localStorageMock.getItem).toHaveBeenCalledWith('account_linking_+1234567890');
    });

    it('should handle storage errors gracefully', async () => {
      localStorageMock.setItem.mockImplementation(() => {
        throw new Error('Storage quota exceeded');
      });

      const linkingData: AccountLinkingData = {
        primaryEnrollmentId: 'primary_123',
        secondaryEnrollmentId: 'secondary_456',
        phoneNumber: '+1234567890',
        linkingTimestamp: Date.now(),
      };

      // Should not throw error
      await expect((service as any).storeAccountLinking(linkingData)).resolves.toBeUndefined();
    });
  });

  describe('isRetryableError', () => {
    it('should identify retryable errors correctly', () => {
      const retryableErrors = [
        { name: 'NetworkError' },
        { name: 'TimeoutError' },
        { status: 500 },
        { status: 502 },
        { status: 503 },
        { status: 429 },
        { message: 'Service temporarily unavailable' },
      ];

      retryableErrors.forEach(error => {
        expect((service as any).isRetryableError(error)).toBe(true);
      });
    });

    it('should identify non-retryable errors correctly', () => {
      const nonRetryableErrors = [
        { status: 400 },
        { status: 401 },
        { status: 403 },
        { status: 404 },
        { status: 422 },
      ];

      nonRetryableErrors.forEach(error => {
        expect((service as any).isRetryableError(error)).toBe(false);
      });
    });
  });

  describe('extractPlanDuration', () => {
    it('should extract plan duration correctly', () => {
      expect((service as any).extractPlanDuration('plan_12_month')).toBe('12-month');
      expect((service as any).extractPlanDuration('yearly_plan')).toBe('12-month');
      expect((service as any).extractPlanDuration('annual_subscription')).toBe('12-month');
      
      expect((service as any).extractPlanDuration('plan_3_month')).toBe('3-month');
      expect((service as any).extractPlanDuration('quarterly_plan')).toBe('3-month');
      
      expect((service as any).extractPlanDuration('monthly_plan')).toBe('1-month');
      expect((service as any).extractPlanDuration('unknown_plan')).toBe('1-month');
    });
  });

  describe('healthCheck', () => {
    it('should return true when convex service is healthy', async () => {
      (convexService.healthCheck as any).mockResolvedValue(true);

      const result = await service.healthCheck();

      expect(result).toBe(true);
      expect(convexService.healthCheck).toHaveBeenCalled();
    });

    it('should return false when convex service is unhealthy', async () => {
      (convexService.healthCheck as any).mockResolvedValue(false);

      const result = await service.healthCheck();

      expect(result).toBe(false);
    });

    it('should handle health check errors', async () => {
      (convexService.healthCheck as any).mockRejectedValue(new Error('Connection failed'));

      const result = await service.healthCheck();

      expect(result).toBe(false);
    });
  });

  describe('retry attempt management', () => {
    it('should track and clear retry attempts', () => {
      const phoneNumber = '+1234567890';
      const paymentId = 'payment_123';

      // Initially should be 0
      expect(service.getRetryAttemptCount(phoneNumber, paymentId)).toBe(0);

      // Clear attempts (should not throw)
      service.clearRetryAttempts(phoneNumber, paymentId);

      // Should still be 0
      expect(service.getRetryAttemptCount(phoneNumber, paymentId)).toBe(0);
    });
  });
});

describe('secondaryPlatformService singleton', () => {
  it('should export a singleton instance', () => {
    expect(secondaryPlatformService).toBeInstanceOf(SecondaryPlatformService);
  });
});