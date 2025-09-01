import { ConvexReactClient } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import type { 
  EnrollmentData, 
  PaymentData, 
  SecondaryPlatformResponse,
  PlanDuration,
  Sport
} from "../types";

// Convex client configuration
const CONVEX_URL = "https://acoustic-flamingo-124.convex.cloud";

// Create Convex client instance for secondary platform
const convexClient = new ConvexReactClient(CONVEX_URL);

// Interface for enrollment creation data
export interface ConvexEnrollmentData {
  phoneNumber: string;
  sport: Sport;
  planId: string;
  planDuration: PlanDuration;
  amount: number;
  currency: string;
  paymentStatus?: 'pending' | 'processing' | 'success' | 'failed';
  razorpayOrderId?: string;
}

// Interface for payment update data
export interface ConvexPaymentUpdate {
  enrollmentId: string;
  paymentId: string;
  paymentStatus: 'pending' | 'processing' | 'success' | 'failed';
  razorpayPaymentId?: string;
  sessionStartDate?: number;
  courtLocation?: string;
}

// Interface for user credentials
export interface UserCredentials {
  username: string;
  temporaryPassword: string;
  enrollmentId: string;
  accessInstructions: string;
}

/**
 * Convex Integration Service
 * Handles communication with the secondary platform (Convex database)
 */
export class ConvexService {
  private client: ConvexReactClient;

  constructor() {
    this.client = convexClient;
  }

  /**
   * Create a new enrollment record in the secondary platform
   */
  async createEnrollment(data: ConvexEnrollmentData): Promise<SecondaryPlatformResponse> {
    try {
      const enrollmentId = await this.client.mutation(api.enrollments.createEnrollment, {
        phoneNumber: data.phoneNumber,
        sport: data.sport,
        planId: data.planId,
        planDuration: data.planDuration,
        amount: data.amount,
        currency: data.currency,
        paymentStatus: data.paymentStatus || 'pending',
        razorpayOrderId: data.razorpayOrderId,
      });

      return {
        success: true,
        userId: enrollmentId,
      };
    } catch (error) {
      console.error('Failed to create enrollment in secondary platform:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create enrollment',
      };
    }
  }

  /**
   * Update enrollment with payment information
   */
  async updateEnrollmentPayment(data: ConvexPaymentUpdate): Promise<SecondaryPlatformResponse> {
    try {
      await this.client.mutation(api.enrollments.updateEnrollmentPayment, {
        enrollmentId: data.enrollmentId as any, // Type assertion for Convex ID
        paymentId: data.paymentId,
        paymentStatus: data.paymentStatus,
        razorpayPaymentId: data.razorpayPaymentId,
        sessionStartDate: data.sessionStartDate,
        courtLocation: data.courtLocation,
      });

      return {
        success: true,
      };
    } catch (error) {
      console.error('Failed to update enrollment payment:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update payment',
      };
    }
  }

  /**
   * Get enrollment by ID
   */
  async getEnrollment(enrollmentId: string) {
    try {
      return await this.client.query(api.enrollments.getEnrollment, {
        enrollmentId: enrollmentId as any, // Type assertion for Convex ID
      });
    } catch (error) {
      console.error('Failed to get enrollment:', error);
      return null;
    }
  }

  /**
   * Get enrollments by phone number
   */
  async getEnrollmentsByPhone(phoneNumber: string) {
    try {
      return await this.client.query(api.enrollments.getEnrollmentsByPhone, {
        phoneNumber,
      });
    } catch (error) {
      console.error('Failed to get enrollments by phone:', error);
      return [];
    }
  }

  /**
   * Get enrollment by payment ID
   */
  async getEnrollmentByPayment(paymentId: string) {
    try {
      return await this.client.query(api.enrollments.getEnrollmentByPayment, {
        paymentId,
      });
    } catch (error) {
      console.error('Failed to get enrollment by payment:', error);
      return null;
    }
  }

  /**
   * Generate user access credentials for the secondary platform
   */
  generateUserCredentials(phoneNumber: string, enrollmentId: string): UserCredentials {
    // Generate username from phone number (last 4 digits + random suffix)
    const phoneSuffix = phoneNumber.slice(-4);
    const randomSuffix = Math.random().toString(36).substring(2, 6);
    const username = `user${phoneSuffix}${randomSuffix}`;

    // Generate temporary password
    const tempPassword = this.generateTemporaryPassword();

    return {
      username,
      temporaryPassword: tempPassword,
      enrollmentId,
      accessInstructions: `
        Welcome to Playgram Coaching Platform!
        
        Your access credentials:
        Username: ${username}
        Temporary Password: ${tempPassword}
        
        Please log in at: ${CONVEX_URL.replace('convex.cloud', 'app.com')}
        
        Important: Please change your password after first login for security.
        
        Your enrollment ID: ${enrollmentId}
        
        For support, contact us at support@playgram.com
      `.trim(),
    };
  }

