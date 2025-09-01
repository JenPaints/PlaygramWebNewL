// Loading state components for enrollment system

import React from 'react';

export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'white' | 'gray';
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  color = 'primary',
  className = '',
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
  };

  const colorClasses = {
    primary: 'text-blue-600',
    white: 'text-white',
    gray: 'text-gray-400',
  };

  return (
    <svg
      className={`animate-spin ${sizeClasses[size]} ${colorClasses[color]} ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      ></circle>
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      ></path>
    </svg>
  );
};

export interface LoadingButtonProps {
  isLoading: boolean;
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  type?: 'button' | 'submit' | 'reset';
}

export const LoadingButton: React.FC<LoadingButtonProps> = ({
  isLoading,
  children,
  onClick,
  disabled = false,
  variant = 'primary',
  size = 'md',
  className = '',
  type = 'button',
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-200';
  
  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 disabled:bg-blue-300',
    secondary: 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500 disabled:bg-gray-300',
    outline: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-400',
  };

  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  const isDisabled = disabled || isLoading;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${isDisabled ? 'cursor-not-allowed' : 'cursor-pointer'} ${className}`}
    >
      {isLoading && (
        <LoadingSpinner
          size="sm"
          color={variant === 'outline' ? 'gray' : 'white'}
          className="mr-2"
        />
      )}
      {children}
    </button>
  );
};

export interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
  stepLabels?: string[];
  className?: string;
}

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  currentStep,
  totalSteps,
  stepLabels = [],
  className = '',
}) => {
  const progress = (currentStep / totalSteps) * 100;

  return (
    <div className={`w-full ${className}`}>
      <div className="flex justify-between text-xs text-gray-600 mb-2">
        <span>Step {currentStep} of {totalSteps}</span>
        <span>{Math.round(progress)}% Complete</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      {stepLabels.length > 0 && (
        <div className="flex justify-between mt-2">
          {stepLabels.map((label, index) => (
            <div
              key={index}
              className={`text-xs ${
                index < currentStep
                  ? 'text-blue-600 font-medium'
                  : index === currentStep
                  ? 'text-gray-900 font-medium'
                  : 'text-gray-400'
              }`}
            >
              {label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export interface LoadingOverlayProps {
  isVisible: boolean;
  message?: string;
  children?: React.ReactNode;
  className?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  isVisible,
  message = 'Loading...',
  children,
  className = '',
}) => {
  if (!isVisible) return <>{children}</>;

  return (
    <div className={`relative ${className}`}>
      {children}
      <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
        <div className="text-center">
          <LoadingSpinner size="lg" className="mx-auto mb-4" />
          <p className="text-gray-600 text-sm">{message}</p>
        </div>
      </div>
    </div>
  );
};

export interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  className?: string;
  variant?: 'text' | 'rectangular' | 'circular';
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = '1rem',
  className = '',
  variant = 'text',
}) => {
  const baseClasses = 'animate-pulse bg-gray-200';
  
  const variantClasses = {
    text: 'rounded',
    rectangular: 'rounded-md',
    circular: 'rounded-full',
  };

  const style = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
  };

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      style={style}
    />
  );
};

export interface LoadingCardProps {
  title?: string;
  lines?: number;
  showAvatar?: boolean;
  className?: string;
}

export const LoadingCard: React.FC<LoadingCardProps> = ({
  title,
  lines = 3,
  showAvatar = false,
  className = '',
}) => {
  return (
    <div className={`bg-white p-6 rounded-lg border border-gray-200 ${className}`}>
      {title && (
        <div className="mb-4">
          <Skeleton width="60%" height="1.5rem" />
        </div>
      )}
      <div className="space-y-3">
        {showAvatar && (
          <div className="flex items-center space-x-3">
            <Skeleton variant="circular" width={40} height={40} />
            <div className="flex-1">
              <Skeleton width="40%" height="1rem" />
            </div>
          </div>
        )}
        {Array.from({ length: lines }).map((_, index) => (
          <Skeleton
            key={index}
            width={index === lines - 1 ? '75%' : '100%'}
            height="1rem"
          />
        ))}
      </div>
    </div>
  );
};

export interface RetryButtonProps {
  onRetry: () => void;
  isRetrying?: boolean;
  retryCount?: number;
  maxRetries?: number;
  disabled?: boolean;
  className?: string;
}

export const RetryButton: React.FC<RetryButtonProps> = ({
  onRetry,
  isRetrying = false,
  retryCount = 0,
  maxRetries = 3,
  disabled = false,
  className = '',
}) => {
  const canRetry = retryCount < maxRetries && !disabled;

  return (
    <LoadingButton
      isLoading={isRetrying}
      onClick={onRetry}
      disabled={!canRetry}
      variant="outline"
      className={className}
    >
      {isRetrying ? 'Retrying...' : 'Try Again'}
      {retryCount > 0 && ` (${retryCount}/${maxRetries})`}
    </LoadingButton>
  );
};

export interface NetworkStatusProps {
  isOnline: boolean;
  className?: string;
}

export const NetworkStatus: React.FC<NetworkStatusProps> = ({
  isOnline,
  className = '',
}) => {
  if (isOnline) return null;

  return (
    <div className={`bg-yellow-50 border border-yellow-200 rounded-md p-3 ${className}`}>
      <div className="flex">
        <div className="flex-shrink-0">
          <svg
            className="h-5 w-5 text-yellow-400"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-yellow-800">
            No Internet Connection
          </h3>
          <div className="mt-2 text-sm text-yellow-700">
            <p>Please check your internet connection and try again.</p>
          </div>
        </div>
      </div>
    </div>
  );
};