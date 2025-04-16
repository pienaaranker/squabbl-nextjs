'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Unhandled error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-softwhite">
      <div className="w-full max-w-md p-8 text-center border-2 border-coral-300 card">
        <h2 className="text-2xl font-bold text-coral-500 mb-4 font-poppins">Oops! Something went wrong</h2>
        <div className="mb-6 p-4 bg-sky-100" style={{ borderRadius: 'var(--border-radius)' }}>
          <p className="text-slate-800 font-nunito">
            We're sorry, but we encountered an unexpected error.
          </p>
        </div>
        <div className="space-y-4">
          <button
            onClick={reset}
            className="btn btn-primary w-full"
          >
            Try again
          </button>
          <Link href="/" className="btn btn-secondary w-full inline-block">
            Return Home
          </Link>
        </div>
      </div>
    </div>
  );
} 