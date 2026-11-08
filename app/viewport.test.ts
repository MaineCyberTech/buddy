import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { appViewport } from '@/app/viewport';

// UX-P2-001: pinch/double-tap zoom must not be disabled in the viewport or by
// the global touch-action rule.
describe('Zoom accessibility', () => {
  it('leaves browser zoom enabled in the viewport export', () => {
    expect(appViewport.initialScale).toBe(1);
    expect(appViewport.maximumScale).toBeUndefined();
    expect(appViewport.userScalable).not.toBe(false);
  });

  it('allows pinch zoom on the body instead of suppressing it', () => {
    const css = readFileSync('app/globals.css', 'utf8');
    expect(css).toContain('touch-action: pan-x pan-y pinch-zoom');
    expect(css).not.toContain('touch-action: manipulation');
  });
});
