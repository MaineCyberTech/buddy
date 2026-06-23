'use client';

import { useGameStore } from '@/lib/buddy/store';

export function OfflineIndicator() {
  const isOnline = useGameStore((s) => s.isOnline);

  if (isOnline) return null;

  return (
    <div
      className="fixed top-0 left-0 right-0 z-50 bg-lcd-danger text-white text-center text-xs py-1 font-lcd"
      role="alert"
      aria-live="assertive"
    >
      OFFLINE — Local saves only
    </div>
  );
}