// Recovery prompt component for enrollment state

import React from 'react';
import { EnrollmentStep } from '../types';

export interface RecoveryPromptProps {
  show: boolean;
  stateAge: number | null;
  lastStep: EnrollmentStep | null;
  onRecover: () => void;
  onDiscard: () => void;
  className?: string;
}

const STEP_LABELS: Record<EnrollmentStep, string> = {
  auth: 'Phone Authentication',
  court: 'Court Details',
  pricing: 'Plan Selection',
  payment: 'Payment',
  confirmation: 'Confirmation',
};

export const RecoveryPrompt: React.FC<RecoveryPromptProps> = ({
  show,
  stateAge,
  lastStep,
  onRecover,
  onDiscard,
  className = '',
}) => {
  if (!show) return null;

  const formatAge = (ageInMinutes: number | null): string => {
    if (!ageInMinutes) return 'recently';
    
    if (ageInMinutes < 1) return 'less than a minute ago';
    if (ageInMinutes < 60) return `${Math.round(ageInMinutes)} minute${Math.round(ageInMinutes) !== 1 ? 's' : ''} ago`;
    
    const hours = Math.floor(ageInMinutes / 60);
    return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
  };

  const getStepLabel = (step: EnrollmentStep | null): string => {
    return step ? STEP_LABELS[step] : 'enrollment process';
  };

  return (
    <div className={`fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 ${className}`}>
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <div className="flex items-center justify-center w-12 h-12 mx-auto bg-blue-100 rounded-full">
            <svg
              className="w-6 h-6 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              ></path>
            </svg>
          </div>
          
          <div className="mt-5 text-center">
            <h3 className="text-lg font-medium text-gray-900">
              Resume Your Enrollment?
            </h3>
            
            <div className="mt-3 text-sm text-gray-600">
              <p>
                We found your previous enrollment session from{' '}
                <span className="font-medium">{formatAge(stateAge)}</span>.
              </p>
              
              {lastStep && (
                <p className="mt-2">
                  You were at: <span className="font-medium">{getStepLabel(lastStep)}</span>
                </p>
              )}
              
              <p className="mt-3">
                Would you like to continue where you left off or start fresh?
              </p>
            </div>
            
            <div className="mt-6 flex space-x-3">
              <button
                type="button"
                onClick={onRecover}
                className="flex-1 inline-flex justify-center items-center px-4 py-2 bg-blue-600 border border-transparent rounded-md font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                Continue
              </button>
              
              <button
                type="button"
                onClick={onDiscard}
                className="flex-1 inline-flex justify-center items-center px-4 py-2 bg-white border border-gray-300 rounded-md font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
                Start Fresh
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export interface SessionTimeoutWarningProps {
  show: boolean;
  timeRemaining: number;
  onExtend: () => void;
  onContinue: () => void;
  className?: string;
}

export const SessionTimeoutWarning: React.FC<SessionTimeoutWarningProps> = ({
  show,
  timeRemaining,
  onExtend,
  onContinue,
  className = '',
}) => {
  if (!show) return null;

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    if (minutes > 0) {
      return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    return `${remainingSeconds} seconds`;
  };

  return (
    <div className={`fixed top-4 right-4 z-50 max-w-sm w-full bg-yellow-50 border border-yellow-200 rounded-lg shadow-lg ${className}`}>
      <div className="p-4">
        <div className="flex items-start">
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
          <div className="ml-3 flex-1">
            <h3 className="text-sm font-medium text-yellow-800">
              Session Expiring Soon
            </h3>
            <div className="mt-2 text-sm text-yellow-700">
              <p>
                Your enrollment session will expire in{' '}
                <span className="font-medium">{formatTime(timeRemaining)}</span>.
              </p>
            </div>
            <div className="mt-4 flex space-x-2">
              <button
                type="button"
                onClick={onExtend}
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-yellow-800 bg-yellow-100 hover:bg-yellow-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
              >
                Extend Session
              </button>
              <button
                type="button"
                onClick={onContinue}
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-yellow-800 bg-transparent hover:bg-yellow-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};