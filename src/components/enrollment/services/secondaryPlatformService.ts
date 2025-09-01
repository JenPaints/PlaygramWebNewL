import { 
  convexService, 
  ConvexEnrollmentData, 
  ConvexPaymentUpdate, 
  UserCredentials 
} from './convexService';
import { 
  EnrollmentData, 
  PaymentData, 
  PaymentRecord, 
  SecondaryPlatformResponse 
} from '../types';

// Retry configuration
const MAX_RETRY_ATTEMPTS = 3;
const RETRY_DELAY_MS = 2000;

// Registration result interface
export interface RegistrationResult {
  success: boolean;
  enrollmentId?: string;
  credentials?: {
    username: string;
    temporaryPassword: string;
  };
  error?: string;
  retryable?: boolean;
}

// Account linking data interface
export interface AccountLinkingData {
  primaryEnrollmentId: string;
  secondaryEnrollmentId: string;
  phoneNumber: string;
  linkingTimestamp: number;
}

/**
 * Secondary Platform Service
 * Handles automatic user registration and account linking with the secondary platform
 */
export class SecondaryPlatformService {
  private retryAttempts: Map<string, number> = new Map();

  /**
   * Automatically register user on secondary platform after payment confirmation
   */
  async registerUserAfterPayment(
    enrollmentData: EnrollmentData,
    paymentRecord: PaymentRecord
  ): Promise<RegistrationResult> {
    const registrationKey = `${enrollmentData.phoneNumber}_${paymentRecord.id}`;
    
    try {
      // Check if we've already attempted registration for this enrollment
      const currentAttempts = this.retryAttempts.get(registrationKey) || 0;
      
      if (currentAttempts >= MAX_RETRY_ATTEMPTS) {
        return {
          success: false,
          error: 'Maximum registration attempts exceeded',
          retryable: false,
        };
      }

      // Increment attempt counter
      this.retryAttempts.set(registrationKey, currentAttempts + 1);

      // Prepare enrollment data for secondary platform
      const convexEnrollmentData: ConvexEnrollmentData = {
        phoneNumber: enrollmentData.phoneNumber,
        sport: enrollmentData.sport,
        planId: enrollmentData.planId,
        planDuration: this.extractPlanDuration(enrollmentData.planId),
        amount: paymentRecord.amount,
        currency: paymentRecord.currency,
        paymentStatus: 'success',
        razorpayOrderId: paymentRecord.razorpayOrderId,
      };

      // Create enrollment in secondary platform
      const createResponse = await convexService.createEnrollment(convexEnrollmentData);
      
      if (!createResponse.success || !createResponse.userId) {
        throw new Error(createResponse.error || 'Failed to create enrollment in secondary platform');
      }

      // Update enrollment with payment information
      const paymentUpdate: ConvexPaymentUpdate = {
        enrollmentId: createResponse.userId,
        paymentId: paymentRecord.razorpayPaymentId,
        paymentStatus: 'success',
        razorpayPaymentId: paymentRecord.razorpayPaymentId,
        sessionStartDate: enrollmentData.sessionStartDate?.getTime(),
        courtLocation: enrollmentData.courtLocation,
      };

      const updateResponse = await convexService.updateEnrollmentPayment(paymentUpdate);
      
      if (!updateResponse.success) {
        throw new Error(updateResponse.error || 'Failed to update payment information');
      }

      // Generate user credentials
      const credentials = convexService.generateUserCredentials(
        enrollmentData.phoneNumber,
        createResponse.userId
      );

      // Create user account for phone authentication
      const userAccountResponse = await convexService.createPhoneUser(
        enrollmentData.phoneNumber,
        createResponse.userId,
        credentials.temporaryPassword
      );

      if (!userAccountResponse.success) {
        console.warn('Failed to create user account for phone auth:', userAccountResponse.error);
        // Continue with enrollment even if user account creation fails
      }

      // Store account linking data
      await this.storeAccountLinking({
        primaryEnrollmentId: enrollmentData.id || paymentRecord.enrollmentId,
        secondaryEnrollmentId: createResponse.userId,
        phoneNumber: enrollmentData.phoneNumber,
        linkingTimestamp: Date.now(),
      });

      // Clear retry attempts on success
      this.retryAttempts.delete(registrationKey);

      return {
        success: true,
        enrollmentId: createResponse.userId,
        credentials: {
          username: enrollmentData.phoneNumber, // Use phone number as username
          temporaryPassword: credentials.temporaryPassword,
        },
      };

    } catch (error: any) {
      console.error('Secondary platform registration failed:', error);
      
      // Determine if error is retryable
      const retryable = this.isRetryableError(error);
      
      return {
        success: false,
        error: error.message || 'Registration failed',
        retryable,
      };
    }
  }

  /**
   * Retry registration with exponential backoff
   */
  async retryRegistration(
    enrollmentData: EnrollmentData,
    paymentRecord: PaymentRecord,
    attemptNumber: number
  ): Promise<RegistrationResult> {
    try {
      // Calculate delay with exponential backoff
      const delay = RETRY_DELAY_MS * Math.pow(2, attemptNumber - 1);
      
      console.log(`Retrying secondary platform registration (attempt ${attemptNumber}) after ${delay}ms delay`);
      
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, delay));
      
