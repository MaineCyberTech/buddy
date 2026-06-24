'use client';

import { useState, useEffect } from 'react';
import { useGameStore } from '@/lib/buddy/store';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [installPlatform, setInstallPlatform] = useState<'ios' | 'android' | 'other'>('other');

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const ua = navigator.userAgent;
    if (/iPad|iPhone|iPod/.test(ua)) setInstallPlatform('ios');
    else if (/Android/.test(ua)) setInstallPlatform('android');

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') setShowPrompt(false);
    setDeferredPrompt(null);
  };

  if (!showPrompt && installPlatform !== 'ios') return null;

  return (
    <div className="bg-[#1a1a2e] border border-lcd-accent rounded-lg p-3 text-center animate-fade-in">
      <p className="text-xs lcd-text-accent mb-2">Install Buddy</p>
      <p className="text-[10px] lcd-text opacity-60 mb-3">
        {installPlatform === 'ios'
          ? 'Tap the Share button and select "Add to Home Screen"'
          : 'Install for the best experience, offline support, and faster loading'}
      </p>
      {deferredPrompt && (
        <button onClick={handleInstall} className="btn-device px-4 py-2 text-xs rounded-md focus-ring">
          INSTALL
        </button>
      )}
    </div>
  );
}

export function UpdatePrompt() {
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);
  const [showUpdate, setShowUpdate] = useState(false);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        window.location.reload();
      });

      navigator.serviceWorker.ready.then((registration) => {
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                setWaitingWorker(newWorker);
                setShowUpdate(true);
              }
            });
          }
        });
      });
    }
  }, []);

  const handleUpdate = () => {
    if (waitingWorker) {
      waitingWorker.postMessage({ type: 'SKIP_WAITING' });
    }
    setShowUpdate(false);
  };

  if (!showUpdate) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 bg-lcd-dark border border-lcd-accent rounded-lg p-3 animate-fade-in max-w-sm mx-auto">
      <p className="text-xs lcd-text-accent mb-2">Update Available</p>
      <p className="text-[10px] lcd-text opacity-60 mb-2">A new version is ready.</p>
      <button onClick={handleUpdate} className="btn-device px-4 py-2 text-xs rounded-md focus-ring w-full">
        UPDATE NOW
      </button>
    </div>
  );
}
