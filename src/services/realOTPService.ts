/**
 * Real OTP Service - Production-ready OTP implementation
 * Supports multiple providers: AiSensy (WhatsApp), SMS APIs, Firebase
 */

import { ConfirmationResult } from 'firebase/auth';
import { aisensyOTPService } from './aisensyOTP';
import { phoneAuthService } from './firebase';

// OTP Provider types
type OTPProvider = 'aisensy' | 'sms' | 'firebase' | 'twilio' | 'msg91';

// OTP Session interface
interface OTPSession {
    phoneNumber: string;
    otpCode: string;
    provider: OTPProvider;
    timestamp: number;
    attempts: number;
    confirmed: boolean;
    sessionId: string;
}

// Configuration for different OTP providers
const OTP_CONFIG = {
    // AiSensy WhatsApp OTP
    aisensy: {
        enabled: true,
        priority: 1,
        name: 'WhatsApp OTP'
    },

    // SMS providers
    msg91: {
        enabled: !!import.meta.env.VITE_MSG91_API_KEY,
        priority: 2,
        name: 'SMS OTP (MSG91)',
        apiKey: import.meta.env.VITE_MSG91_API_KEY,
        templateId: import.meta.env.VITE_MSG91_TEMPLATE_ID || 'default',
        senderId: import.meta.env.VITE_MSG91_SENDER_ID || 'PLYGRAM'
    },

    twilio: {
        enabled: !!import.meta.env.VITE_TWILIO_ACCOUNT_SID,
        priority: 3,
        name: 'SMS OTP (Twilio)',
        accountSid: import.meta.env.VITE_TWILIO_ACCOUNT_SID,
        authToken: import.meta.env.VITE_TWILIO_AUTH_TOKEN,
        fromNumber: import.meta.env.VITE_TWILIO_FROM_NUMBER
    },

    // Firebase as fallback
    firebase: {
        enabled: true,
        priority: 4,
        name: 'Firebase OTP'
    }
};

// Mock ConfirmationResult for non-Firebase providers
class RealOTPConfirmationResult implements ConfirmationResult {
    private session: OTPSession;
    public verificationId: string;

    constructor(session: OTPSession) {
        this.session = session;
        this.verificationId = session.sessionId;
    }

    async confirm(verificationCode: string): Promise<any> {
        try {
            console.log(`🔐 Verifying OTP: ${verificationCode} via ${this.session.provider}`);
            console.log(`🔍 Expected OTP: ${this.session.otpCode}`);
            console.log(`📱 Phone: ${this.session.phoneNumber}`);

            // Get fresh session data from storage
            const storedSessions = this.getStoredSessions();
            console.log(`📋 All stored sessions:`, storedSessions);
            
            let currentSession = storedSessions[this.session.phoneNumber];

            if (!currentSession) {
                console.error('❌ No session found in storage for phone:', this.session.phoneNumber);
                console.error('📋 Available sessions:', Object.keys(storedSessions));
                
                // Try to find session with different phone format
                const phoneVariants = [
                    this.session.phoneNumber,
                    this.session.phoneNumber.replace('+91', ''),
                    '+91' + this.session.phoneNumber.replace('+91', ''),
                    this.session.phoneNumber.replace(/\D/g, '')
                ];
                
                let foundSession = null;
                for (const variant of phoneVariants) {
                    if (storedSessions[variant]) {
                        foundSession = storedSessions[variant];
                        console.log(`✅ Found session with phone variant: ${variant}`);
                        break;
                    }
                }
                
                if (!foundSession) {
                    throw new Error('No verification session found. Please request a new code.');
                }
                
                currentSession = foundSession;
            }

            // Update session reference
            this.session = currentSession;

            // Check if session is expired (5 minutes)
            const isExpired = Date.now() - this.session.timestamp > 5 * 60 * 1000;
            if (isExpired) {
                console.error('❌ Session expired');
                this.clearSession();
                const error = new Error('Verification code has expired');
                (error as any).code = 'auth/code-expired';
                throw error;
            }

            // Check if too many attempts
            if (this.session.attempts >= 3) {
                console.error('❌ Too many attempts');
                this.clearSession();
                const error = new Error('Too many verification attempts');
                (error as any).code = 'auth/too-many-requests';
                throw error;
            }

            // Increment attempts
            this.session.attempts++;
            this.updateStoredSession();

            // Clean and compare codes
            const cleanInputCode = verificationCode.trim();
            const cleanStoredCode = this.session.otpCode.trim();

            console.log(`🔍 Comparing codes: "${cleanInputCode}" === "${cleanStoredCode}"`);

            // Verify the code
            if (cleanInputCode === cleanStoredCode) {
                this.session.confirmed = true;
                this.updateStoredSession();

                console.log(`✅ OTP verification successful via ${this.session.provider}`);

                // Clear session after successful verification
                setTimeout(() => this.clearSession(), 1000);

                return {
                    user: {
                        uid: `${this.session.provider}_${this.session.phoneNumber}`,
                        phoneNumber: this.session.phoneNumber,
                        provider: this.session.provider,
                        isAnonymous: false,
                        providerData: [{
                            providerId: 'phone',
                            uid: this.session.phoneNumber,
                            phoneNumber: this.session.phoneNumber
                        }]
                    }
                };
            } else {
                console.log(`❌ OTP verification failed via ${this.session.provider}`);
                console.log(`Expected: "${cleanStoredCode}", Got: "${cleanInputCode}"`);
                const error = new Error('Invalid verification code');
                (error as any).code = 'auth/invalid-verification-code';
                throw error;
            }
        } catch (error: any) {
            console.error('❌ OTP verification error:', error);

            // Ensure error has proper structure
            if (!error.code) {
                error.code = 'auth/internal-error';
            }

            throw error;
        }
    }

