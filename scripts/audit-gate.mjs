#!/usr/bin/env node
/**
 * Production dependency audit gate.
 *
 * `npm audit --omit=dev` is the source of truth for vulnerability data, but it
 * fails on every severity and cannot express a dated exception. This wrapper:
 *
 *   - blocks HIGH/CRITICAL advisories in the production dependency tree;
 *   - allows a small, explicit, time-boxed exception list (see
 *     `.audit-exceptions.json`) with an owner, a reason, and an exit condition;
 *   - fails closed when the audit cannot be read or an exception is expired.
 *
 * Run `npm run audit:gate` locally and in CI. `--audit-json` is provided so the
 * policy can be tested without network access.
 */
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(SCRIPT_DIR, '..');
const DEFAULT_EXCEPTIONS_PATH = path.join(REPO_ROOT, '.audit-exceptions.json');
const BLOCKING_SEVERITIES = new Set(['high', 'critical']);
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function utcToday(now = new Date()) {
  return now.toISOString().slice(0, 10);
}

function isIsoDate(value) {
  if (typeof value !== 'string' || !DATE_RE.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(parsed.getTime()) && utcToday(parsed) === value;
}

function extractAdvisoryIds(entry) {
  const ids = new Set();
  if (!entry || typeof entry !== 'object') return ids;
  // `url` normally points at https://github.com/advisories/GHSA-...
  // Some npm versions only expose the id in a different field; accept all.
  for (const value of [entry.url, entry.id, entry.ghsa, entry.cve]) {
    if (typeof value !== 'string') continue;
    const ghsa = value.match(/GHSA-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{4}/i);
    if (ghsa) ids.add(ghsa[0].toUpperCase());
    const cve = value.match(/CVE-\d{4}-\d{4,}/i);
    if (cve) ids.add(cve[0].toUpperCase());
  }
  return ids;
}

function describeVia(entry) {
  if (typeof entry === 'string') return entry;
  if (!entry || typeof entry !== 'object') return 'unknown advisory';
  const ids = [...extractAdvisoryIds(entry)];
  return ids.length > 0 ? ids.join(', ') : entry.title || 'unknown advisory';
}

/**
 * Validate and normalize the exception file.
 *
 * Invalid configuration is an error even if no advisory currently matches, so
 * a malformed allowlist cannot silently weaken the gate. Expired entries are
 * also errors: the date is a review deadline, not a suggestion.
 */
export function parseExceptions(input, today = utcToday()) {
  const errors = [];
  const warnings = [];
  const exceptions = [];
  const seen = new Set();

  if (!input || typeof input !== 'object' || !Array.isArray(input.exceptions)) {
    return { errors: ['exception file must contain an "exceptions" array'], warnings, exceptions };
  }

  input.exceptions.forEach((entry, index) => {
    const where = `exceptions[${index}]`;
    if (!entry || typeof entry !== 'object' || Array.isArray(entry)) {
      errors.push(`${where}: must be an object`);
      return;
    }

    const id = typeof entry.id === 'string' ? entry.id.trim().toUpperCase() : '';
    const pkg = typeof entry.package === 'string' ? entry.package.trim() : '';
    const severity = typeof entry.severity === 'string' ? entry.severity.toLowerCase() : '';
    const expires = entry.expires;
    const reason = typeof entry.reason === 'string' ? entry.reason.trim() : '';
    const owner = typeof entry.owner === 'string' ? entry.owner.trim() : '';
    const exitCondition =
      typeof entry.exitCondition === 'string' ? entry.exitCondition.trim() : '';

    if (!/^(GHSA-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}|CVE-\d{4}-\d{4,})$/.test(id)) {
      errors.push(`${where}: "id" must be a GHSA or CVE identifier`);
    }
    if (!pkg) errors.push(`${where}: "package" is required`);
    if (!BLOCKING_SEVERITIES.has(severity)) {
      errors.push(`${where}: "severity" must be high or critical`);
    }
    if (!isIsoDate(expires)) {
      errors.push(`${where}: "expires" must be a real YYYY-MM-DD date`);
    } else if (expires < today) {
      errors.push(
        `${where}: exception for ${pkg || id} expired on ${expires}; fix it or renew the exception with evidence`
      );
    }
    if (!reason) errors.push(`${where}: "reason" is required`);
    if (!owner) errors.push(`${where}: "owner" is required`);
    if (!exitCondition) errors.push(`${where}: "exitCondition" is required`);

    const key = `${pkg}@${id}`;
    if (seen.has(key)) errors.push(`${where}: duplicate exception ${key}`);
    seen.add(key);

    exceptions.push({ id, package: pkg, severity, expires, reason, owner, exitCondition });
  });

  return { errors, warnings, exceptions };
}

