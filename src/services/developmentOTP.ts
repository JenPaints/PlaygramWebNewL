/**
 * Development OTP Service
 * Provides fallback OTP authentication for development and testing
 */

import { ConfirmationResult } from 'firebase/auth';

export class DevelopmentOTPService {
    private static readonly VALID_CODES = ['123456', '000000', '111111', '999999'];
    private static readonly SESSION_DURATION = 5 * 60 * 1000; // 5 minutes

    /**
     * Create a development OTP session
     */
    static createOTPSession(phoneNumber: string): ConfirmationResult {
        console.log('🧪 Creating development OTP session for:', phoneNumber);

        // Store session data
        const sessionData = {
            phoneNumber,
            timestamp: Date.now(),
            attempts: 0
        };

        localStorage.setItem('dev_otp_session', JSON.stringify(sessionData));

        return {
            verificationId: `dev-verification-${Date.now()}`,
            confirm: async (code: string) => {
                return this.verifyDevelopmentOTP(code, phoneNumber);
            }
        } as any;
    }

    /**
     * Verify development OTP code
     */
    private static async verifyDevelopmentOTP(code: string, phoneNumber: string): Promise<any> {
        console.log(`🔐 Development OTP verification attempt with code: ${code}`);

        // Get session data
        const sessionStr = localStorage.getItem('dev_otp_session');
        if (!sessionStr) {
            throw new Error('No verification session found. Please request a new code.');
        }

        const session = JSON.parse(sessionStr);

        // Validate session
        if (session.phoneNumber !== phoneNumber) {
            throw new Error('Invalid verification session. Please request a new code.');
        }

        // Check session expiry
        const sessionAge = Date.now() - session.timestamp;
        if (sessionAge > this.SESSION_DURATION) {
            localStorage.removeItem('dev_otp_session');
            throw new Error('Verification code has expired. Please request a new one.');
        }

        // Increment attempts
        session.attempts += 1;
        localStorage.setItem('dev_otp_session', JSON.stringify(session));

        // Check attempt limit
        if (session.attempts > 5) {
            localStorage.removeItem('dev_otp_session');
            throw new Error('Too many verification attempts. Please request a new code.');
        }

        // Verify code
        if (this.VALID_CODES.includes(code)) {
            console.log('✅ Development OTP verification successful');

            // Clean up session
            localStorage.removeItem('dev_otp_session');

            // Return mock user object
            return {
                user: {
                    uid: `dev-user-${Date.now()}`,
                    phoneNumber,
                    isAnonymous: false,
                    providerData: [{
                        providerId: 'phone',
                        uid: phoneNumber,
                        displayName: null,
                        email: null,
                        phoneNumber: phoneNumber,
                        photoURL: null
                    }],
                    // Add development flag
                    isDevelopmentUser: true
                }
            };
        } else {
            console.log('❌ Development OTP verification failed');
            const remainingAttempts = Math.max(0, 5 - session.attempts);
            throw new Error(
                `Invalid verification code. Valid codes: ${this.VALID_CODES.join(', ')}. ${remainingAttempts} attempts remaining.`
            );
        }
    }

    /**
     * Check if development mode is active
     */
    static isDevelopmentMode(): boolean {
        return import.meta.env.DEV;
    }

    /**
     * Get valid development codes
     */
    static getValidCodes(): string[] {
        return [...this.VALID_CODES];
    }

    /**
     * Clear development session
     */
    static clearSession(): void {
        localStorage.removeItem('dev_otp_session');
    }

    /**
     * Get session info for debugging
     */
    static getSessionInfo(): any {
        const sessionStr = localStorage.getItem('dev_otp_session');
        if (!sessionStr) return null;

        const session = JSON.parse(sessionStr);
        const sessionAge = Date.now() - session.timestamp;
        const timeRemaining = Math.max(0, this.SESSION_DURATION - sessionAge);

        return {
            ...session,
            sessionAge,
            timeRemaining,
            isExpired: sessionAge > this.SESSION_DURATION
        };
    }
}

// Export for global access in development
if (import.meta.env.DEV) {
    (window as any).DevelopmentOTPService = DevelopmentOTPService;
}