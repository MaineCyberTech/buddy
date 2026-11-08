#!/usr/bin/env node
/**
 * Replace the CSP `'unsafe-inline'` placeholders with hashes of the inline
 * scripts/styles that Next.js actually emitted into the prerendered HTML.
 *
 * Why a post-build step: a nonce requires per-request dynamic rendering, but
 * this is an offline-first PWA whose pages are statically prerendered and
 * cached by the service worker. A hash policy keeps the static/offline model
 * while removing inline-script execution as an XSS primitive. The generated
 * `routes-manifest.json` is what `next start` and the standalone server send,
 * so both copies are patched.
 *
 * If the build output changes shape, this script fails instead of silently
 * leaving `'unsafe-inline'` in place.
 */
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(SCRIPT_DIR, '..');
const NEXT_DIR = path.join(REPO_ROOT, '.next');

function walkHtml(dir, files = []) {
  if (!existsSync(dir)) return files;
  for (const entry of readdirSync(dir)) {
    const full = path.join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) walkHtml(full, files);
    else if (entry.endsWith('.html')) files.push(full);
  }
  return files;
}

function hash(value) {
  return createHash('sha256').update(value, 'utf8').digest('base64');
}

/** Extract SHA-256 hashes for inline scripts and styles from HTML. */
export function extractHashes(html) {
  const scripts = new Set();
  const styles = new Set();
  for (const match of html.matchAll(/<script\b(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi)) {
    scripts.add(hash(match[1]));
  }
  for (const match of html.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi)) {
    styles.add(hash(match[1]));
  }
  return { scripts: [...scripts], styles: [...styles] };
}

/** Replace the `'unsafe-inline'` script/style placeholders with hashes. */
export function hardenCsp(csp, hashes) {
  if (!csp.includes("script-src 'self' 'unsafe-inline'")) {
    throw new Error("CSP does not contain the expected script-src 'self' 'unsafe-inline' placeholder");
  }
  if (!csp.includes("style-src 'self' 'unsafe-inline'")) {
    throw new Error("CSP does not contain the expected style-src 'self' 'unsafe-inline' placeholder");
  }

  const scriptHashes = hashes.scripts.map((value) => `'sha256-${value}'`).join(' ');
  const styleHashes = hashes.styles.map((value) => `'sha256-${value}'`).join(' ');

  let hardened = csp.replace(
    "script-src 'self' 'unsafe-inline'",
    `script-src 'self'${scriptHashes ? ` ${scriptHashes}` : ''}`
  );
  hardened = hardened.replace(
    "style-src 'self' 'unsafe-inline'",
    `style-src 'self'${styleHashes ? ` ${styleHashes}` : ''}`
  );
  if (!/(^|;\s*)script-src-attr\s/.test(hardened)) {
    hardened += "; script-src-attr 'none'";
  }
  if (!/(^|;\s*)style-src-attr\s/.test(hardened)) {
    hardened += "; style-src-attr 'unsafe-inline'";
  }
  return hardened;
}

function patchManifest(manifestPath, hardened) {
  if (!existsSync(manifestPath)) return false;
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
  let changed = false;
  for (const route of manifest.headers ?? []) {
    for (const header of route.headers ?? []) {
      if (header.key.toLowerCase() === 'content-security-policy') {
        header.value = hardened;
        changed = true;
      }
    }
  }
  if (changed) writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
  return changed;
}

export function main() {
  if (!existsSync(NEXT_DIR)) {
    process.stderr.write('CSP finalization requires a completed .next build.\n');
    return 1;
  }

  const htmlFiles = [
    ...walkHtml(path.join(NEXT_DIR, 'server', 'app')),
    ...walkHtml(path.join(NEXT_DIR, 'server', 'route-cache')),
    ...walkHtml(path.join(NEXT_DIR, 'server', 'pages')),
  ];
  if (htmlFiles.length === 0) {
    process.stderr.write('CSP finalization found no prerendered HTML to hash.\n');
    return 1;
  }

  const scripts = new Set();
  const styles = new Set();
  for (const file of htmlFiles) {
    const hashes = extractHashes(readFileSync(file, 'utf8'));
    for (const value of hashes.scripts) scripts.add(value);
    for (const value of hashes.styles) styles.add(value);
  }

  // The source config is only available as the generated manifest value at
  // this point; `next build` has already resolved it.
  const primaryManifest = path.join(NEXT_DIR, 'routes-manifest.json');
  if (!existsSync(primaryManifest)) {
    process.stderr.write('CSP finalization could not find .next/routes-manifest.json.\n');
    return 1;
  }
  const manifest = JSON.parse(readFileSync(primaryManifest, 'utf8'));
  const route = (manifest.headers ?? []).find((item) =>
    (item.headers ?? []).some(
      (header) =>
        header.key.toLowerCase() === 'content-security-policy' &&
        header.value.includes("script-src 'self' 'unsafe-inline'")
    )
  );
  const cspHeader = route?.headers.find(
    (header) => header.key.toLowerCase() === 'content-security-policy'
  );
  if (!cspHeader) {
    process.stderr.write('CSP finalization could not find the generated Content-Security-Policy header.\n');
    return 1;
  }

  const hardened = hardenCsp(cspHeader.value, {
    scripts: [...scripts],
    styles: [...styles],
  });

  const targets = [
    primaryManifest,
    path.join(NEXT_DIR, 'standalone', '.next', 'routes-manifest.json'),
  ];
  let patched = 0;
  for (const target of targets) {
    if (patchManifest(target, hardened)) patched += 1;
  }
  if (patched === 0) {
    process.stderr.write('CSP finalization did not patch any routes manifest.\n');
    return 1;
  }

  process.stdout.write(
    `CSP finalized: ${scripts.size} inline script hash(es), ${styles.size} inline style hash(es), ` +
      `${patched} manifest(s) patched.\n`
  );
  return 0;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  process.exitCode = main();
}
