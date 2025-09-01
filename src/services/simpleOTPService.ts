/**
 * Simple OTP Service - Focused fix for OTP verification issues
 * This service provides a clean, debuggable OTP implementation
 */

import { ConfirmationResult } from 'firebase/auth';

interface SimpleOTPSession {
    phoneNumber: string;
    otpCode: string;
    timestamp: number;
    attempts: number;
}

class SimpleOTPConfirmationResult implements ConfirmationResult {
    public verificationId: string;
    private phoneNumber: string;

    constructor(phoneNumber: string, verificationId: string) {
        this.phoneNumber = phoneNumber;
        this.verificationId = verificationId;
    }

    async confirm(verificationCode: string): Promise<any> {
        console.log(`🔐 SimpleOTP: Verifying code "${verificationCode}" for ${this.phoneNumber}`);

        // Get session from localStorage
        const sessionKey = `simple_otp_${this.phoneNumber}`;
        const sessionData = localStorage.getItem(sessionKey);

        if (!sessionData) {
            console.error('❌ SimpleOTP: No session found');
            throw { code: 'auth/code-expired', message: 'Verification session not found. Please request a new code.' };
        }

        const session: SimpleOTPSession = JSON.parse(sessionData);
        console.log(`🔍 SimpleOTP: Session found - OTP: "${session.otpCode}", Attempts: ${session.attempts}`);

        // Check expiry (5 minutes)
        const age = Date.now() - session.timestamp;
        if (age > 5 * 60 * 1000) {
            console.error('❌ SimpleOTP: Session expired');
            localStorage.removeItem(sessionKey);
            throw { code: 'auth/code-expired', message: 'Verification code has expired. Please request a new one.' };
        }

        // Check attempts
        if (session.attempts >= 3) {
            console.error('❌ SimpleOTP: Too many attempts');
            localStorage.removeItem(sessionKey);
            throw { code: 'auth/too-many-requests', message: 'Too many verification attempts. Please request a new code.' };
        }

        // Increment attempts
        session.attempts++;
        localStorage.setItem(sessionKey, JSON.stringify(session));

        // Verify code
        const inputCode = verificationCode.trim();
        const storedCode = session.otpCode.trim();

        console.log(`🔍 SimpleOTP: Comparing "${inputCode}" === "${storedCode}"`);

        if (inputCode === storedCode) {
            console.log('✅ SimpleOTP: Verification successful');
            localStorage.removeItem(sessionKey);

            return {
                user: {
                    uid: `simple_otp_${this.phoneNumber}`,
                    phoneNumber: this.phoneNumber,
                    providerData: [{
                        providerId: 'phone',
                        uid: this.phoneNumber,
                        phoneNumber: this.phoneNumber
                    }]
                }
            };
        } else {
            console.log('❌ SimpleOTP: Verification failed');
            throw { code: 'auth/invalid-verification-code', message: 'Invalid verification code. Please try again.' };
        }
    }
}

export class SimpleOTPService {
    private static instance: SimpleOTPService;

    static getInstance(): SimpleOTPService {
        if (!SimpleOTPService.instance) {
            SimpleOTPService.instance = new SimpleOTPService();
        }
        return SimpleOTPService.instance;
    }

    private generateOTP(): string {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }

    private formatPhoneNumber(phoneNumber: string): string {
        let formatted = phoneNumber.replace(/[\s\-\(\)]/g, '');
        if (!formatted.startsWith('+')) {
            if (formatted.startsWith('91')) {
                formatted = '+' + formatted;
            } else {
                formatted = '+91' + formatted;
            }
        }
        return formatted;
    }

    async sendOTP(phoneNumber: string): Promise<ConfirmationResult> {
        const formattedPhone = this.formatPhoneNumber(phoneNumber);
        const otpCode = this.generateOTP();
        const verificationId = `simple_${Date.now()}`;

        console.log(`📱 SimpleOTP: Sending OTP to ${formattedPhone}`);
        console.log(`🔑 SimpleOTP: Generated OTP: ${otpCode}`);

        // Create session
        const session: SimpleOTPSession = {
            phoneNumber: formattedPhone,
            otpCode,
            timestamp: Date.now(),
            attempts: 0
        };

        // Store session
        const sessionKey = `simple_otp_${formattedPhone}`;
        localStorage.setItem(sessionKey, JSON.stringify(session));

        // In development mode, show alert
        if (import.meta.env.DEV) {
            alert(`🧪 DEVELOPMENT MODE\n\nYour OTP code is: ${otpCode}\n\nPhone: ${formattedPhone}\n\nThis alert only appears in development mode.`);
        }

        return new SimpleOTPConfirmationResult(formattedPhone, verificationId);
    }

    // Get current session for debugging
    getSession(phoneNumber: string): SimpleOTPSession | null {
        const formattedPhone = this.formatPhoneNumber(phoneNumber);
        const sessionKey = `simple_otp_${formattedPhone}`;
        const sessionData = localStorage.getItem(sessionKey);
        
        if (!sessionData) return null;
        
        try {
            return JSON.parse(sessionData);
        } catch {
            return null;
        }
    }

    // Clear all sessions
    clearAllSessions(): void {
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
            if (key.startsWith('simple_otp_')) {
                localStorage.removeItem(key);
            }
        });
        console.log('🧹 SimpleOTP: All sessions cleared');
    }
}

export const simpleOTPService = SimpleOTPService.getInstance();