// ─────────────────────────────────────────────
//  VesselOps — Error State Component
//  Drop this file into: src/components/ErrorState.tsx
// ─────────────────────────────────────────────

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export default function ErrorState({
  message = 'Failed to load data.',
  onRetry,
}: ErrorStateProps) {
  return (
    <div
      style={{
        padding: '3rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        color: 'var(--mist)',
        textAlign: 'center',
      }}
    >
      <div style={{ fontSize: '2.2rem', opacity: 0.5 }}>⚠️</div>
      <div
        style={{
          fontFamily: "'Syne', sans-serif",
          fontSize: 15,
          fontWeight: 600,
          color: 'var(--fog)',
        }}
      >
        Something went wrong
      </div>
      <div style={{ fontSize: 13, maxWidth: 320, lineHeight: 1.5 }}>{message}</div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="btn btn-ghost"
          style={{ marginTop: 6, fontSize: 13 }}
        >
          ↻ Try again
        </button>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
//  ErrorBoundary — catches unexpected crashes
//  Wrap your <Router> in App.tsx with this.
//
//  Usage in App.tsx:
//    import ErrorBoundary from './components/ErrorState';  ← import the boundary too
//    <ErrorBoundary><BrowserRouter>...</BrowserRouter></ErrorBoundary>
// ─────────────────────────────────────────────

import { Component, type ReactNode } from 'react';

interface BoundaryState { hasError: boolean; message: string }

export class ErrorBoundary extends Component<{ children: ReactNode }, BoundaryState> {
  state: BoundaryState = { hasError: false, message: '' };

  static getDerivedStateFromError(err: Error): BoundaryState {
    return { hasError: true, message: err.message || 'Unexpected error.' };
  }

  handleReset = () => {
    this.setState({ hasError: false, message: '' });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--navy)',
          }}
        >
          <ErrorState
            message={this.state.message || 'The application crashed unexpectedly. Please reload.'}
            onRetry={this.handleReset}
          />
        </div>
      );
    }
    return this.props.children;
  }
}
