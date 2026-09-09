import { describe, expect, it } from 'vitest';
import { getRecoveryIncident, getRecoveryIncidents, runRecoveryCommand } from './recoveryOperationsApi';

describe('recoveryOperationsApi', () => {
  it('loads a filtered incident page and privacy-safe detail', async () => {
    await expect(getRecoveryIncidents({ status: 'PENDING', page: 0, size: 20 })).resolves.toMatchObject({
      totalElements: 1,
      items: [{ recoveryId: 'recovery-contract', retryDisposition: 'RECONCILE_FIRST' }],
    });
    await expect(getRecoveryIncident('recovery-contract')).resolves.toMatchObject({
      recoveryId: 'recovery-contract',
      connectorExecutionId: 'connector-execution-contract',
      operations: [],
    });
  });

  it('sends an idempotent operation ID to each typed command endpoint', async () => {
    await expect(runRecoveryCommand('recovery-contract', 'RECONCILE', 'op_reconcile_contract')).resolves.toMatchObject({
      operationId: 'op_reconcile_contract',
      operationType: 'RECONCILE',
      replayed: false,
    });
    await expect(runRecoveryCommand('recovery-contract', 'RETRY', 'op_retry_contract')).resolves.toMatchObject({
      operationType: 'RETRY',
    });
    await expect(runRecoveryCommand('recovery-contract', 'MARK_REVIEW', 'op_review_contract')).resolves.toMatchObject({
      operationType: 'MARK_REVIEW',
      recoveryStatus: 'MANUAL_REVIEW',
    });
  });
});
