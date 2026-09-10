import { describe, expect, it } from 'vitest';
import { getOperationsSummary, getPolicyOperationEvents } from './operationsMonitoringApi';

describe('operationsMonitoringApi', () => {
  it('loads the scoped operations summary with an explicit window', async () => {
    await expect(getOperationsSummary(360, 'AI')).resolves.toMatchObject({
      schemaVersion: 'adp-operations-summary/v2',
      windowMinutes: 360,
      scope: { requestedExecutionPack: 'AI', defaultSemantics: 'REQUESTED_EXECUTION_PACK' },
      runtime: { total: 12, completed: 8 },
      recovery: { backlog: 2, staleOperations: 1 },
      policy: { currentSelections: 2, driftedSelections: 0 },
      security: { deniedAttempts: 2 },
    });
  });

  it('passes policy event filters and pagination to the read model', async () => {
    await expect(getPolicyOperationEvents({
      executionPack: 'AI',
      workloadId: 'settlement_reconciliation',
      category: 'LIFECYCLE_TRANSITION',
      from: '2026-09-08T00:00:00Z',
      to: '2026-09-09T00:00:00Z',
      page: 2,
      size: 20,
    })).resolves.toMatchObject({
      page: 2,
      size: 20,
      total: 1,
      items: [{
        category: 'LIFECYCLE_TRANSITION',
        workloadId: 'settlement_reconciliation',
      }],
    });
  });
});
