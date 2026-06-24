export type AuthStatus = 'loading' | 'guest' | 'authenticated';

export interface AuthUser {
  id: string;
  email: string;
  username: string;
  createdAt: number;
}

export interface AuthState {
  status: AuthStatus;
  user: AuthUser | null;
}

export interface CloudSaveEnvelope {
  version: number;
  userId: string;
  buddyId: string;
  checksum: string;
  timestamp: number;
}

export interface SyncResult {
  status: 'ok' | 'conflict' | 'error';
  localVersion?: number;
  cloudVersion?: number;
  message?: string;
}
