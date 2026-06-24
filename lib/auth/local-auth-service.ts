import { AuthUser, AuthStatus } from './types';

const AUTH_STORAGE_KEY = 'buddy-auth-user';

function getStoredUser(): AuthUser | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function storeUser(user: AuthUser | null): void {
  if (typeof window === 'undefined') return;
  if (user) {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  }
}

export const LocalAuthService = {
  getStatus(): AuthStatus {
    return getStoredUser() ? 'authenticated' : 'guest';
  },

  getUser(): AuthUser | null {
    return getStoredUser();
  },

  async signUp(email: string, username: string): Promise<AuthUser> {
    const existing = getStoredUser();
    if (existing) throw new Error('Already signed in');

    const user: AuthUser = {
      id: 'user_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
      email,
      username,
      createdAt: Date.now(),
    };
    storeUser(user);
    return user;
  },

  async signIn(email: string): Promise<AuthUser> {
    const user = getStoredUser();
    if (!user) throw new Error('No account found. Please sign up first.');
    if (user.email !== email) throw new Error('Email does not match stored account.');
    return user;
  },

  async signOut(): Promise<void> {
    storeUser(null);
  },

  async migrateFromGuest(guestId: string, email: string, username: string): Promise<AuthUser> {
    const user = await LocalAuthService.signUp(email, username);
    return user;
  },

  isGuest(): boolean {
    return LocalAuthService.getStatus() === 'guest';
  },
};
