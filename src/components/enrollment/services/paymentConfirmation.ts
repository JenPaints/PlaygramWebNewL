import { 
  PaymentRecord, 
  PaymentOrder, 
  RazorpayPaymentResponse, 
  EnrollmentData,
  ConfirmationData 
} from '../types';
import { 
  storePaymentRecord, 
  storeEnrollmentData, 
  updatePaymentSessionStatus,
  trackPaymentStatus,
  sanitizePaymentDataForLogging 
} from './paymentStorage';
import { verifyAndProcessPayment } from './paymentService';
import { 
  secondaryPlatformService, 
  RegistrationResult 
} from './secondaryPlatformService';

// Payment confirmation result interface
export interface PaymentConfirmationResult {
  success: boolean;
  enrollmentId?: string;
  paymentRecord?: PaymentRecord;
  confirmationData?: ConfirmationData;
  secondaryPlatformResult?: RegistrationResult;
  error?: string;
}

// Payment confirmation request interface
export interface PaymentConfirmationRequest {
  paymentResponse: RazorpayPaymentResponse;
  enrollmentData: EnrollmentData;
  selectedPlan: {
    id: string;
    duration: string;
    sessions: number;
    totalPrice?: number;
  };
}

/**
 * Handles complete payment confirmation process
 * @param request - Payment confirmation request
 * @returns Promise<PaymentConfirmationResult>
 */
export const handlePaymentConfirmation = async (
  request: PaymentConfirmationRequest
): Promise<PaymentConfirmationResult> => {
  try {
    // Track payment confirmation start
    trackPaymentStatus(
      request.paymentResponse.razorpay_order_id,
      'processing',
      { step: 'confirmation_start' }
    );

    // Update payment session status
    updatePaymentSessionStatus('processing');

    // Verify payment with backend
    const verificationData = {
      razorpay_order_id: request.paymentResponse.razorpay_order_id,
      razorpay_payment_id: request.paymentResponse.razorpay_payment_id,
      razorpay_signature: request.paymentResponse.razorpay_signature,
      enrollmentData: {
        phoneNumber: request.enrollmentData.phoneNumber,
        sport: request.enrollmentData.sport,
        planId: request.selectedPlan.id,
      },
      amount: request.selectedPlan.totalPrice,
    };

    const paymentRecord = await verifyAndProcessPayment(verificationData);

    // Store payment record securely
    storePaymentRecord(paymentRecord);

    // Update enrollment data with payment information
    const updatedEnrollmentData: EnrollmentData = {
      ...request.enrollmentData,
      id: paymentRecord.enrollmentId,
      paymentId: request.paymentResponse.razorpay_payment_id,
      status: 'active',
      enrollmentDate: new Date(),
      sessionStartDate: calculateSessionStartDate(),
    };

    // Store updated enrollment data
    storeEnrollmentData(updatedEnrollmentData);

    // Create confirmation data
    const confirmationData = await createConfirmationData(
      updatedEnrollmentData,
      paymentRecord,
      request.selectedPlan
    );

    // Register user on secondary platform
    let secondaryPlatformResult: RegistrationResult;
    try {
      console.log('Starting secondary platform registration...');
      secondaryPlatformResult = await secondaryPlatformService.handleRegistrationWithRetry(
        updatedEnrollmentData,
        paymentRecord
      );
      
      if (secondaryPlatformResult.success) {
        console.log('Secondary platform registration successful:', secondaryPlatformResult.enrollmentId);
      } else {
        console.warn('Secondary platform registration failed:', secondaryPlatformResult.error);
        // Don't fail the main flow if secondary registration fails
      }
    } catch (error: any) {
      console.error('Secondary platform registration error:', error);
      secondaryPlatformResult = {
        success: false,
        error: error.message || 'Secondary platform registration failed',
        retryable: true,
      };
    }

    // Update payment session status to success
    updatePaymentSessionStatus('success');

    // Track successful payment confirmation
    trackPaymentStatus(
      request.paymentResponse.razorpay_order_id,
      'success',
      { 
        step: 'confirmation_complete',
        enrollmentId: paymentRecord.enrollmentId,
        secondaryPlatformSuccess: secondaryPlatformResult.success,
      }
    );

    return {
      success: true,
      enrollmentId: paymentRecord.enrollmentId,
      paymentRecord,
      confirmationData,
      secondaryPlatformResult,
    };

  } catch (error: any) {
    console.error('Payment confirmation failed:', error);

    // Update payment session status to failed
    updatePaymentSessionStatus('failed', error.message);

    // Track failed payment confirmation
    trackPaymentStatus(
      request.paymentResponse.razorpay_order_id,
      'failed',
      { 
        step: 'confirmation_failed',
        error: sanitizePaymentDataForLogging(error) 
      }
    );

    return {
      success: false,
      error: error.message || 'Payment confirmation failed',
    };
  }
};

/**
 * Creates confirmation data for successful enrollment
 * @param enrollmentData - Enrollment data
 * @param paymentRecord - Payment record
 * @param selectedPlan - Selected plan details
 * @returns Promise<ConfirmationData>
 */
