'use client';

import { useState } from 'react';
import { useGameStore } from '@/lib/buddy/store';
import { LocalAuthService } from '@/lib/auth';
import { AccountPrompt } from './AccountPrompt';
import { exportSave, importSave } from '@/lib/storage/indexeddb';

interface SettingsScreenProps {
  onBack: () => void;
}

export function SettingsScreen({ onBack }: SettingsScreenProps) {
  const guestId = useGameStore(s => s.guestId);
  const isGuest = guestId.startsWith('guest-');
  const [showAccountPrompt, setShowAccountPrompt] = useState(false);
  const [message, setMessage] = useState('');
  const [messageKey, setMessageKey] = useState(0);

  const authUser = LocalAuthService.getUser();

  const handleExport = async () => {
    try {
      const data = await exportSave();
      const blob = new Blob([data], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `buddy-save-${Date.now()}.txt`;
      a.click();
      URL.revokeObjectURL(url);
      setMessage('Save exported!');
      setMessageKey(k => k + 1);
    } catch {
      setMessage('Export failed.');
      setMessageKey(k => k + 1);
    }
  };

  const handleImport = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.txt';
    input.onchange = async (e: Event) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      try {
        const text = await file.text();
        const ok = await importSave(text.trim());
        if (ok) {
          setMessage('Save imported! Reload to apply.');
          setMessageKey(k => k + 1);
        } else {
          setMessage('Import failed: invalid save data.');
          setMessageKey(k => k + 1);
        }
      } catch {
        setMessage('Import failed.');
        setMessageKey(k => k + 1);
      }
    };
    input.click();
  };

  const handleSignOut = async () => {
    await LocalAuthService.signOut();
    useGameStore.getState().setGuestId('guest-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6));
    setMessage('Signed out. You are now a guest.');
    setMessageKey(k => k + 1);
  };

  const handleAccountComplete = () => {
    setShowAccountPrompt(false);
    setMessage('Account created! All features unlocked.');
    setMessageKey(k => k + 1);
  };

  if (showAccountPrompt) {
    return (
      <AccountPrompt
        feature="account settings"
        onClose={() => setShowAccountPrompt(false)}
        onComplete={handleAccountComplete}
      />
    );
  }

  return (
    <div className="animate-fade-in space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs lcd-text-accent uppercase tracking-wider">Settings</p>
        {message && (
          <span key={messageKey} className="text-xs lcd-text-accent animate-fade-in" role="status">{message}</span>
        )}
      </div>

      <div className="space-y-1.5">
        <p className="text-[10px] lcd-text opacity-50 uppercase">Account</p>
        {authUser ? (
          <div className="bg-lcd-dark rounded-sm p-2 space-y-1">
            <p className="text-xs lcd-text-accent">{authUser.username}</p>
            <p className="text-[10px] lcd-text opacity-60">{authUser.email}</p>
            <p className="text-[10px] lcd-text opacity-40">ID: {authUser.id.slice(0, 16)}...</p>
          </div>
        ) : (
          <div className="bg-lcd-dark rounded-sm p-2">
            <p className="text-xs lcd-text opacity-70">
              Guest mode {isGuest ? '(local save)' : ''}
            </p>
          </div>
        )}
        <div className="flex gap-2">
          {!authUser && (
            <button
              onClick={() => setShowAccountPrompt(true)}
              className="btn-device px-3 py-2 text-xs rounded-md focus-ring lcd-text-accent"
            >
              CREATE ACCOUNT
            </button>
          )}
          {authUser && (
            <button
              onClick={handleSignOut}
              className="btn-device px-3 py-2 text-xs rounded-md focus-ring lcd-text-warn"
            >
              SIGN OUT
            </button>
          )}
        </div>
      </div>

      <div className="space-y-1.5">
        <p className="text-[10px] lcd-text opacity-50 uppercase">Data</p>
        <div className="flex gap-2">
          <button onClick={handleExport} className="btn-device px-3 py-2 text-xs rounded-md focus-ring">
            EXPORT SAVE
          </button>
          <button onClick={handleImport} className="btn-device px-3 py-2 text-xs rounded-md focus-ring">
            IMPORT SAVE
          </button>
        </div>
      </div>

      <div className="text-[10px] lcd-text opacity-40 space-y-0.5">
        <p>Guest ID: {guestId.slice(0, 20)}...</p>
        <p>v0.1 — Local-first PWA</p>
      </div>

      <button onClick={onBack} className="btn-device px-4 py-2 text-xs rounded-md focus-ring mt-2">
        BACK
      </button>
    </div>
  );
}
