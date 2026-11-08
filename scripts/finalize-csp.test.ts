import { describe, expect, it } from 'vitest';
import { extractHashes, hardenCsp } from './finalize-csp.mjs';

describe('extractHashes', () => {
  it('hashes inline scripts and styles but ignores external script tags', () => {
    const hashes = extractHashes(
      [
        '<script src="/_next/static/app.js"></script>',
        '<script>self.__next_f.push([1,"payload"])</script>',
        '<style>body{color:red}</style>',
      ].join('')
    );

    expect(hashes.scripts).toHaveLength(1);
    expect(hashes.styles).toHaveLength(1);
    expect(hashes.scripts[0]).toMatch(/^[A-Za-z0-9+/]+=*$/);
  });

  it('deduplicates identical inline scripts', () => {
    const hashes = extractHashes('<script>x()</script><script>x()</script>');
    expect(hashes.scripts).toHaveLength(1);
  });
});

describe('hardenCsp', () => {
  const source =
    "default-src 'self'; script-src 'self' 'unsafe-inline'; " +
    "style-src 'self' 'unsafe-inline'; img-src 'self'";

  it('replaces inline placeholders with hashes and keeps style attributes explicit', () => {
    const hardened = hardenCsp(source, { scripts: ['script-hash'], styles: ['style-hash'] });
    expect(hardened).toContain("script-src 'self' 'sha256-script-hash'");
    expect(hardened).toContain("style-src 'self' 'sha256-style-hash'");
    expect(hardened).not.toContain("script-src 'self' 'unsafe-inline'");
    expect(hardened).not.toContain("style-src 'self' 'unsafe-inline'");
    expect(hardened).toContain("script-src-attr 'none'");
    expect(hardened).toContain("style-src-attr 'unsafe-inline'");
  });

  it('removes unsafe-inline even when a page has no inline assets', () => {
    const hardened = hardenCsp(source, { scripts: [], styles: [] });
    expect(hardened).toContain("script-src 'self';");
    expect(hardened).toContain("style-src 'self';");
  });

  it('fails closed if the generated policy has an unexpected shape', () => {
    expect(() => hardenCsp("default-src 'self'", { scripts: [], styles: [] })).toThrow(
      /expected script-src/
    );
  });
});