    private updateStoredSession(): void {
        const sessions = this.getStoredSessions();
        sessions[this.session.phoneNumber] = this.session;
        localStorage.setItem('real_otp_sessions', JSON.stringify(sessions));
    }

    private getStoredSessions(): Record<string, OTPSession> {
        try {
            const stored = localStorage.getItem('real_otp_sessions');
            return stored ? JSON.parse(stored) : {};
        } catch {
            return {};
        }
    }

    private clearSession(): void {
        const sessions = this.getStoredSessions();
        delete sessions[this.session.phoneNumber];
        localStorage.setItem('real_otp_sessions', JSON.stringify(sessions));
    }
}

export class RealOTPService {
    private static instance: RealOTPService;

    static getInstance(): RealOTPService {
        if (!RealOTPService.instance) {
            RealOTPService.instance = new RealOTPService();
        }
        return RealOTPService.instance;
    }

    /**
     * Generate a 6-digit OTP code
     */
    private generateOTP(): string {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }

    /**
     * Format phone number (ensure it has country code)
     */
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

    /**
     * Get available OTP providers in priority order
     */
    private getAvailableProviders(): OTPProvider[] {
        return Object.entries(OTP_CONFIG)
            .filter(([_, config]) => config.enabled)
            .sort((a, b) => a[1].priority - b[1].priority)
            .map(([provider, _]) => provider as OTPProvider);
    }

    /**
     * Send OTP via AiSensy WhatsApp
     */
    private async sendAiSensyOTP(phoneNumber: string, otpCode: string): Promise<boolean> {
        try {
            console.log('📱 Sending WhatsApp OTP via AiSensy');
            console.log(`🔑 Real OTP Service - Using OTP: ${otpCode}`);

            // Pass the OTP code to AiSensy service to ensure consistency
            const confirmation = await aisensyOTPService.sendOTP(phoneNumber, otpCode);

            return !!confirmation;
        } catch (error) {
            console.error('❌ AiSensy OTP failed:', error);
            return false;
        }
    }

    /**
     * Send OTP via MSG91 SMS
     */
    private async sendMSG91OTP(phoneNumber: string, otpCode: string): Promise<boolean> {
        const config = OTP_CONFIG.msg91;
        if (!config.enabled || !config.apiKey) {
            return false;
        }

        try {
            console.log('📱 Sending SMS OTP via MSG91');

            const response = await fetch('https://control.msg91.com/api/v5/otp', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'authkey': config.apiKey
                },
                body: JSON.stringify({
                    template_id: config.templateId,
                    mobile: phoneNumber.replace('+', ''),
                    sender: config.senderId,
                    otp: otpCode,
                    otp_expiry: 5 // 5 minutes
                })
            });

