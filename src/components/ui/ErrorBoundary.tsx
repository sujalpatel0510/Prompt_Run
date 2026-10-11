import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

/**
 * Prevents a render error in one section from blanking the entire application.
 * Keeps the failure contained and offers a non-destructive recovery path.
 */
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    // Surface to the console for diagnostics without leaking data to the UI.
    console.error('KuberZ render error:', error);
  }

  private handleRetry = () => this.setState({ hasError: false });

  render() {
    if (this.state.hasError) {
      return (
        <div className="glass-panel-elevated rounded-3xl p-8 text-center border border-rose-500/30">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-400 mb-4">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-white mb-1">Something went wrong in this section</h2>
          <p className="text-sm text-slate-400 mb-5">
            Your saved budget data is safe. You can try rendering this section again.
          </p>
          <button onClick={this.handleRetry} className="btn-primary">
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
