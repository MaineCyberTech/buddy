import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

// Documentation test for EXEC-P1-001: the release-readiness policy must record the
// conditional verdict and the rule that an unconditional GO requires every P0/P1 to
// be closed with commit-bound validation evidence. This is the suggested validation
// until a CI/release gate produces that artifact automatically.
const docPath = path.join(process.cwd(), 'docs', 'release-readiness.md');

describe('release readiness gate documentation', () => {
  it('records the current verdict as conditional, not an unconditional GO', () => {
    expect(fs.existsSync(docPath)).toBe(true);
    const doc = fs.readFileSync(docPath, 'utf8');

    expect(doc).toMatch(/GO WITH CONDITIONS/i);
    expect(doc).toMatch(/\bnot\b[\s*]+an\s+unconditional GO/i);
    expect(doc).toMatch(/EXEC-P1-001/);
  });

  it('states the unconditional-GO rule and commit-bound evidence requirement', () => {
    const doc = fs.readFileSync(docPath, 'utf8');

    expect(doc).toMatch(/unconditional GO/i);
    expect(doc).toMatch(/zero open P0\/P1/i);
    expect(doc).toMatch(/validation artifact bound to (that|the) commit/i);
    expect(doc).toMatch(/re-audit/i);
  });

  it('lists the P1 patch sets required before a wider release', () => {
    const doc = fs.readFileSync(docPath, 'utf8');

    for (const ps of ['PS-01', 'PS-02', 'PS-03', 'PS-04']) {
      expect(doc).toContain(ps);
    }
  });
});
