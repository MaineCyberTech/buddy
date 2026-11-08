#!/usr/bin/env node
/**
 * Production dependency license policy.
 *
 * This is intentionally small and dependency-free: it reads the installed
 * production tree (`npm ls --omit=dev --all --long --json`), evaluates each
 * package's SPDX license expression against a reviewed allowlist, and fails on
 * anything that has not been approved. CI and the release workflow call the
 * same script so they cannot drift.
 *
 * The allowlist is deliberately explicit. A new license must be reviewed and
 * added here with a comment explaining why it is acceptable for a proprietary,
 * guest-only application. GPL/AGPL/SSPL-style copyleft is not allowed.
 */
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(SCRIPT_DIR, '..');

/**
 * Reviewed allowlist.
 *
 * - LGPL-3.0-or-later: the sharp/libvips optional image binaries are dynamically
 *   linked and unmodified; the app uses `images.unoptimized`, so no image
 *   pipeline output is distributed. Re-review if sharp becomes a hard runtime
 *   dependency or is patched.
 * - CC-BY-4.0: caniuse-lite data, used at build time with attribution retained
 *   by the package's own license notice.
 */
const ALLOWED = new Set([
  '0BSD',
  'Apache-2.0',
  'BSD-2-Clause',
  'BSD-3-Clause',
  'BlueOak-1.0.0',
  'CC0-1.0',
  'CC-BY-4.0',
  'ISC',
  'LGPL-3.0-or-later',
  'MIT',
  'MIT-0',
  'Python-2.0',
  'Unlicense',
  'Zlib',
]);

const COPYLEFT_DENY = /^(A?GPL-|SSPL-|BUSL-|Commons-Clause|OSL-|EPL-|CPAL-|EUPL-)/i;

function tokenize(expression) {
  const tokens = [];
  const re = /\s*(\(|\)|\bAND\b|\bOR\b|\bWITH\b|[A-Za-z0-9.+-]+)\s*/gy;
  let match;
  while ((match = re.exec(expression)) !== null) {
    if (match.index === re.lastIndex) re.lastIndex += 1;
    tokens.push(match[1]);
  }
  return tokens;
}

/**
 * Evaluate a simple SPDX expression: identifiers, AND, OR, parentheses.
 * `WITH` exceptions are treated as part of the following identifier (e.g.
 * "GPL-2.0-only WITH Classpath-exception-2.0" stays a single denied token).
 */
export function isAllowedLicense(expression, allowed = ALLOWED) {
  if (typeof expression !== 'string' || expression.trim() === '') return false;
  const source = expression.trim();
  if (/^SEE LICEN[CS]E IN /i.test(source) || /^UNLICENSED$/i.test(source)) return false;

  const tokens = tokenize(source);
  let index = 0;

  function parseOr() {
    let value = parseAnd();
    while (tokens[index] === 'OR') {
      index += 1;
      const right = parseAnd();
      value = value || right;
    }
    return value;
  }

  function parseAnd() {
    let value = parsePrimary();
    while (tokens[index] === 'AND') {
      index += 1;
      const right = parsePrimary();
      value = value && right;
    }
    return value;
  }

  function parsePrimary() {
    const token = tokens[index];
    if (token === undefined) return false;
    if (token === '(') {
      index += 1;
      const value = parseOr();
      if (tokens[index] !== ')') return false;
      index += 1;
      return value;
    }
    if (token === ')') return false;
    index += 1;

    let identifier = token;
    if (tokens[index] === 'WITH') {
      index += 1;
      identifier += ` WITH ${tokens[index] ?? ''}`;
      index += 1;
    }
    if (COPYLEFT_DENY.test(identifier)) return false;
    return allowed.has(identifier);
  }

  const result = parseOr();
  return result && index === tokens.length;
}

function collectLicenses(tree, trail = [], found = new Map()) {
  if (!tree || typeof tree !== 'object') return found;
  for (const [name, node] of Object.entries(tree.dependencies || {})) {
    if (!node || typeof node !== 'object') continue;
    const nextTrail = [...trail, name];
    if (node.version) {
      const key = `${name}@${node.version}`;
      if (!found.has(key)) {
        found.set(key, {
          name,
          version: node.version,
          license: node.license ?? node.licenses ?? '',
          trail: nextTrail.join(' > '),
        });
      }
    }
    collectLicenses(node, nextTrail, found);
  }
  return found;
}

function readTree() {
  const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
  const result = spawnSync(npm, ['ls', '--omit=dev', '--all', '--long', '--json'], {
    cwd: REPO_ROOT,
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
  });
  if (result.error) throw new Error(`failed to run npm ls: ${result.error.message}`);
  if (!result.stdout || result.stdout.trim() === '') {
    throw new Error(`npm ls produced no JSON${result.stderr ? `: ${result.stderr.trim()}` : ''}`);
  }
  return JSON.parse(result.stdout);
}

function main(argv = process.argv.slice(2)) {
  let tree;
  const treeIndex = argv.indexOf('--tree-json');
  try {
    if (treeIndex !== -1) {
      const file = argv[treeIndex + 1];
      if (!file) throw new Error('--tree-json requires a path');
      tree = JSON.parse(readFileSync(file, 'utf8'));
    } else {
      tree = readTree();
    }
  } catch (error) {
    process.stderr.write(`License policy could not read the production tree: ${error.message}\n`);
    return 2;
  }

  const found = collectLicenses(tree);
  const failures = [];
  const licenseCounts = new Map();

  for (const pkg of [...found.values()].sort((a, b) => a.name.localeCompare(b.name))) {
    const license = String(pkg.license || '').trim();
    const key = license || '(missing)';
    licenseCounts.set(key, (licenseCounts.get(key) ?? 0) + 1);
    if (!isAllowedLicense(license)) {
      failures.push(`${pkg.name}@${pkg.version}: ${key}`);
    }
  }

  if (failures.length > 0) {
    process.stderr.write('License policy failed for production dependencies:\n');
    for (const failure of failures) process.stderr.write(`  - ${failure}\n`);
    process.stderr.write('Review the license and add an explicit allowlist entry if approved.\n');
    return 1;
  }

  const summary = [...licenseCounts.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([license, count]) => `${license}: ${count}`)
    .join(', ');
  process.stdout.write(
    `License policy passed for ${found.size} production packages (${summary}).\n`
  );
  return 0;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  process.exitCode = main();
}
