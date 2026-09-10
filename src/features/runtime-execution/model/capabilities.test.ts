import { describe, expect, it } from 'vitest';
import { hasRuntimeExecutionRole } from './capabilities';

describe('runtime execution capabilities', () => {
  it('allows local harness execution only for operational user roles', () => {
    expect(hasRuntimeExecutionRole(['OPERATOR'])).toBe(true);
    expect(hasRuntimeExecutionRole(['DEVELOPER'])).toBe(true);
    expect(hasRuntimeExecutionRole(['PRIVILEGED_OPERATOR'])).toBe(false);
    expect(hasRuntimeExecutionRole(['AUDITOR'])).toBe(false);
    expect(hasRuntimeExecutionRole(undefined)).toBe(false);
  });
});
