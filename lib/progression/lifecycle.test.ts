import { describe, it, expect } from 'vitest';
import {
  calculateLifecycle,
  getStageProgress,
  checkEvolution,
  getBondLevel,
  getStageName,
  createInitialProgression,
} from '@/lib/progression/lifecycle';
import { createInitialBuddyState } from '@/lib/generation/engine';
import { LifecycleStage } from '@/lib/generation/types';

describe('Lifecycle System', () => {
  describe('createInitialProgression', () => {
    it('creates progression with egg stage', () => {
      const prog = createInitialProgression();
      expect(prog.lifecycle).toBe('egg');
      expect(prog.age).toBe(0);
      expect(prog.totalAdventures).toBe(0);
      expect(prog.achievements).toEqual([]);
      expect(prog.memories).toEqual([]);
    });
  });

  describe('calculateLifecycle', () => {
    it('returns egg for zero XP', () => {
      expect(calculateLifecycle(0)).toBe('egg');
    });

    it('returns baby for 30 XP', () => {
      expect(calculateLifecycle(30)).toBe('baby');
    });

    it('returns child at 100 XP', () => {
      expect(calculateLifecycle(100)).toBe('child');
    });

    it('returns teen at 300 XP', () => {
      expect(calculateLifecycle(300)).toBe('teen');
    });

    it('returns adult at 800 XP', () => {
      expect(calculateLifecycle(800)).toBe('adult');
    });

    it('returns elder at 2000 XP', () => {
      expect(calculateLifecycle(2000)).toBe('elder');
    });

    it('returns all 6 lifecycle stages', () => {
      const stages = [0, 30, 100, 300, 800, 2000].map(xp => calculateLifecycle(xp));
      const uniqueStages = Array.from(new Set(stages));
      expect(uniqueStages).toHaveLength(6);
    });
  });

  describe('getStageProgress', () => {
    it('shows progress toward next stage', () => {
      const { current, next, progress } = getStageProgress(50);
      expect(current).toBe('baby');
      expect(next).toBe('child');
      expect(progress).toBeGreaterThan(0);
      expect(progress).toBeLessThan(1);
    });

    it('shows null next stage for elder', () => {
      const { current, next } = getStageProgress(5000);
      expect(current).toBe('elder');
      expect(next).toBeNull();
    });
  });

  describe('checkEvolution', () => {
    it('returns null when no evolution', () => {
      const buddy = createInitialBuddyState('test', 'Test');
      buddy.xp = 20;
      buddy.progression = createInitialProgression();
      const result = checkEvolution(buddy);
      expect(result).toBeNull();
    });

    it('returns child when XP is 100 (baby → child)', () => {
      const buddy = createInitialBuddyState('test', 'Test');
      buddy.xp = 100;
      buddy.progression = createInitialProgression();
      const result = checkEvolution(buddy);
      expect(result).toBe('child');
    });
  });

  describe('getBondLevel', () => {
    it('returns 1 for bond 0', () => {
      expect(getBondLevel(0)).toBe(1);
    });

    it('returns 2 for bond 10', () => {
      expect(getBondLevel(10)).toBe(2);
    });

    it('returns 6 for bond 55', () => {
      expect(getBondLevel(55)).toBe(6);
    });

    it('returns 11 for bond 100', () => {
      expect(getBondLevel(100)).toBe(11);
    });
  });

  describe('getStageName', () => {
    it('returns correct names', () => {
      const stages: LifecycleStage[] = ['egg', 'baby', 'child', 'teen', 'adult', 'elder'];
      const names = stages.map(s => getStageName(s));
      expect(names).toEqual(['Egg', 'Baby', 'Child', 'Teen', 'Adult', 'Elder']);
    });
  });

  describe('Memory Entries', () => {
    it('initial progression has empty memories', () => {
      const prog = createInitialProgression();
      expect(prog.memories).toEqual([]);
    });

    it('hatch memory has correct structure', () => {
      const hatchMemory = {
        id: 'hatch-abc123',
        type: 'hatch' as const,
        title: 'A TestBuddy is born!',
        description: 'Buddy hatched from a mysterious egg.',
        timestamp: 1000,
        icon: '🥚',
      };
      expect(hatchMemory.id).toBeTruthy();
      expect(hatchMemory.type).toBe('hatch');
      expect(hatchMemory.title).toContain('TestBuddy');
      expect(hatchMemory.timestamp).toBeGreaterThan(0);
    });

    it('memories can be prepended to progression', () => {
      const prog = createInitialProgression();
      const memory = {
        id: 'hatch-1',
        type: 'hatch' as const,
        title: 'First hatch',
        description: 'Born!',
        timestamp: Date.now(),
        icon: '🥚',
      };
      const updated = { ...prog, memories: [memory, ...prog.memories] };
      expect(updated.memories).toHaveLength(1);
      expect(updated.memories[0].title).toBe('First hatch');
    });

    it('supports multiple memory types', () => {
      const types = ['hatch', 'evolution', 'adventure', 'milestone', 'achievement'] as const;
      const memories = types.map((type, i) => ({
        id: `mem-${i}`,
        type,
        title: `${type} event`,
        description: 'A memory.',
        timestamp: Date.now() + i,
        icon: '📝',
      }));
      expect(memories).toHaveLength(5);
      expect(memories.map(m => m.type)).toEqual(types);
    });
  });
});