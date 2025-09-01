import { ConfirmationResult } from 'firebase/auth';

// AiSensy API configuration from environment variables
const AISENSY_CONFIG = {
    apiKey: import.meta.env.VITE_AISENSY_API_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4NmI4YmE1NzQwYmVkMGMxMWVjMjM3MSIsIm5hbWUiOiJQbGF5Z3JhbSAzNjAgTExQIiwiYXBwTmFtZSI6IkFpU2Vuc3kiLCJjbGllbnRJZCI6IjY4NmI4YmE1NzQwYmVkMGMxMWVjMjM2YyIsImFjdGl2ZVBsYW4iOiJGUkVFX0ZPUkVWRVIiLCJpYXQiOjE3NTE4Nzg1NjV9.gpGRaedySZ3S7oFsg8S35lVCHs5N_uUXsrB1XU-hc0o',
    baseUrl: import.meta.env.VITE_AISENSY_BASE_URL || 'https://backend.aisensy.com/campaign/t1/api/v2',
    campaignName: import.meta.env.VITE_AISENSY_CAMPAIGN_NAME || 'Playgram-Authentication',
    templateType: import.meta.env.VITE_AISENSY_TEMPLATE_TYPE || 'simple'
};

// Interface for OTP session
interface OTPSession {
    phoneNumber: string;
    otpCode: string;
    timestamp: number;
    attempts: number;
    confirmed: boolean;
}

// Mock ConfirmationResult for compatibility with existing code
class AiSensyConfirmationResult implements ConfirmationResult {
    private session: OTPSession;
    public verificationId: string;

    constructor(session: OTPSession) {
        this.session = session;
        this.verificationId = `aisensy_${session.phoneNumber}_${session.timestamp}`;
    }

