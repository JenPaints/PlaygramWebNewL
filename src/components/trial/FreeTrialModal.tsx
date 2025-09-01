import React, { useState, useEffect, useCallback } from 'react';
import { FreeTrialModalProps, TrialBookingState, TrialStep } from './types';
import SportSelectionStep from './steps/SportSelectionStep';
import CalendarStep from './steps/CalendarStep';
import AuthStep from './steps/AuthStep';
import DetailsStep from './steps/DetailsStep';
import ConfirmationStep from './steps/ConfirmationStep';

const STORAGE_KEY = 'trial_booking_state';
const STATE_PRESERVATION_DURATION = 30 * 60 * 1000; // 30 minutes

const FreeTrialModal: React.FC<FreeTrialModalProps> = ({
    isOpen,
    onClose,
    initialSport
}) => {

    const [trialState, setTrialState] = useState<TrialBookingState>(() => {
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
                        selectedSport: initialSport || parsed.state.selectedSport
                    };
                }
            } catch (error) {
                console.warn('Failed to restore trial booking state:', error);
            }
        }

        // Default initial state
        return {
            currentStep: initialSport ? 'calendar' : 'sport',
            selectedSport: initialSport || null,
            selectedDate: null,
            userPhone: '',
            isAuthenticated: false,
            userDetails: null,
            bookingStatus: 'pending',
            errors: {}
        };
    });

    // Save state to localStorage whenever it changes
    useEffect(() => {
        if (isOpen) {
            const stateToSave = {
                state: trialState,
                timestamp: Date.now()
            };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
        }
    }, [trialState, isOpen]);

    // Clear saved state when modal is closed and booking is complete
    useEffect(() => {
        if (!isOpen && trialState.currentStep === 'confirmation') {
            localStorage.removeItem(STORAGE_KEY);
        }
    }, [isOpen, trialState.currentStep]);

    // Prevent background scrolling when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        }
        
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    const updateState = useCallback((updates: Partial<TrialBookingState>) => {
        setTrialState(prev => ({ ...prev, ...updates }));
    }, []);

    const handleStepChange = useCallback((step: TrialStep) => {
        updateState({ currentStep: step });
    }, [updateState]);

    const handleClose = useCallback(() => {
        // Only preserve state if user has made progress
        if (trialState.isAuthenticated || trialState.selectedDate) {
            console.log('Trial booking state preserved for 30 minutes');
        } else {
            localStorage.removeItem(STORAGE_KEY);
        }
        onClose();
    }, [trialState.isAuthenticated, trialState.selectedDate, onClose]);

    // Handle escape key
    useEffect(() => {
        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape' && isOpen) {
                handleClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
        };
    }, [isOpen, handleClose]);

    if (!isOpen) return null;

    const steps = [
        { key: 'sport', label: 'Sport', icon: '⚽' },
        { key: 'calendar', label: 'Date', icon: '📅' },
        { key: 'auth', label: 'Phone', icon: '📱' },
        { key: 'details', label: 'Details', icon: '👤' },
        { key: 'confirmation', label: 'Confirm', icon: '✅' }
    ];

    const currentStepIndex = steps.findIndex(step => step.key === trialState.currentStep);



    const renderCurrentStep = () => {
        const stepProps = {
            onNext: () => {
                const nextStepIndex = currentStepIndex + 1;
                if (nextStepIndex < steps.length) {
                    handleStepChange(steps[nextStepIndex].key as TrialStep);
                }
            },
            onBack: currentStepIndex > 0 ? () => {
                const prevStepIndex = currentStepIndex - 1;
                handleStepChange(steps[prevStepIndex].key as TrialStep);
            } : undefined,
            trialState,
            updateState
        };

        switch (trialState.currentStep) {
            case 'sport':
                return <SportSelectionStep {...stepProps} />;
            case 'calendar':
                return <CalendarStep {...stepProps} />;
            case 'auth':
                return <AuthStep {...stepProps} />;
            case 'details':
                return <DetailsStep {...stepProps} />;
            case 'confirmation':
                // Generate confirmation data with actual or fallback booking ID
                const confirmationData = {
                    bookingId: trialState.actualBookingId || `trial_${Date.now()}`,
                    sport: trialState.selectedSport!,
                    date: trialState.selectedDate!,
                    time: '10:00 AM - 11:30 AM',
                    courtLocation: 'HSR Football Court, HSR Layout, Bangalore',
                    coachDetails: {
                        name: 'Coach Playgram',
                        contact: '+91 7888388817'
                    },
                    instructions: [
                        'Arrive 15 minutes before the session',
                        'Bring your own water bottle',
                        'Wear comfortable sports attire',
                        'Contact coach if you need to reschedule'
                    ]
                };

                return (
                    <ConfirmationStep
                        {...stepProps}
                        confirmationData={confirmationData}
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
        <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4"
            onClick={(e) => {
                if (e.target === e.currentTarget) {
                    handleClose();
                }
            }}
        >
            <div
                className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[95vh] overflow-hidden transform transition-all duration-300 ease-out mx-2"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50">
                    <div className="flex items-center space-x-4">
                        <img
                            src="https://jenpaints.art/wp-content/uploads/2025/08/Screenshot_2025-07-13_at_22.16.29-removebg-preview.png"
                            alt="PlayGram Logo"
                            className="h-10 w-auto"
                        />
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-1">
                                Book Free Trial
                            </h2>
                            <p className="text-sm text-gray-600">
                                Step {currentStepIndex + 1} of {steps.length}: {steps[currentStepIndex]?.label}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="text-xs bg-green-100 text-green-800 px-3 py-1 rounded-full font-medium">
                            100% FREE
                        </div>
                        <div className="text-xs bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-medium">
                            Sundays Only
                        </div>
                        <button
                            onClick={handleClose}
                            className="text-gray-400 hover:text-gray-600 hover:bg-white/80 rounded-full p-2 transition-all duration-200"
                            aria-label="Close modal"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Progress Indicator */}
                <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-blue-50/30">
                    <div className="flex items-center justify-between">
                        {steps.map((step, index) => (
                            <div key={step.key} className="flex items-center flex-1">
                                <div className="flex flex-col items-center">
                                    <div className={`
                                        w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300
                                        ${index < currentStepIndex
                                            ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg transform scale-110'
                                            : index === currentStepIndex
                                                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg ring-4 ring-blue-200 transform scale-110'
                                                : 'bg-gray-200 text-gray-500 hover:bg-gray-300'
                                        }
                                    `}>
                                        {index < currentStepIndex ? (
                                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                        ) : (
                                            <span>{step.icon}</span>
                                        )}
                                    </div>
                                    <span className={`
                                        mt-2 text-xs font-medium text-center max-w-[80px] leading-tight
                                        ${index <= currentStepIndex ? 'text-gray-900' : 'text-gray-500'}
                                    `}>
                                        {step.label}
                                    </span>
                                </div>

                                {index < steps.length - 1 && (
                                    <div className="flex-1 mx-2 mt-[-20px]">
                                        <div className={`
                                            h-1 rounded-full transition-all duration-500
                                            ${index < currentStepIndex ? 'bg-gradient-to-r from-green-500 to-emerald-500' : 'bg-gray-200'}
                                        `} />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Content */}
                <div className="overflow-y-auto max-h-[calc(95vh-200px)]">
                    <div className="p-8">
                        {renderCurrentStep()}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FreeTrialModal;