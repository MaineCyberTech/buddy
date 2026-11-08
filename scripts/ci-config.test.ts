import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

function read(relativePath: string) {
  return readFileSync(path.join(process.cwd(), relativePath), 'utf8');
}

describe('CI security gate wiring', () => {
  it('runs audit, secret scan and license policy even when an earlier gate fails', () => {
    const ci = read('.github/workflows/ci.yml');
    expect(ci).toContain('name: Audit production dependencies');
    expect(ci).toContain('run: npm run audit:gate');
    expect(ci).toContain('run: bash scripts/run-gitleaks.sh');
    expect(ci).toContain('run: npm run license:check');
    expect(ci.match(/if: always\(\)/g)?.length).toBeGreaterThanOrEqual(2);
  });

  it('runs the same gates in the release workflow before packaging', () => {
    const release = read('.github/workflows/release.yml');
    const audit = release.indexOf('run: npm run audit:gate');
    const secret = release.indexOf('run: bash scripts/run-gitleaks.sh');
    const license = release.indexOf('run: npm run license:check');
    const packageArtifact = release.indexOf('name: Package artifact');

    expect(audit).toBeGreaterThan(-1);
    expect(secret).toBeGreaterThan(-1);
    expect(license).toBeGreaterThan(-1);
    expect(packageArtifact).toBeGreaterThan(-1);
    expect(audit).toBeLessThan(packageArtifact);
    expect(secret).toBeLessThan(packageArtifact);
    expect(license).toBeLessThan(packageArtifact);
  });

  it('keeps the patched Next line and the source-map-js override', () => {
    const pkg = JSON.parse(read('package.json'));
    expect(pkg.dependencies.next).toBe('^15.5.28');
    expect(pkg.overrides['source-map-js']).toBe('^1.2.2');
    expect(pkg.overrides.postcss).toBe('^8.5.28');
  });

  it('time-boxes the zod audit exception', () => {
    const exceptions = JSON.parse(read('.audit-exceptions.json'));
    const zod = exceptions.exceptions.find((entry: { package: string }) => entry.package === 'zod');
    expect(zod.id).toBe('GHSA-mrhx-c7xc-m3w5');
    expect(zod.expires).toBe('2026-12-15');
    expect(zod.exitCondition).toMatch(/zod >=4\.6\.6|zod 4/i);
  });
});
