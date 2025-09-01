// React hook for error handling in enrollment components

import { useState, useCallback } from 'react';
import { 
  EnrollmentError, 
  handleError, 
  isRetryableError, 
  getRetryDelay,
  formatErrorForDisplay 
} from '../utils/errorHandling';

export interface ErrorHandlerState {
  error: EnrollmentError | null;
  isRetrying: boolean;
  retryCount: number;
  canRetry: boolean;
}

export interface ErrorHandlerActions {
  setError: (error: any, step: string, userId?: string, customMessage?: string) => void;
  clearError: () => void;
  retry: (retryFn: () => Promise<void> | void) => Promise<void>;
  getDisplayError: () => { title: string; message: string; canRetry: boolean } | null;
}

export interface UseErrorHandlerOptions {
  maxRetries?: number;
  onError?: (error: EnrollmentError) => void;
  onRetry?: (retryCount: number) => void;
  onMaxRetriesReached?: (error: EnrollmentError) => void;
}

/**
 * Custom hook for handling errors in enrollment components
 */
export function useErrorHandler(options: UseErrorHandlerOptions = {}): ErrorHandlerState & ErrorHandlerActions {
  const {
    maxRetries = 3,
    onError,
    onRetry,
    onMaxRetriesReached,
  } = options;

  const [state, setState] = useState<ErrorHandlerState>({
    error: null,
    isRetrying: false,
    retryCount: 0,
    canRetry: false,
  });

  const setError = useCallback((
    error: any,
    step: string,
    userId?: string,
    customMessage?: string
  ) => {
    const enrollmentError = handleError(error, step, userId, customMessage);
    const canRetry = isRetryableError(enrollmentError) && state.retryCount < maxRetries;

    setState({
      error: enrollmentError,
      isRetrying: false,
      retryCount: 0,
      canRetry,
    });

    onError?.(enrollmentError);
  }, [maxRetries, onError, state.retryCount]);

  const clearError = useCallback(() => {
    setState({
      error: null,
      isRetrying: false,
      retryCount: 0,
      canRetry: false,
    });
  }, []);

  const retry = useCallback(async (retryFn: () => Promise<void> | void) => {
    if (!state.error || !state.canRetry || state.isRetrying) {
      return;
    }

    const newRetryCount = state.retryCount + 1;
    
    setState(prev => ({
      ...prev,
      isRetrying: true,
      retryCount: newRetryCount,
    }));

    onRetry?.(newRetryCount);

    try {
      // Wait for retry delay
      const delay = getRetryDelay(newRetryCount);
      await new Promise(resolve => setTimeout(resolve, delay));

      // Execute retry function
      await retryFn();

      // Success - clear error
      clearError();
    } catch (retryError) {
      const newCanRetry = newRetryCount < maxRetries && isRetryableError(state.error);
      
      setState(prev => ({
        ...prev,
        isRetrying: false,
        retryCount: newRetryCount,
        canRetry: newCanRetry,
      }));

      if (!newCanRetry) {
        onMaxRetriesReached?.(state.error);
      }
    }
  }, [state.error, state.canRetry, state.isRetrying, state.retryCount, maxRetries, onRetry, onMaxRetriesReached, clearError]);

  const getDisplayError = useCallback(() => {
    if (!state.error) return null;
    return formatErrorForDisplay(state.error);
  }, [state.error]);

  return {
    ...state,
    setError,
    clearError,
    retry,
    getDisplayError,
  };
}

/**
 * Hook for handling async operations with error handling
 */
export function useAsyncOperation<T = any>(options: UseErrorHandlerOptions = {}) {
  const errorHandler = useErrorHandler(options);
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<T | null>(null);

  const execute = useCallback(async (
    operation: () => Promise<T>,
    step: string,
    userId?: string
  ): Promise<T | null> => {
    setIsLoading(true);
    errorHandler.clearError();

    try {
      const result = await operation();
      setData(result);
      return result;
    } catch (error) {
      errorHandler.setError(error, step, userId);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [errorHandler]);

  const executeWithRetry = useCallback(async (
    operation: () => Promise<T>,
    step: string,
    userId?: string
  ): Promise<T | null> => {
    const result = await execute(operation, step, userId);
    
    if (!result && errorHandler.canRetry) {
      return new Promise((resolve) => {
        errorHandler.retry(async () => {
          const retryResult = await execute(operation, step, userId);
          resolve(retryResult);
        });
      });
    }

    return result;
  }, [execute, errorHandler]);

  return {
    ...errorHandler,
    isLoading,
    data,
    execute,
    executeWithRetry,
  };
}