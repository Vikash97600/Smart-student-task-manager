import { Component } from 'react';

class ErrorBoundary extends Component {
  state = { hasError: false, error: null, errorInfo: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--surface-bg)' }}>
          <div className="max-w-lg w-full glass rounded-2xl p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-red-500/20 to-orange-500/20 flex items-center justify-center text-3xl">
              ⚠️
            </div>
            <h1 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
              Something went wrong
            </h1>
            <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
              The application encountered an unexpected error. Please refresh the page to continue.
            </p>
            <details className="mb-6 text-left">
              <summary className="cursor-pointer text-sm font-medium" style={{ color: 'var(--text-tertiary)' }}>
                Technical Details
              </summary>
              <pre className="mt-2 text-xs p-3 rounded-xl overflow-auto max-h-48" style={{
                background: 'rgba(239,68,68,0.08)',
                color: '#ef4444',
              }}>
                {this.state.error?.toString()}
                {this.state.errorInfo?.componentStack}
              </pre>
            </details>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-medium shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
