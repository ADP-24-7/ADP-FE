import { describe, expect, it } from 'vitest';
import { getExecutionEvidence, searchAuditExecutions } from './auditReadApi';

describe('auditReadApi', () => {
  it('reads the institution-scoped audit page', async () => {
    await expect(searchAuditExecutions({ size: 20 })).resolves.toMatchObject({ items: [], totalElements: 0 });
  });

  it('passes workload, status, time range, and pagination search conditions', async () => {
    const result = await searchAuditExecutions({
      workloadId: 'tokenized_asset_purchase',
      status: 'EXTERNALLY_RECONCILED',
      from: '2026-09-08T00:00:00Z',
      to: '2026-09-09T00:00:00Z',
      page: 0,
      size: 20,
    });

    expect(result).toMatchObject({
      totalElements: 1,
      items: [{ workloadId: 'tokenized_asset_purchase', status: 'EXTERNALLY_RECONCILED' }],
    });
  });

  it('reads a digest-only evidence pack by execution id', async () => {
    await expect(getExecutionEvidence('exec-contract')).resolves.toMatchObject({
      schemaVersion: 'adp-execution-evidence/v1',
      executionId: 'exec-contract',
    });
  });
});
