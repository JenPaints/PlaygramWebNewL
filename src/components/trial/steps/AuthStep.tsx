import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrialStepProps } from '../types';
import { aisensyOTPService } from '../../../services/aisensyOTP';
import { ConfirmationResult } from 'firebase/auth';

const AuthStep: React.FC<TrialStepProps> = ({
    onNext,
    onBack,
    trialState,
    updateState
}) => {
    const [phoneNumber, setPhoneNumber] = useState(trialState.userPhone || '');
    const [otp, setOtp] = useState('');
    const [isOtpSent, setIsOtpSent] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [countdown, setCountdown] = useState(0);
    const [error, setError] = useState('');
    const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);

    // Countdown timer for resend OTP
    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (countdown > 0) {
            timer = setTimeout(() => setCountdown(countdown - 1), 1000);
        }
        return () => clearTimeout(timer);
    }, [countdown]);

    const validatePhoneNumber = (phone: string) => {
        const phoneRegex = /^[6-9]\d{9}$/;
        return phoneRegex.test(phone);
    };

    const handleSendOTP = async () => {
        if (!validatePhoneNumber(phoneNumber)) {
            setError('Please enter a valid 10-digit mobile number');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            console.log('📱 Sending AISensy WhatsApp OTP to:', phoneNumber);
            const confirmation = await aisensyOTPService.sendOTP(`+91${phoneNumber}`);
            
            if (confirmation) {
                setConfirmationResult(confirmation);
                setIsOtpSent(true);
                setCountdown(60); // 1 minute countdown
                updateState({ userPhone: phoneNumber });
                console.log('✅ AISensy WhatsApp OTP sent successfully');
            } else {
                setError('Failed to send WhatsApp OTP. Please try again.');
            }
        } catch (error: any) {
            console.error('❌ OTP send error:', error);
            
            // Handle specific error types
            if (error.code === 'auth/too-many-requests') {
                setError('Too many attempts. Please wait a minute before trying again.');
            } else if (error.code === 'auth/invalid-phone-number') {
                setError('Invalid phone number format. Please check and try again.');
            } else {
                setError(error.message || 'Failed to send WhatsApp OTP. Please check your connection and try again.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyOTP = async () => {
        if (!otp || otp.length !== 6) {
            setError('Please enter a valid 6-digit OTP');
            return;
        }

        if (!confirmationResult) {
            setError('No verification session found. Please request a new OTP.');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            console.log('🔐 Verifying AISensy WhatsApp OTP:', otp);
            const result = await confirmationResult.confirm(otp);
            
            if (result?.user) {
                console.log('✅ AISensy WhatsApp OTP verification successful');
                updateState({
                    isAuthenticated: true,
                    userPhone: phoneNumber,
                    errors: { ...trialState.errors, auth: '' }
                });
                onNext();
            } else {
                setError('Verification failed. Please try again.');
            }
        } catch (error: any) {
            console.error('❌ OTP verification error:', error);
            
            // Handle specific error types
            if (error.code === 'auth/invalid-verification-code') {
                setError('Invalid OTP. Please check and try again.');
            } else if (error.code === 'auth/code-expired') {
                setError('OTP has expired. Please request a new one.');
                setIsOtpSent(false);
                setConfirmationResult(null);
            } else if (error.code === 'auth/too-many-requests') {
                setError('Too many verification attempts. Please request a new OTP.');
                setIsOtpSent(false);
                setConfirmationResult(null);
            } else {
                setError(error.message || 'Failed to verify WhatsApp OTP. Please try again.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleResendOTP = async () => {
        if (countdown === 0) {
            setOtp('');
            setConfirmationResult(null);
            await handleSendOTP();
        }
    };

    return (
        <div className="max-w-md mx-auto">
            <div className="text-center mb-8">
                <h3 className="text-3xl font-bold text-gray-900 mb-4">
                    Phone Verification
                </h3>
                <p className="text-lg text-gray-600">
                    We'll send you an OTP to verify your phone number
                </p>
                <div className="mt-4 inline-flex items-center bg-yellow-50 text-yellow-800 px-4 py-2 rounded-full text-sm font-medium">
                    <span className="mr-2">⚠️</span>
                    One trial per phone number only
                </div>
            </div>

            <div className="space-y-6">
                {!isOtpSent ? (
                    // Phone Number Input
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-4"
                    >
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Mobile Number
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <span className="text-gray-500 text-sm">+91</span>
                                </div>
                                <input
                                    type="tel"
                                    value={phoneNumber}
                                    onChange={(e) => {
                                        const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                                        setPhoneNumber(value);
                                        setError('');
                                    }}
                                    placeholder="Enter 10-digit mobile number"
                                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                                    maxLength={10}
                                />
                            </div>
                            {phoneNumber && !validatePhoneNumber(phoneNumber) && (
                                <p className="mt-1 text-sm text-red-600">
                                    Please enter a valid 10-digit mobile number
                                </p>
                            )}
                        </div>

                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleSendOTP}
                            disabled={!validatePhoneNumber(phoneNumber) || isLoading}
                            className="w-full py-3 px-6 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg"
                        >
                            {isLoading ? (
                                <div className="flex items-center justify-center space-x-2">
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    <span>Sending OTP...</span>
                                </div>
                            ) : (
                                'Send OTP'
                            )}
                        </motion.button>
                    </motion.div>
                ) : (
                    // OTP Input
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-4"
                    >
                        <div className="text-center mb-4">
                            <p className="text-gray-600">
                                OTP sent to <span className="font-semibold">+91 {phoneNumber}</span>
                            </p>
                            <button
                                onClick={() => {
                                    setIsOtpSent(false);
                                    setOtp('');
                                    setError('');
                                }}
                                className="text-blue-600 hover:text-blue-700 text-sm font-medium mt-1"
                            >
                                Change number
                            </button>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Enter OTP
                            </label>
                            <input
                                type="text"
                                value={otp}
                                onChange={(e) => {
                                    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                                    setOtp(value);
                                    setError('');
                                }}
                                placeholder="Enter 6-digit OTP"
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg text-center tracking-widest"
                                maxLength={6}
                            />
                        </div>

                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleVerifyOTP}
                            disabled={otp.length !== 6 || isLoading}
                            className="w-full py-3 px-6 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg"
                        >
                            {isLoading ? (
                                <div className="flex items-center justify-center space-x-2">
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    <span>Verifying...</span>
                                </div>
                            ) : (
                                'Verify OTP'
                            )}
                        </motion.button>

                        <div className="text-center">
                            <button
                                onClick={handleResendOTP}
                                disabled={countdown > 0 || isLoading}
                                className="text-blue-600 hover:text-blue-700 text-sm font-medium disabled:text-gray-400 disabled:cursor-not-allowed"
                            >
                                {countdown > 0 ? `Resend OTP in ${countdown}s` : 'Resend OTP'}
                            </button>
                        </div>
                    </motion.div>
                )}

                {/* Error Message */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                        <div className="flex items-center space-x-2">
                            <div className="text-red-600">❌</div>
                            <p className="text-red-800 text-sm">{error}</p>
                        </div>
                    </div>
                )}

                {/* Info Box */}
                <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                    <div className="flex items-start space-x-3">
                        <div className="text-blue-600 text-lg">🔒</div>
                        <div>
                            <h4 className="font-semibold text-blue-900 text-sm mb-1">Secure Verification</h4>
                            <p className="text-blue-800 text-xs">
                                We use AISensy WhatsApp OTP for secure verification. Each phone number can book only one free trial.
                            </p>
                        </div>
                    </div>
                </div>


            </div>

            {/* Navigation */}
            <div className="flex justify-between mt-8">
                <button
                    onClick={onBack}
                    className="px-6 py-3 text-gray-600 hover:text-gray-800 font-medium transition-colors"
                >
                    ← Back to Calendar
                </button>
            </div>
        </div>
    );
};

export default AuthStep;