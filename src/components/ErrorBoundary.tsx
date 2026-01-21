
import React, { Component, ErrorInfo, ReactNode } from 'react';
import ErrorPage from './ErrorPage';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error("Uncaught error:", error, errorInfo);
    // Here you could send error reports to a monitoring service
    // like Sentry, LogRocket, etc.
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <ErrorPage 
          title="Something went wrong" 
          message={this.state.error?.message || "An unexpected error occurred. Please try refreshing the page."} 
          backgroundColor="from-red-50 to-white"
        />
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