/**
 * Evaluate an `npm audit --json --omit=dev` report against parsed exceptions.
 *
 * A high/critical package is allowed only when every advisory `via` entry for
 * that package has an exact package + advisory-id exception whose severity
 * matches. A package reported only through a string `via` (a transitive edge
 * without its own advisory metadata) is treated as unexempted.
 */
export function evaluateAudit(report, exceptions, today = utcToday()) {
  const failures = [];
  const warnings = [];
  const allowed = [];
  const used = new Set();

  if (!report || typeof report !== 'object' || typeof report.vulnerabilities !== 'object') {
    return {
      failures: ['npm audit report is missing the "vulnerabilities" object'],
      warnings,
      allowed,
      used,
    };
  }

  const vulnerable = Object.values(report.vulnerabilities).filter(Boolean);
  const blocking = vulnerable.filter((entry) =>
    BLOCKING_SEVERITIES.has(String(entry.severity).toLowerCase())
  );
  const counts = report.metadata?.vulnerabilities ?? {};
  const reportedBlocking = Number(counts.high ?? 0) + Number(counts.critical ?? 0);
  if (reportedBlocking > blocking.length) {
    failures.push(
      `npm audit metadata reports ${reportedBlocking} high/critical advisor${reportedBlocking === 1 ? 'y' : 'ies'} ` +
        `but only ${blocking.length} could be inspected; refusing to pass an incomplete report`
    );
  }

  for (const entry of blocking) {
    const pkg = String(entry.name || entry.dependency || 'unknown');
    const via = Array.isArray(entry.via) ? entry.via : [];
    const advisories = via.filter((item) => item && typeof item === 'object');
    const stringEdges = via.filter((item) => typeof item === 'string');

    if (advisories.length === 0) {
      failures.push(
        `${pkg} (${entry.severity}) has no advisory metadata` +
          (stringEdges.length > 0 ? `; it is pulled in by ${stringEdges.join(', ')}` : '')
      );
      continue;
    }

    for (const advisory of advisories) {
      const ids = [...extractAdvisoryIds(advisory)];
      const match = exceptions.find(
        (exception) =>
          exception.package === pkg &&
          ids.includes(exception.id) &&
          exception.severity === String(entry.severity).toLowerCase()
      );

      if (match) {
        used.add(`${match.package}@${match.id}`);
        allowed.push(`${pkg} ${ids.join('/')} (expires ${match.expires})`);
      } else {
        const label = ids.length > 0 ? ids.join('/') : describeVia(advisory);
        const fix = entry.fixAvailable;
        const fixHint =
          fix && typeof fix === 'object' && fix.name
            ? `; fixed in ${fix.name}@${fix.version}${fix.isSemVerMajor ? ' (major)' : ''}`
            : '';
        failures.push(`${pkg} (${entry.severity}) ${label}${fixHint}`);
      }
    }
  }

  for (const exception of exceptions) {
    if (!used.has(`${exception.package}@${exception.id}`)) {
      warnings.push(
        `unused exception ${exception.package}@${exception.id} (expires ${exception.expires})`
      );
    }
  }

  return { failures, warnings, allowed, used, counts };
}

function parseArgs(argv) {
  const options = {
    auditJson: null,
    exceptionsPath: DEFAULT_EXCEPTIONS_PATH,
    today: utcToday(),
    help: false,
  };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--help' || arg === '-h') {
      options.help = true;
    } else if (arg === '--audit-json') {
      options.auditJson = argv[(i += 1)];
    } else if (arg === '--exceptions') {
      options.exceptionsPath = argv[(i += 1)];
    } else if (arg === '--today') {
      options.today = argv[(i += 1)];
    } else {
      options.error = `unknown argument: ${arg}`;
      break;
    }
  }
  return options;
}

