'use client';

import React, { useEffect } from 'react';
import { deleteSave } from '@/lib/storage/indexeddb';

const BUILD_ID = process.env.NEXT_PUBLIC_BUILD_ID ?? 'dev';

interface ErrorBoundaryProps {
  error: Error & { digest?: string };
  reset: () => void;
}

interface ErrorReport {
  type: 'error';
  message: string;
  digest: string | null;
  buildId: string;
  timestamp: string;
}

/**
 * Minimal, dependency-free structured error report (OBS-P2-001).
 *
 * Privacy note: only the error message, Next.js digest and build id are
 * emitted - never save contents or other user data. The event is emitted as a
 * single JSON line so a log collector can pick it up, and also dispatched on
 * `window` so a reporter (e.g. Sentry) can be attached later without changing
 * call sites.
 */
export function reportError(error: Error & { digest?: string }): ErrorReport {
  const report: ErrorReport = {
    type: 'error',
    message: error.message,
    digest: error.digest ?? null,
    buildId: BUILD_ID,
    timestamp: new Date().toISOString(),
  };

  console.error(JSON.stringify(report));

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('buddy:error', { detail: report }));
  }

  return report;
}

export default function Error({ error, reset }: ErrorBoundaryProps) {
  useEffect(() => {
    reportError(error);
  }, [error]);

  const reload = () => {
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  const resetSave = async () => {
    try {
      await deleteSave();
    } catch {
      // Ignore storage errors; a reload still gives the user a clean start.
    } finally {
      reload();
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-6 lcd-screen"
      role="alert"
    >
      <div className="max-w-md w-full text-center space-y-4">
        <h1 className="lcd-text-danger text-2xl font-bold">SYSTEM FAULT</h1>
        <p className="lcd-text text-sm">
          Buddy hit an unexpected error. You can try again, reload, or reset the
          device save to recover.
        </p>
        <p className="lcd-text text-xs opacity-70">Build: {BUILD_ID}</p>
        <div className="flex flex-col sm:flex-row gap-2 justify-center pt-2">
          <button
            type="button"
            onClick={reset}
            className="btn-device btn-primary px-4 py-2 rounded focus-ring"
          >
            TRY AGAIN
          </button>
          <button
            type="button"
            onClick={reload}
            className="btn-device px-4 py-2 rounded focus-ring"
          >
            RELOAD
          </button>
          <button
            type="button"
            onClick={resetSave}
            className="btn-device px-4 py-2 rounded focus-ring"
          >
            RESET SAVE
          </button>
        </div>
      </div>
    </div>
  );
}
