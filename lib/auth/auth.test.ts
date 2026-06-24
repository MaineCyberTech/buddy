import { describe, it, expect, beforeEach } from 'vitest';
import { LocalAuthService } from './local-auth-service';
import { CloudSaveService } from './cloud-save-service';
import { GameSave } from '@/lib/generation/types';

beforeEach(() => {
  if (typeof window !== 'undefined' && window.localStorage) {
    window.localStorage.clear();
  }
});

describe('Auth Service', () => {
  describe('LocalAuthService', () => {
    it('starts as guest', () => {
      expect(LocalAuthService.getStatus()).toBe('guest');
      expect(LocalAuthService.getUser()).toBeNull();
      expect(LocalAuthService.isGuest()).toBe(true);
    });

    it('signs up a user', async () => {
      const user = await LocalAuthService.signUp('test@example.com', 'TestUser');
      expect(user.email).toBe('test@example.com');
      expect(user.username).toBe('TestUser');
      expect(user.id).toBeTruthy();
      expect(LocalAuthService.getStatus()).toBe('authenticated');
      expect(LocalAuthService.isGuest()).toBe(false);
    });

    it('prevents double sign-up', async () => {
      await LocalAuthService.signUp('test@example.com', 'TestUser');
      await expect(LocalAuthService.signUp('other@example.com', 'Other')).rejects.toThrow('Already signed in');
    });

    it('signs out', async () => {
      await LocalAuthService.signUp('test@example.com', 'TestUser');
      await LocalAuthService.signOut();
      expect(LocalAuthService.getStatus()).toBe('guest');
      expect(LocalAuthService.getUser()).toBeNull();
    });

    it('signs in with correct email', async () => {
      await LocalAuthService.signUp('test@example.com', 'TestUser');
      const user = await LocalAuthService.signIn('test@example.com');
      expect(user.email).toBe('test@example.com');
    });

    it('rejects sign in with wrong email', async () => {
      await LocalAuthService.signUp('test@example.com', 'TestUser');
      await expect(LocalAuthService.signIn('wrong@example.com')).rejects.toThrow('Email does not match');
    });
  });

  describe('CloudSaveService', () => {
    it('uploads and downloads a save', async () => {
      const save: GameSave = {
        version: 2,
        buddy: null,
        guestId: 'user_test123',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      await CloudSaveService.upload(save, 'user_test123');
      const downloaded = await CloudSaveService.download('user_test123');
      expect(downloaded).toBeTruthy();
      expect(downloaded?.guestId).toBe('user_test123');
    });

    it('returns null for unknown user', async () => {
      const save = await CloudSaveService.download('nonexistent');
      expect(save).toBeNull();
    });

    it('gets envelope metadata', async () => {
      const save: GameSave = {
        version: 2,
        buddy: null,
        guestId: 'user_test456',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      await CloudSaveService.upload(save, 'user_test456');
      const envelope = await CloudSaveService.getEnvelope('user_test456');
      expect(envelope).toBeTruthy();
      expect(envelope?.userId).toBe('user_test456');
    });

    it('resolves conflict with newer local save', async () => {
      const local: GameSave = {
        version: 2,
        buddy: null,
        guestId: 'user_test',
        createdAt: 1000,
        updatedAt: 2000,
      };
      const cloud: GameSave = {
        version: 2,
        buddy: null,
        guestId: 'user_test',
        createdAt: 1000,
        updatedAt: 1500,
      };
      const result = await CloudSaveService.resolveConflict(local, cloud);
      expect(result.status).toBe('ok');
    });

    it('detects conflict when cloud is newer', async () => {
      const local: GameSave = {
        version: 2,
        buddy: null,
        guestId: 'user_test',
        createdAt: 1000,
        updatedAt: 1000,
      };
      const cloud: GameSave = {
        version: 2,
        buddy: null,
        guestId: 'user_test',
        createdAt: 1000,
        updatedAt: 2000,
      };
      const result = await CloudSaveService.resolveConflict(local, cloud);
      expect(result.status).toBe('conflict');
    });

    it('handles missing timestamps', async () => {
      const local = { version: 2, buddy: null, guestId: 'test', createdAt: 0 } as GameSave;
      const cloud = { version: 2, buddy: null, guestId: 'test', createdAt: 0 } as GameSave;
      const result = await CloudSaveService.resolveConflict(local, cloud);
      expect(result.status).toBe('error');
    });
  });
});