function runNpmAudit() {
  const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
  const result = spawnSync(npm, ['audit', '--omit=dev', '--json'], {
    cwd: REPO_ROOT,
    encoding: 'utf8',
    maxBuffer: 32 * 1024 * 1024,
  });

  if (result.error) {
    return { error: `failed to run npm audit: ${result.error.message}` };
  }

  if (!result.stdout || result.stdout.trim() === '') {
    return {
      error: `npm audit produced no JSON (exit ${result.status})${result.stderr ? `: ${result.stderr.trim()}` : ''}`,
    };
  }

  try {
    return { report: JSON.parse(result.stdout), status: result.status };
  } catch (error) {
    return { error: `could not parse npm audit JSON: ${error.message}` };
  }
}

function printHelp() {
  process.stdout.write(
    [
      'Usage: node scripts/audit-gate.mjs [options]',
      '',
      'Blocks HIGH/CRITICAL production advisories, except dated entries in',
      '.audit-exceptions.json.',
      '',
      'Options:',
      '  --audit-json <path>   read an existing npm audit report instead of running npm',
      '  --exceptions <path>   exception file (default: .audit-exceptions.json)',
      '  --today <YYYY-MM-DD>  evaluation date for exception expiry',
      '  -h, --help            show this help',
    ].join('\n') + '\n'
  );
}

export function main(argv = process.argv.slice(2)) {
  const options = parseArgs(argv);
  if (options.error) {
    process.stderr.write(`${options.error}\n`);
    return 2;
  }
  if (options.help) {
    printHelp();
    return 0;
  }
  if (options.today && !isIsoDate(options.today)) {
    process.stderr.write(`invalid --today date: ${options.today}\n`);
    return 2;
  }
  if (!options.exceptionsPath || !existsSync(options.exceptionsPath)) {
    process.stderr.write(`exception file not found: ${options.exceptionsPath}\n`);
    return 2;
  }

  let exceptionFile;
  try {
    exceptionFile = JSON.parse(readFileSync(options.exceptionsPath, 'utf8'));
  } catch (error) {
    process.stderr.write(`could not read ${options.exceptionsPath}: ${error.message}\n`);
    return 2;
  }

  const parsed = parseExceptions(exceptionFile, options.today);
  if (parsed.errors.length > 0) {
    process.stderr.write('Audit exception configuration is invalid:\n');
    for (const error of parsed.errors) process.stderr.write(`  - ${error}\n`);
    return 2;
  }

  let report;
  if (options.auditJson) {
    try {
      report = JSON.parse(readFileSync(options.auditJson, 'utf8'));
    } catch (error) {
      process.stderr.write(`could not read ${options.auditJson}: ${error.message}\n`);
      return 2;
    }
  } else {
    const audit = runNpmAudit();
    if (audit.error) {
      process.stderr.write(`${audit.error}\n`);
      return 2;
    }
    report = audit.report;
  }

  const result = evaluateAudit(report, parsed.exceptions, options.today);
  for (const warning of [...parsed.warnings, ...result.warnings]) {
    process.stderr.write(`warning: ${warning}\n`);
  }
  for (const item of result.allowed) {
    process.stdout.write(`allowlisted: ${item}\n`);
  }

  if (result.failures.length > 0) {
    process.stderr.write('Production dependency audit gate failed:\n');
    for (const failure of result.failures) process.stderr.write(`  - ${failure}\n`);
    process.stderr.write('Fix the advisory, or add a dated owner-approved exception.\n');
    return 1;
  }

  const counts = result.counts || {};
  process.stdout.write(
    `Production dependency audit gate passed (${counts.high ?? 0} high, ` +
      `${counts.critical ?? 0} critical, ${counts.total ?? 0} total; ` +
      `${result.allowed.length} allowlisted).\n`
  );
  return 0;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  process.exitCode = main();
}
