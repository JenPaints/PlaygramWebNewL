import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { EnrollmentModalProps, EnrollmentState, EnrollmentStep } from './types';
import EnrollmentErrorBoundary from './EnrollmentErrorBoundary';
import { PhoneAuthStep, CourtDetailsStep, PricingStep, PaymentStep, ConfirmationStep } from './steps';
import { PRICING_PLANS } from './utils/constants';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

const STORAGE_KEY = 'enrollment_state';
const STATE_PRESERVATION_DURATION = 10 * 60 * 1000; // 10 minutes

const EnrollmentModal: React.FC<EnrollmentModalProps> = ({
    isOpen,
    onClose,
    sport
}) => {
    const [enrollmentState, setEnrollmentState] = useState<EnrollmentState>(() => {
        // Try to restore state from localStorage
        const savedState = localStorage.getItem(STORAGE_KEY);
        if (savedState) {
            try {
                const parsed = JSON.parse(savedState);
                const savedTime = parsed.timestamp;
                const now = Date.now();

                // Check if saved state is within preservation duration
                if (now - savedTime < STATE_PRESERVATION_DURATION) {
                    return {
                        ...parsed.state,
                        sport, // Always use current sport
                        enrollmentData: {
                            ...parsed.state.enrollmentData,
                            sport
                        }
                    };
                }
            } catch (error) {
                console.warn('Failed to restore enrollment state:', error);
            }
        }

        // Default initial state
        return {
            currentStep: 'auth',
            userPhone: '',
            isAuthenticated: false,
            selectedPlan: null,
            paymentStatus: 'pending',
            enrollmentData: {
                phoneNumber: '',
                sport,
                planId: '',
                status: 'pending',
                enrollmentDate: new Date()
            },
            errors: {}
        };
    });

    // Save state to localStorage whenever it changes
    useEffect(() => {
        if (isOpen) {
            const stateToSave = {
                state: enrollmentState,
                timestamp: Date.now()
            };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
        }
    }, [enrollmentState, isOpen]);

    // Clear saved state when modal is closed and enrollment is complete
    useEffect(() => {
        if (!isOpen && enrollmentState.currentStep === 'confirmation') {
            localStorage.removeItem(STORAGE_KEY);
        }
    }, [isOpen, enrollmentState.currentStep]);

    // Prevent background scrolling and hide navigation when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            document.body.classList.add('enrollment-modal-open');
            return () => {
                document.body.style.overflow = 'unset';
                document.body.classList.remove('enrollment-modal-open');
            };
        }
    }, [isOpen]);

    const updateState = useCallback((updates: Partial<EnrollmentState>) => {
        setEnrollmentState(prev => ({ ...prev, ...updates }));
    }, []);

    const handleStepChange = useCallback((step: EnrollmentStep) => {
        updateState({ currentStep: step });
    }, [updateState]);

    const handleClose = useCallback(() => {
        // Only preserve state if user is authenticated or has made progress
        if (enrollmentState.isAuthenticated || enrollmentState.currentStep !== 'auth') {
            // State is already saved in localStorage via useEffect
            console.log('Enrollment state preserved for 10 minutes');
        } else {
            // Clear state if no progress made
            localStorage.removeItem(STORAGE_KEY);
        }
        onClose();
    }, [enrollmentState.isAuthenticated, enrollmentState.currentStep, onClose]);

    // Haptic feedback helper
    const hapticFeedback = useCallback(async () => {
        try {
            await Haptics.impact({ style: ImpactStyle.Light });
        } catch (error) {
            console.log('Haptics not available');
        }
    }, []);

    // Handle escape key
    useEffect(() => {
        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape' && isOpen) {
                handleClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            return () => document.removeEventListener('keydown', handleEscape);
        }
    }, [isOpen, handleClose]);

    if (!isOpen) return null;

    // Memoize steps array and renderCurrentStep function
    const steps = useMemo(() => [
    { key: 'auth', label: 'Authentication', icon: '🔐' },
    { key: 'court', label: 'Court Details', icon: '🏟️' },
    { key: 'pricing', label: 'Pricing', icon: '💰' },
    { key: 'payment', label: 'Payment', icon: '💳' },
    { key: 'confirmation', label: 'Confirmation', icon: '✅' }
    ], []);

    const currentStepIndex = steps.findIndex(step => step.key === enrollmentState.currentStep);

    const renderCurrentStep = () => {
        const stepProps = {
            onNext: () => {
                const nextStepIndex = currentStepIndex + 1;
                if (nextStepIndex < steps.length) {
                    handleStepChange(steps[nextStepIndex].key as EnrollmentStep);
                }
            },
            onBack: currentStepIndex > 0 ? () => {
                const prevStepIndex = currentStepIndex - 1;
                handleStepChange(steps[prevStepIndex].key as EnrollmentStep);
            } : undefined,
            enrollmentState,
            updateState
        };

        switch (enrollmentState.currentStep) {
            case 'auth':
                return <PhoneAuthStep {...stepProps} />;
            case 'court':
                return <CourtDetailsStep {...stepProps} />;
            case 'pricing':
                return <PricingStep {...stepProps} />;
            case 'payment':
                if (!enrollmentState.selectedPlan) {
                    // If no plan selected, go back to pricing
                    handleStepChange('pricing');
                    return null;
                }
                return (
                    <PaymentStep
                        {...stepProps}
                        selectedPlan={enrollmentState.selectedPlan}
                        userPhone={enrollmentState.userPhone}
                    />
                );
            case 'confirmation':
                // Use real enrollment data from payment success
                const realEnrollmentData = enrollmentState.enrollmentData;
                
                if (!realEnrollmentData || !realEnrollmentData.id) {
                    // If no real enrollment data, redirect back to payment
                    handleStepChange('payment');
                    return null;
                }

                return (
                    <ConfirmationStep
                        {...stepProps}
                        enrollmentId={realEnrollmentData.id}
                        userPhone={enrollmentState.userPhone}
                        selectedPlan={enrollmentState.selectedPlan}
                        onNext={handleClose}
                    />
                );
            default:
                return (
                    <div className="text-center py-12">
                        <div className="text-6xl mb-4">❓</div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">Unknown Step</h3>
                        <p className="text-gray-600">Something went wrong. Please try again.</p>
                    </div>
                );
        }
    };

    return (
        <EnrollmentErrorBoundary>
            {/* Modal Backdrop with blur effect */}
            <div
                className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4"
                onClick={(e) => {
                    // Close modal if clicking on backdrop
                    if (e.target === e.currentTarget) {
                        handleClose();
                    }
                }}
            >
                {/* Modal Container - Optimized for mobile */}
                <div
                    className="enrollment-modal bg-gradient-to-br from-gray-50 to-white rounded-2xl sm:rounded-3xl shadow-xl max-w-4xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-hidden transform transition-all duration-300 ease-out mx-2 sm:mx-4 ring-1 ring-gray-200 touch-manipulation"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Modal Header - Mobile Optimized */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-6 border-b border-gray-200 bg-gradient-to-r from-blue-100 via-indigo-100 to-purple-100 shadow-sm">
                        <div className="flex items-center space-x-3 sm:space-x-4 mb-3 sm:mb-0">
                            <img
                                src="https://jenpaints.art/wp-content/uploads/2025/08/Screenshot_2025-07-13_at_22.16.29-removebg-preview.png"
                                alt="PlayGram Logo"
                                className="h-8 sm:h-10 w-auto"
                            />
                            <div>
                                <h2 className="text-lg sm:text-2xl font-bold text-gray-900 mb-1">
                                    {sport.charAt(0).toUpperCase() + sport.slice(1)} Coaching
                                </h2>
                                <p className="text-xs sm:text-sm text-gray-600">
                                    Step {currentStepIndex + 1} of {steps.length}: {steps[currentStepIndex]?.label}
                                </p>
                            </div>
                        </div>
                        
                        {/* Mobile-friendly pricing preview */}
                        <div className="flex flex-wrap items-center gap-2 sm:gap-4 mb-3 sm:mb-0">
                            <div className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-medium">
                                From ₹{Math.round(PRICING_PLANS[0].price/PRICING_PLANS[0].sessions).toLocaleString()}/session
                            </div>
                            <div className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-medium hidden sm:block">
                                Premium Ground
                            </div>
                            <div className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full font-medium">
                                Save up to {PRICING_PLANS.find(p => p.popular)?.discount || '19%'}
                            </div>
                        </div>

                        <button
                            onClick={() => { hapticFeedback(); handleClose(); }}
                            className="absolute top-4 right-4 sm:relative sm:top-0 sm:right-0 text-gray-400 hover:text-gray-600 hover:bg-white/80 rounded-full p-3 transition-all duration-200 backdrop-blur-sm"
                            aria-label="Close modal"
                        >
                            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Enhanced Progress Indicator - Mobile Optimized */}
                    <div className="px-4 sm:px-6 py-3 sm:py-5 border-b border-gray-200 bg-gradient-to-r from-gray-100 to-blue-100/30 shadow-inner">
                        <div className="flex items-center justify-between">
                            {steps.map((step, index) => (
                                <div key={step.key} className="flex items-center flex-1">
                                    {/* Step Circle */}
                                    <div className="flex flex-col items-center">
                                        <div className={`
                      w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-xs sm:text-sm font-semibold transition-all duration-300
                      ${index < currentStepIndex
                                                ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg transform scale-110'
                                                : index === currentStepIndex
                                                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg ring-2 sm:ring-4 ring-blue-200 transform scale-110'
                                                    : 'bg-gray-200 text-gray-500 hover:bg-gray-300'
                                            }
                    `}>
                                            {index < currentStepIndex ? (
                                                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                </svg>
                                            ) : (
                                                <span className="text-xs sm:text-sm">{step.icon}</span>
                                            )}
                                        </div>
                                        <span className={`
                      mt-1 sm:mt-2 text-xs font-medium text-center max-w-[60px] sm:max-w-[80px] leading-tight
                      ${index <= currentStepIndex ? 'text-gray-900' : 'text-gray-500'}
                    `}>
                                            <span className="hidden sm:inline">{step.label}</span>
                                            <span className="sm:hidden">{step.label.split(' ')[0]}</span>
                                        </span>
                                    </div>

                                    {/* Progress Line */}
                                    {index < steps.length - 1 && (
                                        <div className="flex-1 mx-1 sm:mx-2 mt-[-15px] sm:mt-[-20px]">
                                            <div className={`
                        h-0.5 sm:h-1 rounded-full transition-all duration-500
                        ${index < currentStepIndex ? 'bg-gradient-to-r from-green-500 to-emerald-500' : 'bg-gray-200'}
                      `} />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>



                    {/* Modal Content - Mobile Optimized */}
                    <div className="flex flex-col max-h-[calc(95vh-180px)] sm:max-h-[calc(90vh-200px)]">
                        <div className="flex-1 overflow-hidden">
                        <div className="flex flex-col lg:flex-row h-full">
                            {/* Main Content */}
                            <div className="flex-1 flex flex-col overflow-hidden">
                                {enrollmentState.currentStep === 'pricing' ? (
                                    renderCurrentStep()
                                ) : (
                                    <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
                                        {renderCurrentStep()}
                                    </div>
                                )}
                            </div>

                            {/* Pricing & Details Sidebar - Hidden on mobile for auth and confirmation, collapsible on other steps */}
                            {enrollmentState.currentStep !== 'auth' && enrollmentState.currentStep !== 'confirmation' && (
                                <div className="lg:w-80 bg-gray-100 border-t lg:border-t-0 lg:border-l border-gray-300 p-4 sm:p-6 rounded-bl-lg lg:rounded-bl-none lg:rounded-tr-lg shadow-inner hidden lg:block">
                                    <div className="lg:sticky lg:top-0">
                                        <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                                            <span className="text-blue-600 mr-2">📋</span>
                                            Enrollment Summary
                                        </h3>

                                        {/* Selected Plan Display */}
                                        {enrollmentState.selectedPlan && (
                                            <div className="bg-white rounded-lg p-4 mb-4 border border-blue-200">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="font-medium text-gray-900">Selected Plan</span>
                                                    {enrollmentState.selectedPlan.popular && (
                                                        <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                                                            Most Popular
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="text-lg font-bold text-blue-600 mb-1">
                                                    {enrollmentState.selectedPlan.duration} Plan
                                                </div>
                                                <div className="flex items-center space-x-2 mb-2">
                                                    <span className="text-xl sm:text-2xl font-bold text-gray-900">
                                                        ₹{enrollmentState.selectedPlan.price.toLocaleString()}
                                                    </span>
                                                    <span className="text-sm text-gray-500 line-through">
                                                        ₹{enrollmentState.selectedPlan.originalPrice.toLocaleString()}
                                                    </span>
                                                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                                                        {enrollmentState.selectedPlan.discount}
                                                    </span>
                                                </div>
                                                <div className="text-sm text-gray-600 mb-3">
                                                    {enrollmentState.selectedPlan.sessions} coaching sessions included
                                                </div>
                                                <div className="space-y-1">
                                                    {enrollmentState.selectedPlan.features.slice(0, 3).map((feature, index) => (
                                                        <div key={index} className="flex items-center text-xs text-gray-600">
                                                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2 flex-shrink-0"></span>
                                                            <span className="truncate">{feature}</span>
                                                        </div>
                                                    ))}
                                                    {enrollmentState.selectedPlan.features.length > 3 && (
                                                        <div className="text-xs text-blue-600 font-medium">
                                                            {/* Additional features available */}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {/* User Info */}
                                        <div className="bg-white rounded-lg p-4 border border-gray-200">
                                            <h4 className="font-medium text-gray-900 mb-3">Your Information</h4>
                                            <div className="space-y-2 text-sm">
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Sport:</span>
                                                    <span className="font-medium text-gray-900 capitalize">{enrollmentState.enrollmentData.sport}</span>
                                                </div>
                                                {enrollmentState.userPhone && (
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-600">Phone:</span>
                                                        <span className="font-medium text-gray-900">{enrollmentState.userPhone}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                        </div>
                    </div>
                </div>
            </div>
        </EnrollmentErrorBoundary>
    );
};

export default EnrollmentModal;