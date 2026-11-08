'use client';

import { useEffect, useState } from 'react';
import {
  applyServiceWorkerUpdate,
  clearInstallPrompt,
  dismissServiceWorkerUpdate,
  getInstallPrompt,
  listenForInstallPrompt,
  registerServiceWorker,
  subscribeToInstallPrompt,
  subscribeToServiceWorkerUpdate,
} from '@/lib/offline/sw';
import { useGameStore } from '@/lib/buddy/store';

export function ServiceWorkerRegistration() {
  const [installable, setInstallable] = useState(false);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const setIsOnline = useGameStore((s) => s.setIsOnline);

  useEffect(() => {
    registerServiceWorker();
    listenForInstallPrompt();
    const unsubscribe = subscribeToInstallPrompt(setInstallable);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    setIsOnline(navigator.onLine);

    return () => {
      unsubscribe();
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [setIsOnline]);

  useEffect(() => subscribeToServiceWorkerUpdate(setUpdateAvailable), []);

  const handleInstall = async () => {
    const prompt = getInstallPrompt();
    if (!prompt) return;
    const event = prompt as BeforeInstallPromptEvent;
    event.prompt();
    const result = await event.userChoice;
    if (result.outcome === 'accepted') {
      setInstallable(false);
    }
    clearInstallPrompt();
  };

  const handleDismissInstall = () => {
    clearInstallPrompt();
    setInstallable(false);
  };

  const handleDismissUpdate = () => {
    dismissServiceWorkerUpdate();
  };

  return (
    <>
      {updateAvailable && (
        <div
          className={`fixed left-4 right-4 z-50 flex justify-center ${installable ? 'bottom-20' : 'bottom-4'}`}
          role="status"
          aria-live="polite"
        >
          <div className="btn-device flex items-center gap-3 rounded-lg px-4 py-2 text-xs shadow-lg">
            <span>New version available.</span>
            <button
              onClick={applyServiceWorkerUpdate}
              className="btn-device btn-primary px-3 py-2 min-h-11 rounded focus-ring"
            >
              RELOAD
            </button>
            <button
              onClick={handleDismissUpdate}
              className="btn-device px-3 py-2 min-h-11 rounded focus-ring"
              aria-label="Dismiss update notification"
            >
              LATER
            </button>
          </div>
        </div>
      )}

      {installable && (
        <div className="fixed bottom-4 left-4 right-4 z-50 flex justify-center" role="alert">
          <div className="flex items-center gap-2">
            <button
              onClick={handleInstall}
              className="btn-device btn-primary px-6 py-3 min-h-11 rounded-lg text-sm shadow-lg focus-ring"
              aria-label="Install Buddy app"
            >
              INSTALL BUDDY
            </button>
            <button
              onClick={handleDismissInstall}
              className="btn-device px-3 py-3 min-h-11 rounded-lg text-sm shadow-lg focus-ring"
              aria-label="Dismiss install prompt"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </>
  );
}

interface BeforeInstallPromptEvent extends Event {
  prompt: () => void;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}
