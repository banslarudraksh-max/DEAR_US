import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Heart, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in Dear Us vault:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: undefined });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-[60vh] flex items-center justify-center p-6 text-center font-sans">
          <div className="max-w-md rounded-2xl border border-[#DFBF99]/30 bg-[#1B0B1E]/90 p-8 shadow-2xl backdrop-blur-xl">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#7D2146]/50 border border-[#DFBF99]/40 text-[#DFBF99]">
              <Heart className="h-6 w-6 fill-current opacity-80" />
            </div>
            <h2 className="font-serif text-2xl font-normal text-[#FAF7F2] mb-2">
              A Moment of Quiet
            </h2>
            <p className="text-xs sm:text-sm text-[#C9B7C3] leading-relaxed mb-6 font-normal">
              We encountered a gentle pause while retrieving your memory vault. Your preserved moments and letters remain safe.
            </p>
            <button
              onClick={this.handleReset}
              className="inline-flex items-center gap-2 rounded-full border border-[#DFBF99]/40 bg-[#7D2146] px-6 py-2.5 text-xs font-medium text-[#FAF7F2] shadow-md hover:bg-[#8B264E] transition active:scale-95"
            >
              <RefreshCw className="h-3.5 w-3.5 text-[#DFBF99]" />
              <span>Restore Vault</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
