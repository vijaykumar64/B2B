import React from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';
import { Button } from './ui/button';

interface ErrorFallbackProps {
  error: Error | null;
  onReset: () => void;
}

function ErrorFallback({ error, onReset }: ErrorFallbackProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="h-16 w-16 rounded-2xl bg-red-50 flex items-center justify-center mx-auto">
          <AlertTriangle className="h-8 w-8 text-red-500" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-black text-foreground">Something went wrong</h1>
          <p className="text-muted-foreground font-medium">
            An unexpected error occurred. You can try reloading to recover.
          </p>
          {error?.message && (
            <p className="text-xs font-mono text-muted-foreground bg-muted rounded-lg px-3 py-2 mt-3 text-left break-all">
              {error.message}
            </p>
          )}
        </div>
        <div className="flex gap-3 justify-center">
          <Button onClick={onReset} variant="outline" className="gap-2">
            <RotateCcw className="h-4 w-4" />
            Try again
          </Button>
          <Button onClick={() => window.location.reload()} className="gap-2">
            Reload page
          </Button>
        </div>
      </div>
    </div>
  );
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info.componentStack);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? (
        <ErrorFallback error={this.state.error} onReset={this.handleReset} />
      );
    }
    return this.props.children;
  }
}
