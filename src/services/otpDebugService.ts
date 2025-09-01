/**
 * OTP Debug Service - Helps debug OTP verification issues
 */

export class OTPDebugService {
    /**
     * Debug OTP session information
     */
    static debugSession(phoneNumber: string): void {
        console.log('🔍 Debugging OTP session for:', phoneNumber);
        
        // Check all possible session storages
        const realSessions = localStorage.getItem('real_otp_sessions');
        const aisensySessions = localStorage.getItem('aisensy_otp_sessions');
        const devSession = localStorage.getItem('dev_otp_session');
        
        console.log('📋 Real OTP Sessions:', realSessions ? JSON.parse(realSessions) : 'None');
        console.log('📋 AiSensy Sessions:', aisensySessions ? JSON.parse(aisensySessions) : 'None');
        console.log('📋 Dev Session:', devSession ? JSON.parse(devSession) : 'None');
        
        // Check for the specific phone number
        if (realSessions) {
            const sessions = JSON.parse(realSessions);
            const formattedNumbers = [
                phoneNumber,
                `+91${phoneNumber}`,
                phoneNumber.replace('+91', ''),
                phoneNumber.replace(/\D/g, '')
            ];
            
            console.log('🔍 Checking formatted numbers:', formattedNumbers);
            
            formattedNumbers.forEach(num => {
                if (sessions[num]) {
                    console.log(`✅ Found session for ${num}:`, sessions[num]);
                }
            });
        }
    }
    
    /**
     * Verify OTP manually for debugging
     */
    static verifyOTPManually(phoneNumber: string, inputOTP: string): boolean {
        console.log('🔐 Manual OTP verification');
        console.log('📱 Phone:', phoneNumber);
        console.log('🔑 Input OTP:', inputOTP);
        
        const realSessions = localStorage.getItem('real_otp_sessions');
        if (!realSessions) {
            console.log('❌ No real sessions found');
            return false;
        }
        
        const sessions = JSON.parse(realSessions);
        const formattedNumbers = [
            phoneNumber,
            `+91${phoneNumber}`,
            phoneNumber.replace('+91', ''),
            phoneNumber.replace(/\D/g, '')
        ];
        
        for (const num of formattedNumbers) {
            const session = sessions[num];
            if (session) {
                console.log(`🔍 Found session for ${num}:`, session);
                console.log(`🔑 Stored OTP: "${session.otpCode}"`);
                console.log(`🔑 Input OTP: "${inputOTP}"`);
                console.log(`✅ Match: ${session.otpCode === inputOTP}`);
                
                if (session.otpCode === inputOTP) {
                    return true;
                }
            }
        }
        
        console.log('❌ No matching OTP found');
        return false;
    }
    
    /**
     * Clear all OTP sessions
     */
    static clearAllSessions(): void {
        localStorage.removeItem('real_otp_sessions');
        localStorage.removeItem('aisensy_otp_sessions');
        localStorage.removeItem('dev_otp_session');
        console.log('🧹 All OTP sessions cleared');
    }
    
    /**
     * Create a test OTP session
     */
    static createTestSession(phoneNumber: string, otpCode: string = '123456'): void {
        const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+91${phoneNumber}`;
        
        const session = {
            phoneNumber: formattedPhone,
            otpCode: otpCode,
            timestamp: Date.now(),
            attempts: 0,
            confirmed: false,
            sessionId: `test_${Date.now()}`
        };
        
        const sessions = JSON.parse(localStorage.getItem('real_otp_sessions') || '{}');
        sessions[formattedPhone] = session;
        localStorage.setItem('real_otp_sessions', JSON.stringify(sessions));
        
        console.log('🧪 Created test session:', session);
        console.log(`🔑 Use OTP: ${otpCode}`);
    }
}

// Make available globally for debugging
if (typeof window !== 'undefined') {
    (window as any).OTPDebugService = OTPDebugService;
}