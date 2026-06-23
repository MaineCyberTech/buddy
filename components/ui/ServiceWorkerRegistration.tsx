'use client';

import { useEffect, useState } from 'react';
import { registerServiceWorker, listenForInstallPrompt, getInstallPrompt, clearInstallPrompt } from '@/lib/offline/sw';
import { useGameStore } from '@/lib/buddy/store';

export function ServiceWorkerRegistration() {
  const [installable, setInstallable] = useState(false);
  const setIsOnline = useGameStore((s) => s.setIsOnline);

  useEffect(() => {
    registerServiceWorker();
    listenForInstallPrompt();

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    setIsOnline(navigator.onLine);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [setIsOnline]);

  useEffect(() => {
    const interval = setInterval(() => {
      const prompt = getInstallPrompt();
      if (prompt) {
        setInstallable(true);
        clearInterval(interval);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, []);

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

  if (!installable) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 flex justify-center" role="alert">
      <button
        onClick={handleInstall}
        className="btn-device px-6 py-3 rounded-lg btn-primary text-sm shadow-lg focus-ring"
        aria-label="Install Buddy app"
      >
        INSTALL BUDDY
      </button>
    </div>
  );
}

interface BeforeInstallPromptEvent extends Event {
  prompt: () => void;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}