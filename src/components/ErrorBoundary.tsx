import React, { Component, ErrorInfo, ReactNode } from 'react';
import Button from './Button';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
        };
    }

    static getDerivedStateFromError(error: Error): Partial<State> {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
        this.setState({
            error,
            errorInfo,
        });

        // You can log to an error reporting service here
        // e.g., Sentry, LogRocket, etc.
    }

    handleReset = (): void => {
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null,
        });
        // Optionally reload the page
        window.location.href = '/';
    };

    render(): ReactNode {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-bg-primary via-bg-secondary to-bg-tertiary p-4">
                    <div className="liquid-glass max-w-2xl w-full p-8 rounded-2xl border border-glass-border">
                        {/* Error Icon */}
                        <div className="flex justify-center mb-6">
                            <div className="w-20 h-20 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center">
                                <svg
                                    className="w-10 h-10 text-red-500"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                                    />
                                </svg>
                            </div>
                        </div>

                        {/* Error Message */}
                        <h1 className="text-3xl font-bold text-white text-center mb-4">
                            Oops! Something went wrong
                        </h1>
                        <p className="text-text-secondary text-center mb-6">
                            We're sorry for the inconvenience. An unexpected error has occurred.
                        </p>

                        {/* Error Details (Development Only) */}
                        {process.env.NODE_ENV === 'development' && this.state.error && (
                            <div className="mb-6 p-4 bg-bg-tertiary/50 rounded-lg border border-glass-border">
                                <h2 className="text-sm font-semibold text-white mb-2">Error Details:</h2>
                                <pre className="text-xs text-red-400 overflow-x-auto whitespace-pre-wrap">
                                    {this.state.error.toString()}
                                </pre>
                                {this.state.errorInfo && (
                                    <>
                                        <h2 className="text-sm font-semibold text-white mt-4 mb-2">
                                            Component Stack:
                                        </h2>
                                        <pre className="text-xs text-text-secondary overflow-x-auto whitespace-pre-wrap">
                                            {this.state.errorInfo.componentStack}
                                        </pre>
                                    </>
                                )}
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <Button variant="primary" onClick={this.handleReset}>
                                <svg
                                    className="w-5 h-5 mr-2"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                                    />
                                </svg>
                                Go to Home
                            </Button>
                            <Button variant="secondary" onClick={() => window.location.reload()}>
                                <svg
                                    className="w-5 h-5 mr-2"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                                    />
                                </svg>
                                Reload Page
                            </Button>
                        </div>

                        {/* Help Text */}
                        <p className="text-xs text-text-secondary text-center mt-6">
                            If this problem persists, please contact support or report an issue on GitHub.
                        </p>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
