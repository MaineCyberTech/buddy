import { describe, expect, it } from 'vitest';
import { isAllowedLicense } from './license-policy.mjs';

describe('isAllowedLicense', () => {
  it('accepts a reviewed permissive license', () => {
    expect(isAllowedLicense('MIT')).toBe(true);
    expect(isAllowedLicense('Apache-2.0')).toBe(true);
    expect(isAllowedLicense('BSD-3-Clause')).toBe(true);
  });

  it('accepts an OR expression when one branch is allowed', () => {
    expect(isAllowedLicense('(MIT OR GPL-3.0-only)')).toBe(true);
  });

  it('rejects an AND expression when any branch is denied', () => {
    expect(isAllowedLicense('Apache-2.0 AND GPL-3.0-only')).toBe(false);
  });

  it('rejects AGPL/SSPL without an alternative license', () => {
    expect(isAllowedLicense('AGPL-3.0-only')).toBe(false);
    expect(isAllowedLicense('SSPL-1.0')).toBe(false);
  });

  it('rejects missing, empty and unlicensed metadata', () => {
    expect(isAllowedLicense('')).toBe(false);
    expect(isAllowedLicense('UNLICENSED')).toBe(false);
    expect(isAllowedLicense('SEE LICENSE IN LICENSE.txt')).toBe(false);
  });

  it('rejects an unknown license', () => {
    expect(isAllowedLicense('Some-Proprietary-1.0')).toBe(false);
  });
});
