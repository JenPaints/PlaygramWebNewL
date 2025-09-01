// Network state management hook

import { useState, useEffect, useCallback } from 'react';

export interface NetworkState {
  isOnline: boolean;
  isSlowConnection: boolean;
  connectionType: string;
  effectiveType: string;
}

export interface UseNetworkStateOptions {
  onOnline?: () => void;
  onOffline?: () => void;
  onSlowConnection?: () => void;
}

/**
 * Hook for monitoring network state
 */
export function useNetworkState(options: UseNetworkStateOptions = {}) {
  const { onOnline, onOffline, onSlowConnection } = options;

  const [networkState, setNetworkState] = useState<NetworkState>(() => {
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    
    return {
      isOnline: navigator.onLine,
      isSlowConnection: connection ? connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g' : false,
      connectionType: connection?.type || 'unknown',
      effectiveType: connection?.effectiveType || 'unknown',
    };
  });

  const updateNetworkState = useCallback(() => {
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    const isOnline = navigator.onLine;
    const isSlowConnection = connection ? connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g' : false;

    setNetworkState(prev => {
      const newState = {
        isOnline,
        isSlowConnection,
        connectionType: connection?.type || 'unknown',
        effectiveType: connection?.effectiveType || 'unknown',
      };

      // Trigger callbacks if state changed
      if (prev.isOnline !== isOnline) {
        if (isOnline) {
          onOnline?.();
        } else {
          onOffline?.();
        }
      }

      if (!prev.isSlowConnection && isSlowConnection) {
        onSlowConnection?.();
      }

      return newState;
    });
  }, [onOnline, onOffline, onSlowConnection]);

  useEffect(() => {
    const handleOnline = () => updateNetworkState();
    const handleOffline = () => updateNetworkState();
    const handleConnectionChange = () => updateNetworkState();

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    if (connection) {
      connection.addEventListener('change', handleConnectionChange);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if (connection) {
        connection.removeEventListener('change', handleConnectionChange);
      }
    };
  }, [updateNetworkState]);

  return networkState;
}

export interface UseTimeoutOptions {
  timeout?: number;
  onTimeout?: () => void;
}

/**
 * Hook for handling API call timeouts
 */
export function useTimeout(options: UseTimeoutOptions = {}) {
  const { timeout = 30000, onTimeout } = options;
  const [isTimedOut, setIsTimedOut] = useState(false);

  const createTimeoutPromise = useCallback(<T>(promise: Promise<T>): Promise<T> => {
    setIsTimedOut(false);

    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => {
        setIsTimedOut(true);
        onTimeout?.();
        reject(new Error('Request timed out'));
      }, timeout);
    });

    return Promise.race([promise, timeoutPromise]);
  }, [timeout, onTimeout]);

  const resetTimeout = useCallback(() => {
    setIsTimedOut(false);
  }, []);

  return {
    isTimedOut,
    createTimeoutPromise,
    resetTimeout,
  };
}

export interface UseRetryOptions {
  maxRetries?: number;
  retryDelay?: number;
  backoffMultiplier?: number;
  maxDelay?: number;
  retryCondition?: (error: any) => boolean;
  onRetry?: (attempt: number, error: any) => void;
  onMaxRetriesReached?: (error: any) => void;
}

/**
 * Hook for handling retry logic with exponential backoff
 */
export function useRetry(options: UseRetryOptions = {}) {
  const {
    maxRetries = 3,
    retryDelay = 1000,
    backoffMultiplier = 2,
    maxDelay = 30000,
    retryCondition = () => true,
    onRetry,
    onMaxRetriesReached,
  } = options;

  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);

  const calculateDelay = useCallback((attempt: number): number => {
    const delay = retryDelay * Math.pow(backoffMultiplier, attempt - 1);
    return Math.min(delay, maxDelay);
  }, [retryDelay, backoffMultiplier, maxDelay]);

  const executeWithRetry = useCallback(async <T>(
    operation: () => Promise<T>
  ): Promise<T> => {
    let lastError: any;
    
    for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
      try {
        setRetryCount(attempt - 1);
        
        if (attempt > 1) {
          setIsRetrying(true);
          const delay = calculateDelay(attempt - 1);
          await new Promise(resolve => setTimeout(resolve, delay));
          onRetry?.(attempt - 1, lastError);
        }

        const result = await operation();
        setIsRetrying(false);
        setRetryCount(0);
        return result;
      } catch (error) {
        lastError = error;
        setIsRetrying(false);

        // If this is the last attempt or error is not retryable, throw
        if (attempt > maxRetries || !retryCondition(error)) {
          if (attempt > maxRetries) {
            onMaxRetriesReached?.(error);
          }
          setRetryCount(0);
          throw error;
        }
      }
    }

    throw lastError;
  }, [maxRetries, calculateDelay, retryCondition, onRetry, onMaxRetriesReached]);

  const reset = useCallback(() => {
    setRetryCount(0);
    setIsRetrying(false);
  }, []);

  return {
    retryCount,
    isRetrying,
    executeWithRetry,
    reset,
  };
}

/**
 * Hook for handling network-aware operations
 */
export function useNetworkAwareOperation() {
  const networkState = useNetworkState();
  const timeout = useTimeout();
  const retry = useRetry({
    retryCondition: (error) => {
      // Retry on network errors but not on validation errors
      return error.name === 'NetworkError' || 
             error.message?.includes('timeout') ||
             error.message?.includes('fetch');
    },
  });

  const execute = useCallback(async <T>(
    operation: () => Promise<T>,
    options: {
      requireOnline?: boolean;
      timeoutMs?: number;
      skipRetry?: boolean;
    } = {}
  ): Promise<T> => {
    const { requireOnline = true, timeoutMs = 30000, skipRetry = false } = options;

    // Check network state
    if (requireOnline && !networkState.isOnline) {
      throw new Error('No internet connection available');
    }

    // Create timeout wrapper
    const timeoutWrapper = timeout.createTimeoutPromise;
    
    // Execute with or without retry
    if (skipRetry) {
      return await timeoutWrapper(operation());
    } else {
      return await retry.executeWithRetry(() => timeoutWrapper(operation()));
    }
  }, [networkState.isOnline, timeout.createTimeoutPromise, retry.executeWithRetry]);

  return {
    ...networkState,
    ...timeout,
    ...retry,
    execute,
  };
}