      // Attempt registration again
      return await this.registerUserAfterPayment(enrollmentData, paymentRecord);
      
    } catch (error: any) {
      console.error(`Registration retry attempt ${attemptNumber} failed:`, error);
      
      return {
        success: false,
        error: error.message || 'Registration retry failed',
        retryable: attemptNumber < MAX_RETRY_ATTEMPTS,
      };
    }
  }

  /**
   * Handle registration with automatic retry logic
   */
  async handleRegistrationWithRetry(
    enrollmentData: EnrollmentData,
    paymentRecord: PaymentRecord
  ): Promise<RegistrationResult> {
    let lastResult: RegistrationResult;
    
    for (let attempt = 1; attempt <= MAX_RETRY_ATTEMPTS; attempt++) {
      if (attempt === 1) {
        // First attempt
        lastResult = await this.registerUserAfterPayment(enrollmentData, paymentRecord);
      } else {
        // Retry attempts
        lastResult = await this.retryRegistration(enrollmentData, paymentRecord, attempt);
      }
      
      // If successful, return immediately
      if (lastResult.success) {
        return lastResult;
      }
      
      // If not retryable, stop trying
      if (!lastResult.retryable) {
        break;
      }
      
      // Log retry attempt
      console.log(`Registration attempt ${attempt} failed, ${MAX_RETRY_ATTEMPTS - attempt} attempts remaining`);
    }
    
    // All attempts failed
    console.error('All registration attempts failed');
    return lastResult;
  }

  /**
   * Store account linking information
   */
  private async storeAccountLinking(linkingData: AccountLinkingData): Promise<void> {
    try {
      // Store in localStorage for now
      // In a real implementation, this would be stored in a secure backend
      const linkingKey = `account_linking_${linkingData.phoneNumber}`;
      const existingLinks = JSON.parse(localStorage.getItem(linkingKey) || '[]');
      
      existingLinks.push(linkingData);
      localStorage.setItem(linkingKey, JSON.stringify(existingLinks));
      
      console.log('Account linking stored:', linkingData);
    } catch (error) {
      console.error('Failed to store account linking:', error);
      // Don't throw error as this is not critical for the main flow
    }
  }

  /**
   * Get account linking information for a phone number
   */
  async getAccountLinking(phoneNumber: string): Promise<AccountLinkingData[]> {
    try {
      const linkingKey = `account_linking_${phoneNumber}`;
      const links = JSON.parse(localStorage.getItem(linkingKey) || '[]');
      return links;
    } catch (error) {
      console.error('Failed to get account linking:', error);
      return [];
    }
  }

  /**
   * Check if error is retryable
   */
  private isRetryableError(error: any): boolean {
    // Network errors are typically retryable
    if (error.name === 'NetworkError' || error.code === 'NETWORK_ERROR') {
      return true;
    }
    
    // Timeout errors are retryable
    if (error.name === 'TimeoutError' || error.message?.includes('timeout')) {
      return true;
    }
    
    // Server errors (5xx) are retryable
    if (error.status >= 500 && error.status < 600) {
      return true;
    }
    
    // Rate limiting errors are retryable
    if (error.status === 429) {
      return true;
    }
    
    // Convex-specific retryable errors
    if (error.message?.includes('temporarily unavailable')) {
      return true;
    }
    
    // Client errors (4xx) are typically not retryable
    if (error.status >= 400 && error.status < 500) {
      return false;
    }
    
    // Default to retryable for unknown errors
    return true;
  }

  /**
   * Extract plan duration from plan ID
   */
  private extractPlanDuration(planId: string): '1-month' | '3-month' | '12-month' {
    if (planId.includes('12-month') || planId.includes('yearly') || planId.includes('annual')) {
      return '12-month';
    }
    if (planId.includes('3-month') || planId.includes('quarterly')) {
      return '3-month';
    }
    return '1-month';
  }

  /**
   * Health check for secondary platform connection
   */
  async healthCheck(): Promise<boolean> {
    try {
      return await convexService.healthCheck();
    } catch (error) {
      console.error('Secondary platform health check failed:', error);
      return false;
    }
  }

  /**
   * Get user credentials for display
   */
  async getUserCredentials(phoneNumber: string, enrollmentId: string): Promise<UserCredentials | null> {
    try {
      // In a real implementation, this would fetch from secure storage
      // For now, we'll generate them again (not ideal for production)
      return convexService.generateUserCredentials(phoneNumber, enrollmentId);
    } catch (error) {
      console.error('Failed to get user credentials:', error);
      return null;
    }
  }

  /**
   * Clear retry attempts for a specific registration
   */
  clearRetryAttempts(phoneNumber: string, paymentId: string): void {
    const registrationKey = `${phoneNumber}_${paymentId}`;
    this.retryAttempts.delete(registrationKey);
  }

  /**
   * Get retry attempt count for a specific registration
   */
  getRetryAttemptCount(phoneNumber: string, paymentId: string): number {
    const registrationKey = `${phoneNumber}_${paymentId}`;
    return this.retryAttempts.get(registrationKey) || 0;
  }
}

// Export singleton instance
export const secondaryPlatformService = new SecondaryPlatformService();

// Export types
export type { RegistrationResult, AccountLinkingData };