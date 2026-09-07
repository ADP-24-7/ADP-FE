import { describe, expect, it } from 'vitest';
import { getExecutionEvidence, searchAuditExecutions } from './auditReadApi';

describe('auditReadApi', () => {
  it('reads the institution-scoped audit page', async () => {
    await expect(searchAuditExecutions({ size: 20 })).resolves.toMatchObject({ items: [], totalElements: 0 });
  });

  it('reads a digest-only evidence pack by execution id', async () => {
    await expect(getExecutionEvidence('exec-contract')).resolves.toMatchObject({
      schemaVersion: 'adp-execution-evidence/v1',
      executionId: 'exec-contract',
    });
  });
});
