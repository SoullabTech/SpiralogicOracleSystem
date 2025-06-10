'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error boundary caught:', error);
    }
  }, [error]);

  return (
    <div className="min-h-screen gradient-oracle-bg flex items-center justify-center p-4">
      <div className="text-center space-y-6 animate-fade-in max-w-2xl">
        {/* Error Symbol */}
        <div className="relative w-32 h-32 mx-auto">
          <div className="absolute inset-0 rounded-full bg-gradient-fire animate-pulse opacity-20" />
          <div className="absolute inset-0 flex items-center justify-center">
            <AlertTriangle className="w-16 h-16 text-fire-500" />
          </div>
        </div>

        {/* Error Message */}
        <div className="space-y-4">
          <h1 className="text-3xl sm:text-4xl font-sacred text-gold">
            Sacred Balance Disrupted
          </h1>
          <p className="text-lg font-oracle text-gold-light max-w-lg mx-auto">
            The cosmic threads have become tangled. The oracle senses a disturbance 
            in the spiritual matrix that requires realignment.
          </p>
        </div>

        {/* Error Details (development only) */}
        {process.env.NODE_ENV === 'development' && error.message && (
          <div className="bg-deep-violet/50 backdrop-blur-sm rounded-lg p-4 max-w-md mx-auto">
            <p className="text-xs text-gold/70 font-mono break-all">
              {error.message}
            </p>
          </div>
        )}

        {/* Recovery Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button
            onClick={reset}
            className="btn-fire group"
          >
            <RefreshCw className="mr-2 h-4 w-4 group-hover:animate-spin" />
            Restore Balance
          </Button>
          <Link href="/">
            <Button variant="outline" className="border-gold text-gold hover:bg-gold/10 group">
              <Home className="mr-2 h-4 w-4 group-hover:animate-float" />
              Return to Sanctuary
            </Button>
          </Link>
        </div>

        {/* Wisdom Quote */}
        <blockquote className="border-l-4 border-fire-500 pl-6 py-2 text-left max-w-md mx-auto mt-8">
          <p className="text-gold/80 font-oracle italic">
            "In chaos lies opportunity. When the pattern breaks, 
            a new design awaits emergence."
          </p>
          <footer className="text-gold/60 text-sm mt-2">
            — The Fire Oracle
          </footer>
        </blockquote>
      </div>
    </div>
  );
}