const createConfirmationData = async (
  enrollmentData: EnrollmentData,
  paymentRecord: PaymentRecord,
  selectedPlan: { id: string; duration: string; sessions: number }
): Promise<ConfirmationData> => {
  try {
    // Calculate session start date (next Monday)
    const sessionStartDate = calculateSessionStartDate();

    // Mock court location and coach details
    // In a real implementation, this would come from your backend
    const confirmationData: ConfirmationData = {
      enrollmentId: enrollmentData.id!,
      sessionStartDate,
      courtLocation: 'Playgram Sports Complex, Sector 18, Noida',
      coachDetails: {
        name: 'Coach Playgram',
        contact: '+91-9876543210',
      },
      schedule: generateSessionSchedule(sessionStartDate, selectedPlan.sessions),
      paymentReference: paymentRecord.razorpayPaymentId,
    };

    return confirmationData;
  } catch (error) {
    console.error('Error creating confirmation data:', error);
    throw new Error('Failed to create confirmation data');
  }
};

/**
 * Calculates session start date (next Monday)
 * @returns Date
 */
const calculateSessionStartDate = (): Date => {
  const today = new Date();
  const nextMonday = new Date(today);
  
  // Calculate days until next Monday
  const daysUntilMonday = (8 - today.getDay()) % 7 || 7;
  nextMonday.setDate(today.getDate() + daysUntilMonday);
  
  // Set time to 6:00 AM
  nextMonday.setHours(6, 0, 0, 0);
  
  return nextMonday;
};

/**
 * Generates session schedule based on start date and number of sessions
 * @param startDate - Session start date
 * @param totalSessions - Total number of sessions
 * @returns Array of session schedules
 */
const generateSessionSchedule = (startDate: Date, totalSessions: number) => {
  const schedule = [];
  const sessionDate = new Date(startDate);

  for (let i = 0; i < Math.min(totalSessions, 8); i++) { // Show first 8 sessions
    schedule.push({
      id: `session_${i + 1}`,
      enrollmentId: '', // Will be set by the caller
      date: new Date(sessionDate),
      startTime: '06:00',
      endTime: '07:00',
      courtId: 'court_1',
      coachId: 'coach_rajesh',
      status: 'scheduled' as const,
    });

    // Next session is 2 days later (Monday, Wednesday, Friday pattern)
    sessionDate.setDate(sessionDate.getDate() + 2);
    
    // Skip weekends
    if (sessionDate.getDay() === 0) { // Sunday
      sessionDate.setDate(sessionDate.getDate() + 1); // Move to Monday
    } else if (sessionDate.getDay() === 6) { // Saturday
      sessionDate.setDate(sessionDate.getDate() + 2); // Move to Monday
    }
  }

  return schedule;
};

/**
 * Validates payment confirmation data
 * @param request - Payment confirmation request
 * @returns boolean
 */
export const validatePaymentConfirmationData = (
  request: PaymentConfirmationRequest
): boolean => {
  try {
    // Validate payment response
    if (!request.paymentResponse) return false;
    if (!request.paymentResponse.razorpay_payment_id) return false;
    if (!request.paymentResponse.razorpay_order_id) return false;
    if (!request.paymentResponse.razorpay_signature) return false;

    // Validate enrollment data
    if (!request.enrollmentData) return false;
    if (!request.enrollmentData.phoneNumber) return false;
    if (!request.enrollmentData.sport) return false;

    // Validate selected plan
    if (!request.selectedPlan) return false;
    if (!request.selectedPlan.id) return false;
    if (!request.selectedPlan.duration) return false;
    if (!request.selectedPlan.sessions || request.selectedPlan.sessions <= 0) return false;

    return true;
  } catch (error) {
    console.error('Error validating payment confirmation data:', error);
    return false;
  }
};

/**
 * Handles payment confirmation retry
 * @param request - Original payment confirmation request
 * @param retryCount - Current retry count
 * @returns Promise<PaymentConfirmationResult>
 */
export const retryPaymentConfirmation = async (
  request: PaymentConfirmationRequest,
  retryCount: number
): Promise<PaymentConfirmationResult> => {
  try {
    if (retryCount >= 3) {
      throw new Error('Maximum retry attempts reached for payment confirmation');
    }

    // Track retry attempt
    trackPaymentStatus(
      request.paymentResponse.razorpay_order_id,
      'processing',
      { 
        step: 'confirmation_retry',
        attempt: retryCount + 1 
      }
    );

    // Add delay before retry
    await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)));

    // Retry confirmation
    return await handlePaymentConfirmation(request);
  } catch (error: any) {
    console.error('Payment confirmation retry failed:', error);
    
    return {
      success: false,
      error: error.message || 'Payment confirmation retry failed',
    };
  }
};

/**
 * Sends confirmation email (mock implementation)
 * @param phoneNumber - User phone number
 * @param confirmationData - Confirmation data
 * @returns Promise<boolean>
 */
export const sendConfirmationEmail = async (
  phoneNumber: string,
  confirmationData: ConfirmationData
): Promise<boolean> => {
  try {
    // Mock email sending - in real implementation, integrate with email service
    const message = `
      Welcome to Playgram Sports! 
      Your football coaching enrollment is confirmed.
      
      Enrollment ID: ${confirmationData.enrollmentId}
      Start Date: ${confirmationData.sessionStartDate.toLocaleDateString()}
      Location: ${confirmationData.courtLocation}
      Coach: ${confirmationData.coachDetails.name}
      
      Contact: ${confirmationData.coachDetails.contact}
    `;

    console.log('Email would be sent to user with phone:', phoneNumber);
    console.log('Message:', message);

    // Simulate email sending delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    return true;
  } catch (error) {
    console.error('Error sending confirmation email:', error);
    return false;
  }
};