import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

// Documentation checks for the inventory/release-documentation patch set
// (INV-P2-001, INV-P3-001, FINAL-P2-001, FINAL-P2-002, EXEC-P2-001). These bind
// the docs' headline claims to files that must exist, so the documentation
// cannot silently regress. This is the suggested in-repo "claims match code"
// check until commit-bound CI evidence is available.
const root = process.cwd();
const read = (p: string) => fs.readFileSync(path.join(root, p), 'utf8');

describe('root README (INV-P2-001)', () => {
  it('exists and documents setup, commands, and architecture', () => {
    const readmePath = path.join(root, 'README.md');
    expect(fs.existsSync(readmePath)).toBe(true);
    const readme = read('README.md');

    expect(readme).toMatch(/virtual pet/i);
    expect(readme).toMatch(/npm ci/);
    expect(readme).toMatch(/npm run dev/);
    expect(readme).toMatch(/npm run test/);
    expect(readme).toMatch(/0\.1\.0/);
    expect(readme).toMatch(/docs\/README\.md/);
  });
});

describe('release history (EXEC-P2-001)', () => {
  it('CHANGELOG.md records Unreleased and the release candidate', () => {
    expect(fs.existsSync(path.join(root, 'CHANGELOG.md'))).toBe(true);
    const changelog = read('CHANGELOG.md');

    expect(changelog).toMatch(/## \[Unreleased\]/);
    expect(changelog).toMatch(/## \[0\.1\.0-rc1\]/);
    expect(changelog).toMatch(/99abf29|ce70022/);
  });
});

describe('docs index and reconciliation (INV-P3-001, FINAL-P2-001, FINAL-P2-002)', () => {
  it('docs/README.md classifies the prompt pack and indexes the docs tree', () => {
    expect(fs.existsSync(path.join(root, 'docs', 'README.md'))).toBe(true);
    const docs = read(path.join('docs', 'README.md'));

    expect(docs).toMatch(/prompt pack/i);
    expect(docs).toMatch(/SUPPLY-P2-003/);
    expect(docs).toMatch(/buddy\/reports\/phases/);
  });

  it('carries the phase-report reconciliation status matrix', () => {
    const docs = read(path.join('docs', 'README.md'));

    expect(docs).toMatch(/FINAL-P2-001/);
    expect(docs).toMatch(/None/);
    expect(docs).toMatch(/FEAT-P1-001/);
    expect(docs).toMatch(/EXEC-P2-001/);
  });

  it('carries an accepted/deferred-risk record with an owner and date', () => {
    const docs = read(path.join('docs', 'README.md'));

    expect(docs).toMatch(/FINAL-P2-002/);
    expect(docs).toMatch(/Accepted and deferred risks/);
    expect(docs).toMatch(/Owner/);
    expect(docs).toMatch(/\d{4}-\d{2}-\d{2}/);
    expect(docs).toMatch(/Deferred|Accepted/);
  });
});
