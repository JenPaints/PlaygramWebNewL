import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ConvexService, convexService } from '../convexService';
import type { EnrollmentData, PaymentData } from '../../types';

// Mock the Convex client
vi.mock('convex/react', () => ({
  ConvexReactClient: vi.fn().mockImplementation(() => ({
    mutation: vi.fn(),
    query: vi.fn(),
  })),
}));

// Mock the API
vi.mock('../../../../../convex/_generated/api', () => ({
  api: {
    enrollments: {
      createEnrollment: 'createEnrollment',
      updateEnrollmentPayment: 'updateEnrollmentPayment',
      getEnrollment: 'getEnrollment',
      getEnrollmentsByPhone: 'getEnrollmentsByPhone',
      getEnrollmentByPayment: 'getEnrollmentByPayment',
      getActiveEnrollments: 'getActiveEnrollments',
    },
  },
}));

describe('ConvexService', () => {
  let service: ConvexService;
  let mockClient: any;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new ConvexService();
    mockClient = (service as any).client;
  });

  describe('createEnrollment', () => {
    it('should create enrollment successfully', async () => {
      const mockEnrollmentId = 'enrollment_123';
      mockClient.mutation.mockResolvedValue(mockEnrollmentId);

      const enrollmentData = {
        phoneNumber: '+1234567890',
        sport: 'football' as const,
        planId: 'plan_12_month',
        planDuration: '12-month' as const,
        amount: 5000,
        currency: 'INR',
      };

      const result = await service.createEnrollment(enrollmentData);

      expect(result.success).toBe(true);
      expect(result.userId).toBe(mockEnrollmentId);
      expect(mockClient.mutation).toHaveBeenCalledWith('createEnrollment', {
        phoneNumber: '+1234567890',
        sport: 'football',
        planId: 'plan_12_month',
        planDuration: '12-month',
        amount: 5000,
        currency: 'INR',
        paymentStatus: 'pending',
        razorpayOrderId: undefined,
      });
    });

    it('should handle enrollment creation failure', async () => {
      const error = new Error('Database error');
      mockClient.mutation.mockRejectedValue(error);

      const enrollmentData = {
        phoneNumber: '+1234567890',
        sport: 'football' as const,
        planId: 'plan_12_month',
        planDuration: '12-month' as const,
        amount: 5000,
        currency: 'INR',
      };

      const result = await service.createEnrollment(enrollmentData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Database error');
    });
  });

  describe('updateEnrollmentPayment', () => {
    it('should update payment successfully', async () => {
      mockClient.mutation.mockResolvedValue({ success: true });

      const paymentUpdate = {
        enrollmentId: 'enrollment_123',
        paymentId: 'payment_456',
        paymentStatus: 'success' as const,
        razorpayPaymentId: 'razorpay_789',
        sessionStartDate: Date.now(),
        courtLocation: 'Court A',
      };

      const result = await service.updateEnrollmentPayment(paymentUpdate);

      expect(result.success).toBe(true);
      expect(mockClient.mutation).toHaveBeenCalledWith('updateEnrollmentPayment', paymentUpdate);
    });

    it('should handle payment update failure', async () => {
      const error = new Error('Update failed');
      mockClient.mutation.mockRejectedValue(error);

      const paymentUpdate = {
        enrollmentId: 'enrollment_123',
        paymentId: 'payment_456',
        paymentStatus: 'success' as const,
      };

      const result = await service.updateEnrollmentPayment(paymentUpdate);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Update failed');
    });
  });

  describe('getEnrollment', () => {
    it('should get enrollment successfully', async () => {
      const mockEnrollment = {
        _id: 'enrollment_123',
        phoneNumber: '+1234567890',
        sport: 'football',
        status: 'active',
      };
      mockClient.query.mockResolvedValue(mockEnrollment);

      const result = await service.getEnrollment('enrollment_123');

      expect(result).toEqual(mockEnrollment);
      expect(mockClient.query).toHaveBeenCalledWith('getEnrollment', {
        enrollmentId: 'enrollment_123',
      });
    });

    it('should handle get enrollment failure', async () => {
      mockClient.query.mockRejectedValue(new Error('Query failed'));

      const result = await service.getEnrollment('enrollment_123');

      expect(result).toBeNull();
    });
  });

  describe('getEnrollmentsByPhone', () => {
    it('should get enrollments by phone successfully', async () => {
      const mockEnrollments = [
        { _id: 'enrollment_1', phoneNumber: '+1234567890' },
        { _id: 'enrollment_2', phoneNumber: '+1234567890' },
      ];
      mockClient.query.mockResolvedValue(mockEnrollments);

      const result = await service.getEnrollmentsByPhone('+1234567890');

      expect(result).toEqual(mockEnrollments);
      expect(mockClient.query).toHaveBeenCalledWith('getEnrollmentsByPhone', {
        phoneNumber: '+1234567890',
      });
    });

    it('should handle get enrollments by phone failure', async () => {
      mockClient.query.mockRejectedValue(new Error('Query failed'));

      const result = await service.getEnrollmentsByPhone('+1234567890');

      expect(result).toEqual([]);
    });
  });

  describe('generateUserCredentials', () => {
    it('should generate valid user credentials', () => {
      const phoneNumber = '+1234567890';
      const enrollmentId = 'enrollment_123';

      const credentials = service.generateUserCredentials(phoneNumber, enrollmentId);

      expect(credentials.username).toMatch(/^user7890[a-z0-9]{4}$/);
      expect(credentials.temporaryPassword).toHaveLength(8);
      expect(credentials.enrollmentId).toBe(enrollmentId);
      expect(credentials.accessInstructions).toContain(credentials.username);
      expect(credentials.accessInstructions).toContain(credentials.temporaryPassword);
      expect(credentials.accessInstructions).toContain(enrollmentId);
    });
  });

  describe('transferEnrollmentData', () => {
    it('should transfer enrollment data successfully', async () => {
      const mockEnrollmentId = 'enrollment_123';
      mockClient.mutation
        .mockResolvedValueOnce(mockEnrollmentId) // createEnrollment
        .mockResolvedValueOnce({ success: true }); // updateEnrollmentPayment

      const enrollmentData: EnrollmentData = {
        phoneNumber: '+1234567890',
        sport: 'football',
        planId: 'plan_12_month',
        status: 'active',
        enrollmentDate: new Date(),
        paymentId: 'payment_456',
        sessionStartDate: new Date(),
        courtLocation: 'Court A',
      };

      const paymentData: PaymentData = {
        orderId: 'order_789',
        amount: 5000,
        currency: 'INR',
        planId: 'plan_12_month',
        userPhone: '+1234567890',
        timestamp: Date.now(),
      };

      const result = await service.transferEnrollmentData(enrollmentData, paymentData);

      expect(result.success).toBe(true);
      expect(result.userId).toBe(mockEnrollmentId);
      expect(result.credentials).toBeDefined();
      expect(result.credentials?.username).toMatch(/^user7890[a-z0-9]{4}$/);
      expect(result.credentials?.temporaryPassword).toHaveLength(8);
    });

    it('should handle transfer failure during creation', async () => {
      mockClient.mutation.mockRejectedValue(new Error('Creation failed'));

      const enrollmentData: EnrollmentData = {
        phoneNumber: '+1234567890',
        sport: 'football',
        planId: 'plan_12_month',
        status: 'active',
        enrollmentDate: new Date(),
      };

      const paymentData: PaymentData = {
        orderId: 'order_789',
        amount: 5000,
        currency: 'INR',
        planId: 'plan_12_month',
        userPhone: '+1234567890',
        timestamp: Date.now(),
      };

      const result = await service.transferEnrollmentData(enrollmentData, paymentData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Creation failed');
    });
  });

  describe('healthCheck', () => {
    it('should return true when connection is healthy', async () => {
      mockClient.query.mockResolvedValue([]);

      const result = await service.healthCheck();

      expect(result).toBe(true);
      expect(mockClient.query).toHaveBeenCalledWith('getActiveEnrollments');
    });

    it('should return false when connection fails', async () => {
      mockClient.query.mockRejectedValue(new Error('Connection failed'));

      const result = await service.healthCheck();

      expect(result).toBe(false);
    });
  });

  describe('extractPlanDuration', () => {
    it('should extract 12-month duration correctly', () => {
      const service = new ConvexService();
      
      expect((service as any).extractPlanDuration('plan_12_month')).toBe('12-month');
      expect((service as any).extractPlanDuration('yearly_plan')).toBe('12-month');
      expect((service as any).extractPlanDuration('annual_subscription')).toBe('12-month');
    });

    it('should extract 3-month duration correctly', () => {
      const service = new ConvexService();
      
      expect((service as any).extractPlanDuration('plan_3_month')).toBe('3-month');
      expect((service as any).extractPlanDuration('quarterly_plan')).toBe('3-month');
    });

    it('should default to 1-month duration', () => {
      const service = new ConvexService();
      
      expect((service as any).extractPlanDuration('monthly_plan')).toBe('1-month');
      expect((service as any).extractPlanDuration('unknown_plan')).toBe('1-month');
    });
  });
});

describe('convexService singleton', () => {
  it('should export a singleton instance', () => {
    expect(convexService).toBeInstanceOf(ConvexService);
  });
});