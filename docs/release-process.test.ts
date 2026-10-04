import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

// Documentation test for FINAL-P1-001: the repository must define a release process
// that binds artifacts to a commit. The release workflow carries the build id
// (full commit SHA), SBOM, changelog, and provenance attestation; the doc records
// the process and how to verify an artifact's commit. This is the suggested
// validation until a real tagged release produces the binding artifact.
const docPath = path.join(process.cwd(), 'docs', 'release-process.md');
const workflowPath = path.join(process.cwd(), '.github', 'workflows', 'release.yml');

describe('release process binds artifacts to a commit', () => {
  it('documents a tag-driven release process', () => {
    expect(fs.existsSync(docPath)).toBe(true);
    const doc = fs.readFileSync(docPath, 'utf8');

    expect(doc).toMatch(/FINAL-P1-001/);
    expect(doc).toMatch(/tag-driven/i);
    expect(doc).toMatch(/release\.yml/);
  });

  it('records the build id as the commit SHA and generates an SBOM and changelog', () => {
    const doc = fs.readFileSync(docPath, 'utf8');

    expect(doc).toMatch(/build id/i);
    expect(doc).toMatch(/git rev-parse HEAD|full commit SHA/i);
    expect(doc).toMatch(/SBOM/i);
    expect(doc).toMatch(/CHANGELOG-RELEASE\.md/);
    expect(doc).toMatch(/attest-build-provenance/);
  });

  it('ships a release workflow triggered by version tags', () => {
    expect(fs.existsSync(workflowPath)).toBe(true);
    const workflow = fs.readFileSync(workflowPath, 'utf8');

    expect(workflow).toMatch(/tags:\s*\n\s*-\s*"v\*"/);
    expect(workflow).toMatch(/npm run build/);
    expect(workflow).toMatch(/git rev-parse HEAD/);
    expect(workflow).toMatch(/npm sbom/);
    expect(workflow).toMatch(/attest-build-provenance/);
    expect(workflow).toMatch(/softprops\/action-gh-release/);
  });
});