    async confirm(verificationCode: string): Promise<any> {
        try {
            console.log(`🔐 Verifying AiSensy OTP: ${verificationCode}`);
            console.log(`🔍 Expected OTP: ${this.session.otpCode}`);

            // Get fresh session data from storage
            const storedSessions = this.getStoredSessions();
            const currentSession = storedSessions[this.session.phoneNumber];
            
            if (!currentSession) {
                console.error('❌ No AiSensy session found in storage');
                const error = new Error('No verification session found. Please request a new code.');
                (error as any).code = 'auth/internal-error';
                throw error;
            }

            // Update session reference
            this.session = currentSession;

            // Check if session is expired (5 minutes)
            const isExpired = Date.now() - this.session.timestamp > 5 * 60 * 1000;
            if (isExpired) {
                console.error('❌ AiSensy session expired');
                const error = new Error('Verification code has expired');
                (error as any).code = 'auth/code-expired';
                throw error;
            }

            // Check if too many attempts
            if (this.session.attempts >= 3) {
                console.error('❌ Too many AiSensy attempts');
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

            console.log(`🔍 AiSensy comparing codes: "${cleanInputCode}" === "${cleanStoredCode}"`);

            // Verify the code
            if (cleanInputCode === cleanStoredCode) {
                this.session.confirmed = true;
                this.updateStoredSession();

                console.log('✅ AiSensy OTP verification successful');
                return {
                    user: {
                        uid: `aisensy_${this.session.phoneNumber}`,
                        phoneNumber: this.session.phoneNumber,
                        isAnonymous: false,
                        providerData: [{
                            providerId: 'phone',
                            uid: this.session.phoneNumber,
                            phoneNumber: this.session.phoneNumber
                        }]
                    }
                };
            } else {
                console.log('❌ AiSensy OTP verification failed');
                console.log(`Expected: "${cleanStoredCode}", Got: "${cleanInputCode}"`);
                const error = new Error('Invalid verification code');
                (error as any).code = 'auth/invalid-verification-code';
                throw error;
            }
        } catch (error: any) {
            console.error('❌ AiSensy OTP verification error:', error);
            
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
        localStorage.setItem('aisensy_otp_sessions', JSON.stringify(sessions));
    }

    private getStoredSessions(): Record<string, OTPSession> {
        try {
            const stored = localStorage.getItem('aisensy_otp_sessions');
            return stored ? JSON.parse(stored) : {};
        } catch {
            return {};
        }
    }
}

export class AiSensyOTPService {
    private static instance: AiSensyOTPService;

    static getInstance(): AiSensyOTPService {
        if (!AiSensyOTPService.instance) {
            AiSensyOTPService.instance = new AiSensyOTPService();
        }
        return AiSensyOTPService.instance;
    }

    /**
     * Generate a 6-digit OTP code
     */
    private generateOTP(): string {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }

    /**
     * Format phone number for AiSensy (ensure it has country code)
     */
    private formatPhoneNumber(phoneNumber: string): string {
        // Remove any spaces, dashes, or parentheses
        let formatted = phoneNumber.replace(/[\s\-\(\)]/g, '');

        // If it doesn't start with +, assume it's Indian number and add +91
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
     * Send OTP via AiSensy WhatsApp API
     */
    async sendOTP(phoneNumber: string, providedOtpCode?: string): Promise<ConfirmationResult> {
        console.log(`📱 Sending AiSensy WhatsApp OTP to: ${phoneNumber}`);

        const formattedPhone = this.formatPhoneNumber(phoneNumber);
        const otpCode = providedOtpCode || this.generateOTP();

        // Create OTP session
        const session: OTPSession = {
            phoneNumber: formattedPhone,
            otpCode,
            timestamp: Date.now(),
            attempts: 0,
            confirmed: false
        };

        try {
            // Determine template parameters based on template type
            // Based on WhatsApp template structure and common patterns
            let templateParams: string[];

            // Based on your message "Playgram is your verification code", 
            // the template needs the OTP code in the message body
            switch (AISENSY_CONFIG.templateType) {
                case 'with_url':
                case 'with_greeting':
                    // Template likely: "{{1}} is your verification code"
                    // where {{1}} should be the actual OTP code
                    templateParams = [otpCode];
                    break;

                case 'simple':
                default:
                    // Simple template: OTP code in message body
                    templateParams = [otpCode];
                    break;
            }

            // Prepare AiSensy API payload based on your exact format
            const payload = {
                apiKey: AISENSY_CONFIG.apiKey,
                campaignName: AISENSY_CONFIG.campaignName,
                destination: formattedPhone,
                userName: 'PlayGram User',
                templateParams: templateParams,
                source: 'PlayGram Enrollment',
                media: {},
                buttons: [
                    {
                        type: 'button',
                        sub_type: 'url',
                        index: 0,
                        parameters: [
                            {
                                type: 'text',
                                text: otpCode // Use OTP code as the URL parameter
                            }
                        ]
                    }
                ],
                carouselCards: [],
                location: {},
                attributes: {
                    enrollment_step: 'phone_verification',
                    otp_timestamp: new Date().toISOString()
                },
                paramsFallbackValue: {
                    FirstName: 'PlayGram User'
                }
            };

            console.log('📤 Sending AiSensy API request:', {
                ...payload,
                apiKey: '***HIDDEN***'
            });

            // Send OTP via AiSensy API
            const response = await fetch(AISENSY_CONFIG.baseUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorData = await response.text();
                console.error('❌ AiSensy API error:', response.status, errorData);

                // Handle template parameter mismatch errors
                if (errorData.includes('Button at index 0 of type Url requires a parameter') || 
                    errorData.includes('Template params does not match the campaign')) {
                    console.log('🔄 Retrying with different parameter combinations...');

                    // Try different parameter combinations - prioritize OTP in message body
                    const retryConfigs = [
                        // Option 1: OTP code in message body (most likely correct)
                        {
                            templateParams: [otpCode],
                            buttons: [
                                {
                                    type: 'button',
                                    sub_type: 'url',
                                    index: 0,
                                    parameters: [
                                        {
                                            type: 'text',
                                            text: 'https://playgram.in/verify'
                                        }
                                    ]
                                }
                            ],
                            description: 'OTP in message body + URL in button'
                        },
                        // Option 2: Just OTP in message, no buttons
                        {
                            templateParams: [otpCode],
                            buttons: [],
                            description: 'OTP in message body only'
                        },
                        // Option 3: OTP + URL as template params
                        {
                            templateParams: [otpCode, 'https://playgram.in/verify'],
                            buttons: [],
                            description: 'OTP + URL in template params'
                        },
                        // Option 4: Name + OTP in template params
                        {
                            templateParams: ['PlayGram User', otpCode],
                            buttons: [],
                            description: 'Name + OTP in template params'
                        },
                        // Option 5: Original format (fallback)
                        {
                            templateParams: ['$FirstName'],
                            buttons: [
                                {
                                    type: 'button',
                                    sub_type: 'url',
                                    index: 0,
                                    parameters: [
                                        {
                                            type: 'text',
                                            text: otpCode
                                        }
                                    ]
                                }
                            ],
                            description: 'Original: $FirstName + OTP in button'
                        }
                    ];

                    for (const config of retryConfigs) {
                        console.log(`🔄 Trying: ${config.description}`);

                        const retryPayload = {
                            ...payload,
                            templateParams: config.templateParams,
                            buttons: config.buttons || payload.buttons,
                            media: {},
                            carouselCards: [],
                            location: {},
                            paramsFallbackValue: {
                                FirstName: 'PlayGram User'
                            }
                        };

                        try {
                            const retryResponse = await fetch(AISENSY_CONFIG.baseUrl, {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify(retryPayload)
                            });

                            if (retryResponse.ok) {
                                const retryResult = await retryResponse.json();
                                console.log(`✅ AiSensy OTP sent successfully (${config.description}):`, retryResult);
                                this.storeSession(session);
                                return new AiSensyConfirmationResult(session);
                            } else {
                                const retryError = await retryResponse.text();
                                console.log(`❌ Retry failed (${config.description}):`, retryError);
                            }
                        } catch (retryErr) {
                            console.log(`❌ Retry error (${config.description}):`, retryErr);
                        }
                    }
                }

                throw new Error(`AiSensy API error: ${response.status} - ${errorData}`);
            }

            const result = await response.json();
            console.log('✅ AiSensy OTP sent successfully:', result);

            // Store session for verification
            this.storeSession(session);

            // Return mock ConfirmationResult for compatibility
            return new AiSensyConfirmationResult(session);

        } catch (error: any) {
            console.error('❌ Failed to send AiSensy OTP:', error);

            // In development mode, create a mock session for testing
            if (import.meta.env.DEV) {
                console.log('🧪 Development mode: Creating mock OTP session');
                console.log(`🔑 Development OTP code: ${otpCode}`);
                console.log(`📱 Phone number: ${formattedPhone}`);
                console.log(`⏰ Session timestamp: ${session.timestamp}`);
                
                // Show alert in development mode so user can see the OTP
                alert(`🧪 DEVELOPMENT MODE\n\nYour OTP code is: ${otpCode}\n\nPhone: ${formattedPhone}\n\nThis alert only appears in development mode.`);
                
                // Also log prominently in console
                console.log(`%c🔑 YOUR OTP CODE: ${otpCode}`, 'background: #4CAF50; color: white; padding: 10px; font-size: 16px; font-weight: bold;');

                this.storeSession(session);
                return new AiSensyConfirmationResult(session);
            }

            // Handle specific errors
            if (error.message?.includes('network') || error.message?.includes('fetch')) {
                throw {
                    code: 'auth/network-request-failed',
                    message: 'Network error. Please check your connection and try again.'
                };
            }

            throw {
                code: 'auth/internal-error',
                message: 'Failed to send verification code. Please try again.'
            };
        }
    }

    /**
     * Store OTP session in localStorage
     */
    private storeSession(session: OTPSession): void {
        try {
            const sessions = this.getStoredSessions();
            sessions[session.phoneNumber] = session;
            localStorage.setItem('aisensy_otp_sessions', JSON.stringify(sessions));
        } catch (error) {
            console.warn('⚠️ Could not store OTP session:', error);
        }
    }

    /**
     * Get stored OTP sessions
     */
    private getStoredSessions(): Record<string, OTPSession> {
        try {
            const stored = localStorage.getItem('aisensy_otp_sessions');
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
     * Clean up expired sessions
     */
    cleanupExpiredSessions(): void {
        try {
            const sessions = this.getStoredSessions();
            const now = Date.now();
            const validSessions: Record<string, OTPSession> = {};

            Object.entries(sessions).forEach(([phone, session]) => {
                // Keep sessions that are less than 10 minutes old
                if (now - session.timestamp < 10 * 60 * 1000) {
                    validSessions[phone] = session;
                }
            });

            localStorage.setItem('aisensy_otp_sessions', JSON.stringify(validSessions));
        } catch (error) {
            console.warn('⚠️ Could not cleanup expired sessions:', error);
        }
    }

    /**
     * Check if rate limiting should be applied
     */
    isRateLimited(phoneNumber: string): boolean {
        const session = this.getSession(phoneNumber);
        if (!session) return false;

        // Rate limit: 1 OTP per minute per phone number
        const timeSinceLastOTP = Date.now() - session.timestamp;
        return timeSinceLastOTP < 60000; // 1 minute
    }

    /**
     * Initialize service (cleanup expired sessions)
     */
    initialize(): void {
        console.log('🚀 Initializing AiSensy OTP Service');
        this.cleanupExpiredSessions();
    }

    /**
     * No-op methods for compatibility with Firebase service
     */
    initializeRecaptcha(_containerId: string): void {
        // No reCAPTCHA needed for WhatsApp OTP
        console.log('📱 AiSensy WhatsApp OTP - No reCAPTCHA required');
    }

    cleanup(): void {
        // Clean up expired sessions
        this.cleanupExpiredSessions();
    }

    isRecaptchaReady(): boolean {
        // Always ready since no reCAPTCHA needed
        return true;
    }

    isDevelopmentMode(): boolean {
        return import.meta.env.DEV;
    }
}

// Export singleton instance
export const aisensyOTPService = AiSensyOTPService.getInstance();