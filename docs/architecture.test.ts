import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

// Documentation test for ARCH-P1-001: the architecture doc must state the guest-only
// trust model and the server-authority requirement for account mode. This is the
// suggested validation until a server-side save validator exists.
const docPath = path.join(process.cwd(), 'docs', 'architecture.md');

describe('architecture trust model documentation', () => {
  it('documents the client-authoritative, guest-only trust model', () => {
    expect(fs.existsSync(docPath)).toBe(true);
    const doc = fs.readFileSync(docPath, 'utf8');

    expect(doc).toMatch(/client[- ]authoritative/i);
    expect(doc).toMatch(/guest-only/i);
    expect(doc).toMatch(/no backend/i);
    expect(doc).toMatch(/user-editable/i);
  });

  it('requires a server trust boundary before account/cloud features', () => {
    const doc = fs.readFileSync(docPath, 'utf8');

    expect(doc).toMatch(/trust boundary/i);
    expect(doc).toMatch(/save envelope/i);
    expect(doc).toMatch(/security-economy-authority\.md/);
  });
});
