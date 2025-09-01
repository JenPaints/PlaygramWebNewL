// Network-aware wrapper component for enrollment steps

import React, { useState, useEffect } from 'react';
import { useNetworkState, useTimeout } from '../hooks/useNetworkState';
import { useErrorHandler } from '../hooks/useErrorHandler';
import { LoadingOverlay, NetworkStatus, RetryButton } from './LoadingStates';
import { ErrorDisplay } from './ErrorDisplay';
import { ERROR_CODES } from '../utils/errorHandling';

export interface NetworkAwareWrapperProps {
  children: React.ReactNode;
  isLoading?: boolean;
  loadingMessage?: string;
  requireOnline?: boolean;
  showNetworkStatus?: boolean;
  onRetry?: () => void;
  className?: string;
}

export const NetworkAwareWrapper: React.FC<NetworkAwareWrapperProps> = ({
  children,
  isLoading = false,
  loadingMessage = 'Loading...',
  requireOnline = true,
  showNetworkStatus = true,
  onRetry,
  className = '',
}) => {
  const networkState = useNetworkState({
    onOffline: () => {
      if (requireOnline) {
        errorHandler.setError(
          { name: 'NetworkError', message: 'Connection lost' },
          'network-check'
        );
      }
    },
    onOnline: () => {
      errorHandler.clearError();
    },
  });

  const errorHandler = useErrorHandler({
    maxRetries: 3,
    onMaxRetriesReached: (error) => {
      console.error('Max retries reached:', error);
    },
  });

  const isOfflineError = errorHandler.error?.code === ERROR_CODES.NETWORK_UNAVAILABLE;
  const showOfflineState = requireOnline && !networkState.isOnline;
  const showError = errorHandler.error && !isOfflineError;

  return (
    <div className={`relative ${className}`}>
      {showNetworkStatus && <NetworkStatus isOnline={networkState.isOnline} className="mb-4" />}
      
      {showError && (
        <ErrorDisplay
          error={errorHandler.error}
          onRetry={onRetry || (() => errorHandler.retry(async () => {}))}
          onDismiss={errorHandler.clearError}
          isRetrying={errorHandler.isRetrying}
          retryCount={errorHandler.retryCount}
          className="mb-4"
        />
      )}

      {showOfflineState ? (
        <div className="text-center py-8">
          <div className="text-gray-400 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Internet Connection</h3>
          <p className="text-gray-600 mb-4">Please check your connection and try again.</p>
          {onRetry && (
            <RetryButton
              onRetry={onRetry}
              isRetrying={false}
              className="mx-auto"
            />
          )}
        </div>
      ) : (
        <LoadingOverlay isVisible={isLoading} message={loadingMessage}>
          {children}
        </LoadingOverlay>
      )}
    </div>
  );
};

export interface ApiCallWrapperProps<T> {
  children: (data: T | null, loading: boolean, error: any, retry: () => void) => React.ReactNode;
  apiCall: () => Promise<T>;
  dependencies?: any[];
  requireOnline?: boolean;
  timeoutMs?: number;
  maxRetries?: number;
  loadingComponent?: React.ReactNode;
  errorComponent?: (error: any, retry: () => void) => React.ReactNode;
}

/**
 * Wrapper component for API calls with loading, error, and retry handling
 */
export function ApiCallWrapper<T>({
  children,
  apiCall,
  dependencies = [],
  requireOnline = true,
  timeoutMs = 30000,
  maxRetries = 3,
  loadingComponent,
  errorComponent,
}: ApiCallWrapperProps<T>) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const networkState = useNetworkState();
  const timeout = useTimeout({ timeout: timeoutMs });
  const errorHandler = useErrorHandler({ maxRetries });

  const executeApiCall = async () => {
    if (requireOnline && !networkState.isOnline) {
      errorHandler.setError(
        { name: 'NetworkError', message: 'No internet connection' },
        'api-call'
      );
      return;
    }

    setIsLoading(true);
    errorHandler.clearError();

    try {
      const result = await timeout.createTimeoutPromise(apiCall());
      setData(result);
    } catch (error) {
      errorHandler.setError(error, 'api-call');
    } finally {
      setIsLoading(false);
    }
  };

  const retry = () => {
    if (errorHandler.canRetry) {
      errorHandler.retry(executeApiCall);
    } else {
      executeApiCall();
    }
  };

  useEffect(() => {
    executeApiCall();
  }, dependencies);

  // Show loading component if provided
  if (isLoading && loadingComponent) {
    return <>{loadingComponent}</>;
  }

  // Show error component if provided
  if (errorHandler.error && errorComponent) {
    return <>{errorComponent(errorHandler.error, retry)}</>;
  }

  return <>{children(data, isLoading, errorHandler.error, retry)}</>;
}

export interface StepWrapperProps {
  children: React.ReactNode;
  stepName: string;
  isActive: boolean;
  isLoading?: boolean;
  error?: any;
  onRetry?: () => void;
  className?: string;
}

/**
 * Wrapper for individual enrollment steps with loading and error handling
 */
export const StepWrapper: React.FC<StepWrapperProps> = ({
  children,
  stepName,
  isActive,
  isLoading = false,
  error,
  onRetry,
  className = '',
}) => {
  if (!isActive) return null;

  return (
    <div className={`step-wrapper ${className}`}>
      <NetworkAwareWrapper
        isLoading={isLoading}
        loadingMessage={`Processing ${stepName}...`}
        onRetry={onRetry}
        className="min-h-[400px]"
      >
        {children}
      </NetworkAwareWrapper>
    </div>
  );
};