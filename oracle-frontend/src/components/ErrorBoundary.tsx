// src/components/ErrorBoundary.tsx
import React from 'react';

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('Uncaught error in UI:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center h-screen bg-gradient-to-br from-indigo-50 via-pink-50 to-yellow-50">
          <div className="text-center p-6 bg-white rounded shadow">
            <h1 className="text-2xl font-bold mb-4">Something went wrong.</h1>
            <p className="mb-4">Please refresh or try again later.</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-soullab-aether text-white rounded"
            >
              Reload
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
