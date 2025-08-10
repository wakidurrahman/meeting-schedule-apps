import React from 'react';

/**
 * Error Boundary
 * @param {JSX.Element} children - The children to render
 * @returns {JSX.Element} The error boundary
 */
type ErrorBoundaryProps = { children: React.ReactNode };
type ErrorBoundaryState = { hasError: boolean; error?: Error };

/**
 * Error Boundary
 * @param {JSX.Element} children - The children to render
 * @returns {JSX.Element} The error boundary
 */
export default class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  /**
   * State
   */
  state: ErrorBoundaryState = { hasError: false };

  /**
   * Get derived state from error
   * @param {Error} error - The error
   * @returns {ErrorBoundaryState} The error boundary state
   */
  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  /**
   * Component did catch
   * @param {Error} error - The error
   * @param {React.ErrorInfo} errorInfo - The error info
   */
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    // Log to monitoring here if desired
    // eslint-disable-next-line no-console
    console.error('ErrorBoundary caught an error', error, errorInfo);
  }

  /**
   * Render
   * @returns {React.ReactNode} The render
   */
  render(): React.ReactNode {
    if (this.state.hasError) {
      return (
        <div className="container py-5">
          <div className="alert alert-danger">
            <h4 className="alert-heading">Something went wrong.</h4>
            <p className="text-wrap py-2">
              Please refresh the page. If the issue persists, contact support.
            </p>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
