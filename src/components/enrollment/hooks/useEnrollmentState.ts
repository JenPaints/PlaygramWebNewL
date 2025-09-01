// Comprehensive enrollment state management hook

import { useState, useEffect, useCallback, useRef } from 'react';
import { EnrollmentState, EnrollmentStep } from '../types';
import { useErrorHandler } from './useErrorHandler';
import { useStatePersistence, useStateRecovery } from '../utils/statePersistence';
import { handleError } from '../utils/errorHandling';

export interface UseEnrollmentStateOptions {
  autoSave?: boolean;
  autoRecover?: boolean;
  sessionTimeoutMinutes?: number;
  onStateRecovered?: (state: Partial<EnrollmentState>) => void;
  onSessionTimeout?: () => void;
  onError?: (error: any) => void;
}

const DEFAULT_STATE: EnrollmentState = {
  currentStep: 'auth',
  userPhone: '',
  isAuthenticated: false,
  selectedPlan: null,
  paymentStatus: 'pending',
  enrollmentData: {
    phoneNumber: '',
    sport: 'football',
    planId: '',
    status: 'pending',
    enrollmentDate: new Date(),
  },
  errors: {},
};

/**
 * Comprehensive hook for managing enrollment state with persistence and recovery
 */
export function useEnrollmentState(options: UseEnrollmentStateOptions = {}) {
  const {
    autoSave = true,
    autoRecover = true,
    sessionTimeoutMinutes = 10,
    onStateRecovered,
    onSessionTimeout,
    onError,
  } = options;

  const [state, setState] = useState<EnrollmentState>(DEFAULT_STATE);
  const [isRecovering, setIsRecovering] = useState(false);
  const [showRecoveryPrompt, setShowRecoveryPrompt] = useState(false);
  const [sessionTimeRemaining, setSessionTimeRemaining] = useState<number | null>(null);
  const [showTimeoutWarning, setShowTimeoutWarning] = useState(false);

  const errorHandler = useErrorHandler({
    onError: (error) => {
      onError?.(error);
      // Update state with error
      setState(prev => ({
        ...prev,
        errors: {
          ...prev.errors,
          [prev.currentStep]: error.userMessage,
        },
      }));
    },
  });

  const persistence = useStatePersistence({
    expirationMinutes: sessionTimeoutMinutes,
  });

  const recovery = useStateRecovery({
    onStateRecovered: (recoveredState) => {
      setState(prev => ({ ...prev, ...recoveredState }));
      onStateRecovered?.(recoveredState);
    },
    onRecoveryFailed: (error) => {
      errorHandler.setError(error, 'state-recovery');
    },
  });

  const timeoutRef = useRef<NodeJS.Timeout>();
  const warningTimeoutRef = useRef<NodeJS.Timeout>();

  // Auto-save state changes
  useEffect(() => {
    if (autoSave && state !== DEFAULT_STATE) {
      const timeoutId = setTimeout(() => {
        persistence.saveState(state);
      }, 1000); // Debounce saves

      return () => clearTimeout(timeoutId);
    }
  }, [state, autoSave, persistence]);

  // Auto-recovery on mount
  useEffect(() => {
    if (autoRecover && recovery.canRecover()) {
      const recoveryInfo = recovery.getRecoveryInfo();
      
      if (recoveryInfo.canRecover) {
        setShowRecoveryPrompt(true);
      }
    }
  }, [autoRecover, recovery]);

  // Session timeout management
  useEffect(() => {
    const startSessionTimeout = () => {
      // Clear existing timeouts
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);

      const timeoutMs = sessionTimeoutMinutes * 60 * 1000;
      const warningMs = timeoutMs - (2 * 60 * 1000); // Show warning 2 minutes before timeout

      // Set warning timeout
      warningTimeoutRef.current = setTimeout(() => {
        setShowTimeoutWarning(true);
        setSessionTimeRemaining(120); // 2 minutes

        // Countdown timer
        const countdownInterval = setInterval(() => {
          setSessionTimeRemaining(prev => {
            if (prev === null || prev <= 1) {
              clearInterval(countdownInterval);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }, warningMs);

      // Set session timeout
      timeoutRef.current = setTimeout(() => {
        setShowTimeoutWarning(false);
        setSessionTimeRemaining(null);
        persistence.clearState();
        onSessionTimeout?.();
      }, timeoutMs);
    };

    if (state.isAuthenticated) {
      startSessionTimeout();
    }

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
    };
  }, [state.isAuthenticated, sessionTimeoutMinutes, persistence, onSessionTimeout]);

  // State update function
  const updateState = useCallback((updates: Partial<EnrollmentState>) => {
    setState(prev => {
      const newState = { ...prev, ...updates };
      
      // Clear step-specific errors when moving to a new step
      if (updates.currentStep && updates.currentStep !== prev.currentStep) {
        newState.errors = {
          ...prev.errors,
          [updates.currentStep]: undefined,
        };
      }

      return newState;
    });
  }, []);

  // Step navigation functions
  const goToStep = useCallback((step: EnrollmentStep) => {
    updateState({ currentStep: step });
  }, [updateState]);

  const nextStep = useCallback(() => {
    const steps: EnrollmentStep[] = ['auth', 'court', 'pricing', 'payment', 'confirmation'];
    const currentIndex = steps.indexOf(state.currentStep);
    
    if (currentIndex < steps.length - 1) {
      goToStep(steps[currentIndex + 1]);
    }
  }, [state.currentStep, goToStep]);

  const previousStep = useCallback(() => {
    const steps: EnrollmentStep[] = ['auth', 'court', 'pricing', 'payment', 'confirmation'];
    const currentIndex = steps.indexOf(state.currentStep);
    
    if (currentIndex > 0) {
      goToStep(steps[currentIndex - 1]);
    }
  }, [state.currentStep, goToStep]);

  // Error handling functions
  const setError = useCallback((error: any, step?: string) => {
    const enrollmentError = handleError(error, step || state.currentStep);
    errorHandler.setError(error, step || state.currentStep);
  }, [state.currentStep, errorHandler]);

  const clearError = useCallback((step?: string) => {
    const targetStep = step || state.currentStep;
    setState(prev => ({
      ...prev,
      errors: {
        ...prev.errors,
        [targetStep]: undefined,
      },
    }));
    errorHandler.clearError();
  }, [state.currentStep, errorHandler]);

  // Recovery functions
  const handleRecovery = useCallback(async () => {
    setIsRecovering(true);
    setShowRecoveryPrompt(false);
    
    try {
      await recovery.recoverState();
    } catch (error) {
      setError(error, 'recovery');
    } finally {
      setIsRecovering(false);
    }
  }, [recovery, setError]);

  const discardRecovery = useCallback(() => {
    setShowRecoveryPrompt(false);
    persistence.clearState();
  }, [persistence]);

  // Session management functions
  const extendSession = useCallback(() => {
    persistence.extendExpiration(sessionTimeoutMinutes);
    setShowTimeoutWarning(false);
    setSessionTimeRemaining(null);
  }, [persistence, sessionTimeoutMinutes]);

  const resetState = useCallback(() => {
    setState(DEFAULT_STATE);
    persistence.clearState();
    errorHandler.clearError();
  }, [persistence, errorHandler]);

  // Save state manually
  const saveState = useCallback(() => {
    return persistence.saveState(state);
  }, [persistence, state]);

  return {
    // State
    state,
    updateState,
    resetState,
    saveState,

    // Navigation
    goToStep,
    nextStep,
    previousStep,

    // Error handling
    error: errorHandler.error,
    setError,
    clearError,
    isRetrying: errorHandler.isRetrying,
    canRetry: errorHandler.canRetry,
    retry: errorHandler.retry,

    // Recovery
    isRecovering,
    showRecoveryPrompt,
    recoveryInfo: recovery.getRecoveryInfo(),
    handleRecovery,
    discardRecovery,

    // Session management
    sessionTimeRemaining,
    showTimeoutWarning,
    extendSession,

    // Utility functions
    hasError: (step?: string) => {
      const targetStep = step || state.currentStep;
      return !!state.errors[targetStep] || !!errorHandler.error;
    },
    getError: (step?: string) => {
      const targetStep = step || state.currentStep;
      return state.errors[targetStep] || errorHandler.error?.userMessage;
    },
    isStepComplete: (step: EnrollmentStep) => {
      switch (step) {
        case 'auth':
          return state.isAuthenticated;
        case 'court':
          return state.isAuthenticated; // Court details are informational
        case 'pricing':
          return !!state.selectedPlan;
        case 'payment':
          return state.paymentStatus === 'success';
        case 'confirmation':
          return state.paymentStatus === 'success' && !!state.enrollmentData.id;
        default:
          return false;
      }
    },
    canProceedToStep: (step: EnrollmentStep) => {
      const steps: EnrollmentStep[] = ['auth', 'court', 'pricing', 'payment', 'confirmation'];
      const targetIndex = steps.indexOf(step);
      
      const isStepComplete = (checkStep: EnrollmentStep) => {
        switch (checkStep) {
          case 'auth':
            return state.isAuthenticated;
          case 'court':
            return state.isAuthenticated; // Court details are informational
          case 'pricing':
            return !!state.selectedPlan;
          case 'payment':
            return state.paymentStatus === 'success';
          case 'confirmation':
            return state.paymentStatus === 'success' && !!state.enrollmentData.id;
          default:
            return false;
        }
      };
      
      // Check if all previous steps are complete
      for (let i = 0; i < targetIndex; i++) {
        if (!isStepComplete(steps[i])) {
          return false;
        }
      }
      
      return true;
    },
  };
}