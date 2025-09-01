import { Component, ErrorInfo, ReactNode } from 'react';
import { ErrorState } from './types';

interface Props {
  children: ReactNode;
  onError?: (error: ErrorState) => void;
}

interface State {
  hasError: boolean;
  error: ErrorState | null;
}

class EnrollmentErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state to show error UI
    const errorState: ErrorState = {
      type: 'system',
      message: 'Something went wrong during enrollment. Please try again.',
      code: error.name,
      retryable: true,
      context: {
        originalMessage: error.message,
        stack: error.stack
      }
    };

    return {
      hasError: true,
      error: errorState
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error details for debugging
    console.error('Enrollment Error Boundary caught an error:', error, errorInfo);
    
    const errorState: ErrorState = {
      type: 'system',
      message: 'Something went wrong during enrollment. Please try again.',
      code: error.name,
      retryable: true,
      context: {
        originalMessage: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack
      }
    };

    // Call the onError callback if provided
    if (this.props.onError) {
      this.props.onError(errorState);
    }
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null
    });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4 shadow-xl">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4">
                <svg 
                  className="w-6 h-6 text-red-600" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" 
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Enrollment Error
                </h3>
                <p className="text-sm text-gray-600">
                  Error Code: {this.state.error.code || 'UNKNOWN'}
                </p>
              </div>
            </div>
            
            <p className="text-gray-700 mb-6">
              {this.state.error.message}
            </p>
            
            <div className="flex space-x-3">
              {this.state.error.retryable && (
                <button
                  onClick={this.handleRetry}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Try Again
                </button>
              )}
              <button
                onClick={() => window.location.reload()}
                className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Refresh Page
              </button>
            </div>
            
            {import.meta.env.DEV && this.state.error.context && (
              <details className="mt-4 text-xs">
                <summary className="cursor-pointer text-gray-500">
                  Debug Information
                </summary>
                <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">
                  {JSON.stringify(this.state.error.context, null, 2)}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default EnrollmentErrorBoundary;