            if (response.ok) {
                const result = await response.json();
                console.log('✅ MSG91 OTP sent successfully:', result);
                return true;
            } else {
                const error = await response.text();
                console.error('❌ MSG91 OTP failed:', error);
                return false;
            }
        } catch (error) {
            console.error('❌ MSG91 OTP error:', error);
            return false;
        }
    }

    /**
     * Send OTP via Twilio SMS
     */
    private async sendTwilioOTP(phoneNumber: string, otpCode: string): Promise<boolean> {
        const config = OTP_CONFIG.twilio;
        if (!config.enabled || !config.accountSid || !config.authToken) {
            return false;
        }

        try {
            console.log('📱 Sending SMS OTP via Twilio');

            const auth = btoa(`${config.accountSid}:${config.authToken}`);
            const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${config.accountSid}/Messages.json`, {
                method: 'POST',
                headers: {
                    'Authorization': `Basic ${auth}`,
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: new URLSearchParams({
                    From: config.fromNumber || '',
                    To: phoneNumber,
                    Body: `Your PlayGram verification code is: ${otpCode}. Valid for 5 minutes.`
                })
            });

            if (response.ok) {
                const result = await response.json();
                console.log('✅ Twilio OTP sent successfully:', result);
                return true;
            } else {
                const error = await response.text();
                console.error('❌ Twilio OTP failed:', error);
                return false;
            }
        } catch (error) {
            console.error('❌ Twilio OTP error:', error);
            return false;
        }
    }

    /**
     * Send OTP via Firebase
     */
    private async sendFirebaseOTP(phoneNumber: string): Promise<ConfirmationResult | null> {
        try {
            console.log('📱 Sending OTP via Firebase');

            // Initialize reCAPTCHA if needed
            if (!phoneAuthService.isRecaptchaReady()) {
                let container = document.getElementById('recaptcha-container');
                if (!container) {
                    container = document.createElement('div');
                    container.id = 'recaptcha-container';
                    container.style.display = 'none';
                    document.body.appendChild(container);
                }
                phoneAuthService.initializeRecaptcha('recaptcha-container');
            }

            const confirmation = await phoneAuthService.sendOTP(phoneNumber);
            console.log('✅ Firebase OTP sent successfully');
            return confirmation;
        } catch (error) {
            console.error('❌ Firebase OTP failed:', error);
            return null;
        }
    }

    /**
     * Send OTP using the best available provider
     */
    async sendOTP(phoneNumber: string): Promise<ConfirmationResult> {
        console.log(`📱 Sending real OTP to: ${phoneNumber}`);

        const formattedPhone = this.formatPhoneNumber(phoneNumber);
        const otpCode = this.generateOTP();
        const sessionId = `otp_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

        console.log(`🔍 Formatted phone: ${formattedPhone}`);
        console.log(`🔑 Generated OTP: ${otpCode}`);
        console.log(`🆔 Session ID: ${sessionId}`);

        // Check rate limiting
        if (this.isRateLimited(formattedPhone)) {
            throw {
                code: 'auth/too-many-requests',
                message: 'Please wait a minute before requesting another verification code.'
            };
        }

        const availableProviders = this.getAvailableProviders();
        console.log('🔍 Available OTP providers:', availableProviders.map(p => OTP_CONFIG[p as keyof typeof OTP_CONFIG].name));

        let lastError: any = null;

        // Try each provider in priority order
        for (const provider of availableProviders) {
            try {
                console.log(`🔄 Trying ${OTP_CONFIG[provider as keyof typeof OTP_CONFIG].name}...`);

                let success = false;
                let firebaseConfirmation: ConfirmationResult | null = null;

                switch (provider) {
                    case 'aisensy':
                        success = await this.sendAiSensyOTP(formattedPhone, otpCode);
                        break;
                    case 'msg91':
                        success = await this.sendMSG91OTP(formattedPhone, otpCode);
                        break;
                    case 'twilio':
                        success = await this.sendTwilioOTP(formattedPhone, otpCode);
                        break;
                    case 'firebase':
                        firebaseConfirmation = await this.sendFirebaseOTP(formattedPhone);
                        success = !!firebaseConfirmation;
                        break;
                }

                if (success) {
                    console.log(`✅ OTP sent successfully via ${OTP_CONFIG[provider as keyof typeof OTP_CONFIG].name}`);

                    // For Firebase, return the actual confirmation result
                    if (provider === 'firebase' && firebaseConfirmation) {
                        this.recordOTPAttempt(formattedPhone);
                        return firebaseConfirmation;
                    }

                    // For other providers, create and store session
                    const session: OTPSession = {
                        phoneNumber: formattedPhone,
                        otpCode,
                        provider,
                        timestamp: Date.now(),
                        attempts: 0,
                        confirmed: false,
                        sessionId
                    };

                    this.storeSession(session);
                    this.recordOTPAttempt(formattedPhone);

                    return new RealOTPConfirmationResult(session);
                }
            } catch (error) {
                console.error(`❌ ${OTP_CONFIG[provider as keyof typeof OTP_CONFIG].name} failed:`, error);
                lastError = error;
                continue;
            }
        }

        // If all providers failed, throw the last error
        console.error('❌ All OTP providers failed');
        throw lastError || new Error('Failed to send OTP. Please try again later.');
    }

    /**
     * Store OTP session
     */
    private storeSession(session: OTPSession): void {
        try {
            const sessions = this.getStoredSessions();
            sessions[session.phoneNumber] = session;
            localStorage.setItem('real_otp_sessions', JSON.stringify(sessions));
            console.log(`💾 Stored OTP session for ${session.phoneNumber}:`, session);
        } catch (error) {
            console.warn('⚠️ Could not store OTP session:', error);
        }
    }

    /**
     * Get stored OTP sessions
     */
    private getStoredSessions(): Record<string, OTPSession> {
        try {
            const stored = localStorage.getItem('real_otp_sessions');
            return stored ? JSON.parse(stored) : {};
        } catch {
            return {};
        }
    }

    /**
     * Get session for phone number
     */
    getSession(phoneNumber: string): OTPSession | null {
        const sessions = this.getStoredSessions();
        return sessions[this.formatPhoneNumber(phoneNumber)] || null;
    }

    /**
     * Check if rate limiting should be applied
     */
    isRateLimited(phoneNumber: string): boolean {
        const lastAttempt = localStorage.getItem(`otp_last_attempt_${phoneNumber}`);
        if (!lastAttempt) return false;

        const timeSinceLastAttempt = Date.now() - parseInt(lastAttempt);
        return timeSinceLastAttempt < 60000; // 1 minute cooldown
    }

    /**
     * Record OTP attempt for rate limiting
     */
    private recordOTPAttempt(phoneNumber: string): void {
        localStorage.setItem(`otp_last_attempt_${phoneNumber}`, Date.now().toString());
    }

    /**
     * Clean up expired sessions
     */
    cleanupExpiredSessions(): void {
        try {
            const sessions = this.getStoredSessions();
            const now = Date.now();
            const validSessions: Record<string, OTPSession> = {};

            Object.entries(sessions).forEach(([phone, session]) => {
                if (now - session.timestamp < 10 * 60 * 1000) { // 10 minutes
                    validSessions[phone] = session;
                }
            });

            localStorage.setItem('real_otp_sessions', JSON.stringify(validSessions));
        } catch (error) {
            console.warn('⚠️ Could not cleanup expired sessions:', error);
        }
    }

    /**
     * Initialize service
     */
    initialize(): void {
        console.log('🚀 Initializing Real OTP Service');
        console.log('📋 Available providers:', this.getAvailableProviders().map(p => OTP_CONFIG[p as keyof typeof OTP_CONFIG].name));
        this.cleanupExpiredSessions();
    }

    /**
     * Get provider status for debugging
     */
    getProviderStatus(): Record<string, any> {
        return Object.entries(OTP_CONFIG).reduce((acc, [provider, config]) => {
            acc[provider] = {
                name: config.name,
                enabled: config.enabled,
                priority: config.priority
            };
            return acc;
        }, {} as Record<string, any>);
    }
}

// Export singleton instance
export const realOTPService = RealOTPService.getInstance();

// Initialize on import
realOTPService.initialize();