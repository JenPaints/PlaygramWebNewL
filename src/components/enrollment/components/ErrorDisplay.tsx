// Error display component for enrollment system

import React from 'react';
import { EnrollmentError, formatErrorForDisplay } from '../utils/errorHandling';

export interface ErrorDisplayProps {
  error: EnrollmentError | null;
  onRetry?: () => void;
  onDismiss?: () => void;
  isRetrying?: boolean;
  retryCount?: number;
  maxRetries?: number;
  className?: string;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  error,
  onRetry,
  onDismiss,
  isRetrying = false,
  retryCount = 0,
  maxRetries = 3,
  className = '',
}) => {
  if (!error) return null;

  const displayError = formatErrorForDisplay(error);
  const canRetry = displayError.canRetry && retryCount < maxRetries && onRetry;
  const isMaxRetriesReached = retryCount >= maxRetries;

  return (
    <div className={`bg-red-50 border border-red-200 rounded-lg p-4 ${className}`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <svg
            className="h-5 w-5 text-red-400"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-red-800">
            {displayError.title}
          </h3>
          <div className="mt-2 text-sm text-red-700">
            <p>{displayError.message}</p>
            {retryCount > 0 && (
              <p className="mt-1 text-xs text-red-600">
                Attempt {retryCount} of {maxRetries}
              </p>
            )}
            {isMaxRetriesReached && (
              <p className="mt-1 text-xs text-red-600">
                Maximum retry attempts reached. Please try again later or contact support.
              </p>
            )}
          </div>
          <div className="mt-4 flex space-x-3">
            {canRetry && (
              <button
                type="button"
                onClick={onRetry}
                disabled={isRetrying}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isRetrying ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-red-700"
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
                    Retrying...
                  </>
                ) : (
                  'Try Again'
                )}
              </button>
            )}
            {onDismiss && (
              <button
                type="button"
                onClick={onDismiss}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-transparent hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Dismiss
              </button>
            )}
          </div>
        </div>
        {onDismiss && (
          <div className="ml-auto pl-3">
            <div className="-mx-1.5 -my-1.5">
              <button
                type="button"
                onClick={onDismiss}
                className="inline-flex bg-red-50 rounded-md p-1.5 text-red-500 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-red-50 focus:ring-red-600"
              >
                <span className="sr-only">Dismiss</span>
                <svg className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Inline error display for form fields
 */
export interface InlineErrorProps {
  error: string | null;
  className?: string;
}

export const InlineError: React.FC<InlineErrorProps> = ({ error, className = '' }) => {
  if (!error) return null;

  return (
    <p className={`mt-1 text-sm text-red-600 ${className}`}>
      {error}
    </p>
  );
};

/**
 * Toast-style error notification
 */
export interface ErrorToastProps {
  error: EnrollmentError | null;
  onDismiss: () => void;
  duration?: number;
}

export const ErrorToast: React.FC<ErrorToastProps> = ({
  error,
  onDismiss,
  duration = 5000,
}) => {
  React.useEffect(() => {
    if (error && duration > 0) {
      const timer = setTimeout(onDismiss, duration);
      return () => clearTimeout(timer);
    }
  }, [error, duration, onDismiss]);

  if (!error) return null;

  const displayError = formatErrorForDisplay(error);

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm w-full bg-white shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden">
      <div className="p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg
              className="h-6 w-6 text-red-400"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
              />
            </svg>
          </div>
          <div className="ml-3 w-0 flex-1 pt-0.5">
            <p className="text-sm font-medium text-gray-900">{displayError.title}</p>
            <p className="mt-1 text-sm text-gray-500">{displayError.message}</p>
          </div>
          <div className="ml-4 flex-shrink-0 flex">
            <button
              className="bg-white rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              onClick={onDismiss}
            >
              <span className="sr-only">Close</span>
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};