'use client';

import { useState } from 'react';
import { useGameStore } from '@/lib/buddy/store';
import { LocalAuthService } from '@/lib/auth';
import { migrateGuestToAccount } from '@/lib/auth/migration';
import { saveGame } from '@/lib/storage/indexeddb';

interface AccountPromptProps {
  feature: string;
  onClose: () => void;
  onComplete: () => void;
}

export function AccountPrompt({ feature, onClose, onComplete }: AccountPromptProps) {
  const guestId = useGameStore(s => s.guestId);
  const buddy = useGameStore(s => s.buddy);
  const inventory = useGameStore(s => s.inventory);
  const placedDecor = useGameStore(s => s.placedDecor);

  const [mode, setMode] = useState<'prompt' | 'signup' | 'signin'>('prompt');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    if (!email.trim() || !username.trim()) {
      setError('Please enter both email and username.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const { user, migratedSave } = await migrateGuestToAccount(guestId, email.trim(), username.trim());
      useGameStore.getState().setGuestId(user.id);
      setLoading(false);
      onComplete();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Sign up failed.');
      setLoading(false);
    }
  };

  const handleSignIn = async () => {
    if (!email.trim()) {
      setError('Please enter your email.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const user = await LocalAuthService.signIn(email.trim());
      useGameStore.getState().setGuestId(user.id);
      setLoading(false);
      onComplete();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Sign in failed.');
      setLoading(false);
    }
  };

  if (mode === 'signup') {
    return (
      <div className="animate-fade-in space-y-3 p-2">
        <p className="text-xs lcd-text-accent uppercase tracking-wider">Create Account</p>
        <p className="text-xs lcd-text opacity-70">Your buddy and progress will be saved to the cloud.</p>
        <div className="space-y-2">
          <div>
            <label className="text-[10px] lcd-text opacity-60 block mb-1" htmlFor="su-email">Email</label>
            <input
              id="su-email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full bg-lcd-dark border border-[#1a1a2e] rounded px-2 py-1.5 text-xs lcd-text focus:outline-none focus:border-lcd-accent"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="text-[10px] lcd-text opacity-60 block mb-1" htmlFor="su-username">Username</label>
            <input
              id="su-username"
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="w-full bg-lcd-dark border border-[#1a1a2e] rounded px-2 py-1.5 text-xs lcd-text focus:outline-none focus:border-lcd-accent"
              placeholder="BuddyFan42"
            />
          </div>
        </div>
        {error && <p className="text-xs lcd-text-danger">{error}</p>}
        <div className="flex gap-2">
          <button onClick={() => { setMode('prompt'); setError(''); }} className="btn-device px-3 py-2 text-xs rounded-md focus-ring" disabled={loading}>
            BACK
          </button>
          <button onClick={handleSignUp} className="btn-device px-3 py-2 text-xs rounded-md focus-ring lcd-text-accent" disabled={loading}>
            {loading ? 'Creating...' : 'CREATE ACCOUNT'}
          </button>
        </div>
      </div>
    );
  }

  if (mode === 'signin') {
    return (
      <div className="animate-fade-in space-y-3 p-2">
        <p className="text-xs lcd-text-accent uppercase tracking-wider">Sign In</p>
        <p className="text-xs lcd-text opacity-70">Sign in to access your cloud save.</p>
        <div>
          <label className="text-[10px] lcd-text opacity-60 block mb-1" htmlFor="si-email">Email</label>
          <input
            id="si-email"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full bg-lcd-dark border border-[#1a1a2e] rounded px-2 py-1.5 text-xs lcd-text focus:outline-none focus:border-lcd-accent"
            placeholder="you@example.com"
          />
        </div>
        {error && <p className="text-xs lcd-text-danger">{error}</p>}
        <div className="flex gap-2">
          <button onClick={() => { setMode('prompt'); setError(''); }} className="btn-device px-3 py-2 text-xs rounded-md focus-ring" disabled={loading}>
            BACK
          </button>
          <button onClick={handleSignIn} className="btn-device px-3 py-2 text-xs rounded-md focus-ring lcd-text-accent" disabled={loading}>
            {loading ? 'Signing in...' : 'SIGN IN'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-3 p-2">
      <p className="text-xs lcd-text-accent uppercase tracking-wider">Account Required</p>
      <p className="text-xs lcd-text opacity-80">
        {feature ? `Create an account to access ${feature}!` : 'This feature requires an account.'}
      </p>
      <div className="space-y-1.5 text-xs lcd-text opacity-70 bg-lcd-dark rounded-sm p-2">
        <p className="lcd-text-accent">Benefits of creating an account:</p>
        <p>✓ Cloud saves — never lose your buddy</p>
        <p>✓ All locations and adventures</p>
        <p>✓ Premium home decor slots</p>
        <p>✓ Persistent home customization</p>
        <p>✓ Cross-device access (coming soon)</p>
      </div>
      <div className="flex gap-2">
        <button onClick={onClose} className="btn-device px-3 py-2 text-xs rounded-md focus-ring">
          CONTINUE AS GUEST
        </button>
        <button onClick={() => setMode('signup')} className="btn-device px-3 py-2 text-xs rounded-md focus-ring lcd-text-accent">
          CREATE ACCOUNT
        </button>
        <button onClick={() => setMode('signin')} className="btn-device px-3 py-2 text-xs rounded-md focus-ring">
          SIGN IN
        </button>
      </div>
    </div>
  );
}
