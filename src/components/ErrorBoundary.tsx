'use client';

import React, { Component, ReactNode } from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo,
    });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      const { fallbackTitle = 'Something went wrong' } = this.props;
      const { error, errorInfo } = this.state;

      return (
        <div className="min-h-screen bg-linear-to-br from-purple-900 via-black to-purple-950 flex items-center justify-center p-4">
          <div className="bg-black/40 backdrop-blur-sm border border-purple-500/30 rounded-2xl p-8 max-w-2xl w-full shadow-2xl">
            {/* Error Icon */}
            <div className="flex items-center justify-center mb-6">
              <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center">
                <AlertCircle className="w-12 h-12 text-red-400" />
              </div>
            </div>

            {/* Title */}
            <h1 className="text-3xl font-bold text-white text-center mb-4">
              {fallbackTitle}
            </h1>

            {/* Description */}
            <p className="text-gray-300 text-center mb-6">
              We encountered an unexpected error. This has been logged and we&apos;ll look into it.
            </p>

            {/* Error Details (Development mode) */}
            {process.env.NODE_ENV === 'development' && error && (
              <div className="bg-red-950/30 border border-red-500/30 rounded-lg p-4 mb-6 max-h-64 overflow-auto">
                <p className="text-red-300 font-mono text-sm mb-2">
                  <strong>Error:</strong> {error.toString()}
                </p>
                {errorInfo && (
                  <details className="mt-2">
                    <summary className="text-red-300 cursor-pointer hover:text-red-200">
                      Component Stack
                    </summary>
                    <pre className="text-red-200 text-xs mt-2 whitespace-pre-wrap">
                      {errorInfo.componentStack}
                    </pre>
                  </details>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={this.handleReset}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Try Again
              </button>
              <button
                onClick={this.handleGoHome}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                <Home className="w-4 h-4" />
                Go Home
              </button>
            </div>

            {/* Help Text */}
            <p className="text-gray-400 text-sm text-center mt-6">
              If this problem persists, try refreshing the page or clearing your browser cache.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
export default ErrorBoundary;
