import { describe, expect, it } from 'vitest';
import { evaluateAudit, parseExceptions } from './audit-gate.mjs';

const TODAY = '2026-11-08';

function exception(overrides: Record<string, unknown> = {}) {
  return {
    id: 'GHSA-AAAA-BBBB-CCCC',
    package: 'example-package',
    severity: 'high',
    expires: '2026-12-31',
    owner: 'maintainer',
    reason: 'bounded exposure described in the test',
    exitCondition: 'upgrade to the fixed major and remove this entry',
    ...overrides,
  };
}

function report(vulnerabilities: Record<string, unknown>, counts = {}) {
  return {
    auditReportVersion: 2,
    vulnerabilities,
    metadata: {
      vulnerabilities: {
        info: 0,
        low: 0,
        moderate: 0,
        high: 0,
        critical: 0,
        total: 0,
        ...counts,
      },
    },
  };
}

function via(id = 'GHSA-AAAA-BBBB-CCCC', severity = 'high') {
  return {
    source: 1,
    name: 'example-package',
    dependency: 'example-package',
    title: 'test advisory',
    url: `https://github.com/advisories/${id}`,
    severity,
    range: '<2.0.0',
  };
}

function vulnerable(packageName: string, severity: string, entry: unknown) {
  return {
    name: packageName,
    severity,
    isDirect: true,
    via: [entry],
    effects: [],
    range: '<2.0.0',
    nodes: [`node_modules/${packageName}`],
    fixAvailable: { name: packageName, version: '2.0.0', isSemVerMajor: true },
  };
}

describe('parseExceptions', () => {
  it('accepts a complete, unexpired, blocking-severity exception', () => {
    const result = parseExceptions({ exceptions: [exception()] }, TODAY);
    expect(result.errors).toEqual([]);
    expect(result.exceptions).toHaveLength(1);
  });

  it('rejects an expired exception', () => {
    const result = parseExceptions(
      { exceptions: [exception({ expires: '2026-12-15' })] },
      '2026-12-16'
    );
    expect(result.errors.join('\n')).toContain('expired on 2026-12-15');
  });

  it('requires the owner, reason, exit condition and a GHSA/CVE id', () => {
    const result = parseExceptions(
      {
        exceptions: [
          {
            id: 'not-an-advisory',
            package: '',
            severity: 'moderate',
            expires: 'tomorrow',
          },
        ],
      },
      TODAY
    );
    const errors = result.errors.join('\n');
    expect(errors).toContain('GHSA or CVE');
    expect(errors).toContain('"package" is required');
    expect(errors).toContain('high or critical');
    expect(errors).toContain('real YYYY-MM-DD');
    expect(errors).toContain('"reason" is required');
    expect(errors).toContain('"owner" is required');
    expect(errors).toContain('"exitCondition" is required');
  });

  it('rejects duplicate package/advisory pairs', () => {
    const result = parseExceptions(
      { exceptions: [exception(), exception()] },
      TODAY
    );
    expect(result.errors.join('\n')).toContain('duplicate exception');
  });
});

describe('evaluateAudit', () => {
  it('passes a clean production report', () => {
    const result = evaluateAudit(report({}), [], TODAY);
    expect(result.failures).toEqual([]);
  });

  it('fails on an unallowlisted high advisory', () => {
    const result = evaluateAudit(
      report(
        { 'example-package': vulnerable('example-package', 'high', via()) },
        { high: 1, total: 1 }
      ),
      [],
      TODAY
    );
    expect(result.failures).toEqual([
      expect.stringContaining('example-package (high) GHSA-AAAA-BBBB-CCCC'),
    ]);
  });

  it('passes when the exact package/advisory/severity is allowlisted', () => {
    const parsed = parseExceptions({ exceptions: [exception()] }, TODAY);
    const result = evaluateAudit(
      report(
        { 'example-package': vulnerable('example-package', 'high', via()) },
        { high: 1, total: 1 }
      ),
      parsed.exceptions,
      TODAY
    );
    expect(result.failures).toEqual([]);
    expect(result.allowed).toHaveLength(1);
    expect(result.warnings).toEqual([]);
  });

  it('does not let an exception for another package or severity through', () => {
    const otherPackage = parseExceptions(
      { exceptions: [exception({ package: 'other-package' })] },
      TODAY
    );
    const wrongSeverity = parseExceptions(
      { exceptions: [exception({ severity: 'high' })] },
      TODAY
    );
    const criticalReport = report(
      { 'example-package': vulnerable('example-package', 'critical', via(undefined, 'critical')) },
      { critical: 1, total: 1 }
    );

    expect(
      evaluateAudit(
        report({ 'example-package': vulnerable('example-package', 'high', via()) }),
        otherPackage.exceptions,
        TODAY
      ).failures
    ).toHaveLength(1);
    expect(evaluateAudit(criticalReport, wrongSeverity.exceptions, TODAY).failures).toHaveLength(1);
  });

  it('requires every advisory on a package to be allowlisted', () => {
    const parsed = parseExceptions({ exceptions: [exception()] }, TODAY);
    const reportWithTwo = report({
      'example-package': {
        ...vulnerable('example-package', 'high', via()),
        via: [via(), via('GHSA-DDDD-EEEE-FFFF')],
      },
    });
    const result = evaluateAudit(reportWithTwo, parsed.exceptions, TODAY);
    expect(result.failures).toHaveLength(1);
    expect(result.failures[0]).toContain('GHSA-DDDD-EEEE-FFFF');
  });

  it('fails closed on a string-only via edge', () => {
    const result = evaluateAudit(
      report({
        'parent-package': {
          ...vulnerable('parent-package', 'high', 'child-package'),
        },
      }),
      [],
      TODAY
    );
    expect(result.failures[0]).toContain('no advisory metadata');
    expect(result.failures[0]).toContain('child-package');
  });

  it('ignores moderate and low advisories', () => {
    const result = evaluateAudit(
      report({
        'example-package': vulnerable('example-package', 'moderate', via(undefined, 'moderate')),
      }),
      [],
      TODAY
    );
    expect(result.failures).toEqual([]);
  });

  it('warns about an exception that no current advisory uses', () => {
    const parsed = parseExceptions({ exceptions: [exception()] }, TODAY);
    const result = evaluateAudit(report({}), parsed.exceptions, TODAY);
    expect(result.failures).toEqual([]);
    expect(result.warnings[0]).toContain('unused exception');
  });

  it('fails closed on a malformed audit report', () => {
    const result = evaluateAudit({}, [], TODAY);
    expect(result.failures[0]).toContain('missing the "vulnerabilities" object');
  });

  it('fails closed when metadata counts exceed the inspectable advisories', () => {
    const result = evaluateAudit(report({}, { high: 1, total: 1 }), [], TODAY);
    expect(result.failures[0]).toContain('refusing to pass an incomplete report');
  });
});
