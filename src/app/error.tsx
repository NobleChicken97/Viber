'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertCircle, Home, RefreshCw } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error boundary caught:', error);
    }
  }, [error]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-900 via-slate-900 to-black flex items-center justify-center px-4">
      <div className="text-center space-y-8 max-w-md">
        {}
        <div className="relative">
          <div className="w-24 h-24 mx-auto bg-red-500/10 rounded-full flex items-center justify-center">
            <AlertCircle className="w-12 h-12 text-red-500" />
          </div>
        </div>

        {}
        <div className="space-y-4">
          <h1 className="text-2xl font-bold text-white">
            Something Went Wrong
          </h1>
          <p className="text-gray-400 text-sm">
            The music stopped unexpectedly. Don&apos;t worry, we can fix this.
          </p>
          {process.env.NODE_ENV === 'development' && error.message && (
            <details className="mt-4">
              <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-400">
                Technical Details
              </summary>
              <pre className="mt-2 text-xs text-left text-red-400 bg-black/50 p-3 rounded overflow-auto max-h-32">
                {error.message}
              </pre>
            </details>
          )}
        </div>

        {}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-500 text-white rounded-full transition-all transform hover:scale-105 font-medium"
          >
            <RefreshCw className="w-5 h-5" />
            Try Again
          </button>
          <Link 
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all backdrop-blur-sm font-medium"
          >
            <Home className="w-5 h-5" />
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}

// made by arpan