  /**
   * Generate a secure temporary password
   */
  private generateTemporaryPassword(): string {
    const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
    let password = '';
    for (let i = 0; i < 8; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  }

  /**
   * Transfer enrollment data from primary to secondary platform
   */
  async transferEnrollmentData(enrollmentData: EnrollmentData, paymentData: PaymentData): Promise<SecondaryPlatformResponse> {
    try {
      // Create enrollment in secondary platform
      const createResponse = await this.createEnrollment({
        phoneNumber: enrollmentData.phoneNumber,
        sport: enrollmentData.sport,
        planId: enrollmentData.planId,
        planDuration: this.extractPlanDuration(enrollmentData.planId),
        amount: paymentData.amount,
        currency: paymentData.currency,
        paymentStatus: 'success',
        razorpayOrderId: paymentData.orderId,
      });

      if (!createResponse.success || !createResponse.userId) {
        return createResponse;
      }

      // Update with payment information
      const updateResponse = await this.updateEnrollmentPayment({
        enrollmentId: createResponse.userId,
        paymentId: enrollmentData.paymentId || paymentData.orderId,
        paymentStatus: 'success',
        sessionStartDate: enrollmentData.sessionStartDate?.getTime(),
        courtLocation: enrollmentData.courtLocation,
      });

      if (!updateResponse.success) {
        return updateResponse;
      }

      // Generate user credentials
      const credentials = this.generateUserCredentials(
        enrollmentData.phoneNumber,
        createResponse.userId
      );

      return {
        success: true,
        userId: createResponse.userId,
        credentials: {
          username: credentials.username,
          temporaryPassword: credentials.temporaryPassword,
        },
      };
    } catch (error) {
      console.error('Failed to transfer enrollment data:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to transfer data',
      };
    }
  }

  /**
   * Extract plan duration from plan ID
   */
  private extractPlanDuration(planId: string): PlanDuration {
    if (planId.includes('12-month') || planId.includes('yearly') || planId.includes('annual')) {
      return '12-month';
    }
    if (planId.includes('3-month') || planId.includes('quarterly')) {
      return '3-month';
    }
    return '1-month';
  }

  /**
   * Create user account for phone authentication
   */
  async createPhoneUser(phoneNumber: string, enrollmentId: string, temporaryPassword: string): Promise<SecondaryPlatformResponse> {
    try {
      const userId = await this.client.mutation(api.auth.createPhoneUser, {
        phoneNumber,
        enrollmentId,
        temporaryPassword,
      });

      return {
        success: true,
        userId,
      };
    } catch (error) {
      console.error('Failed to create phone user:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create user account',
      };
    }
  }

  /**
   * Authenticate user with phone number and password
   */
  async authenticateWithPhone(phoneNumber: string, password: string): Promise<SecondaryPlatformResponse> {
    try {
      const result = await this.client.mutation(api.auth.authenticateWithPhone, {
        phoneNumber,
        password,
      });

      return {
        success: true,
        userId: result.userId,
        credentials: result.isTemporaryPassword ? {
          username: phoneNumber,
          temporaryPassword: password,
        } : undefined,
      };
    } catch (error) {
      console.error('Phone authentication failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Authentication failed',
      };
    }
  }

  /**
   * Update user password
   */
  async updatePassword(userId: string, newPassword: string): Promise<SecondaryPlatformResponse> {
    try {
      await this.client.mutation(api.auth.updatePassword, {
        userId: userId as any,
        newPassword,
      });

      return {
        success: true,
      };
    } catch (error) {
      console.error('Failed to update password:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update password',
      };
    }
  }

  /**
   * Get user by phone number
   */
  async getUserByPhone(phoneNumber: string) {
    try {
      return await this.client.query(api.auth.getUserByPhone, {
        phoneNumber,
      });
    } catch (error) {
      console.error('Failed to get user by phone:', error);
      return null;
    }
  }

  /**
   * Get user enrollments
   */
  async getUserEnrollments(userId: string) {
    try {
      return await this.client.query(api.auth.getUserEnrollments, {
        userId: userId as any,
      });
    } catch (error) {
      console.error('Failed to get user enrollments:', error);
      return [];
    }
  }

  /**
   * Health check for the secondary platform connection
   */
  async healthCheck(): Promise<boolean> {
    try {
      // Try to query active enrollments to test connection
      await this.client.query(api.enrollments.getActiveEnrollments);
      return true;
    } catch (error) {
      console.error('Secondary platform health check failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const convexService = new ConvexService();

// Export types for use in other components
export type { ConvexEnrollmentData, ConvexPaymentUpdate, UserCredentials };