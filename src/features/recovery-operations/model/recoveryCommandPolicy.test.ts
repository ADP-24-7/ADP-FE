import { describe, expect, it } from 'vitest';
import { getRecoveryCommandAvailability } from './recoveryCommandPolicy';
import type { RecoveryIncidentDetail } from './types';

const incident: RecoveryIncidentDetail = {
  recoveryId: 'recovery-contract',
  executionId: 'execution-contract',
  institutionId: 'institution-local',
  workloadId: 'customer-summary',
  purposeCode: 'CUSTOMER_SUPPORT',
  connectorId: 'connector-local',
  connectorExecutionId: 'connector-execution-contract',
  observedStatus: 'SENT_UNKNOWN',
  lastObservedExternalStatus: null,
  recoveryStatus: 'PENDING',
  retryDisposition: 'RECONCILE_FIRST',
  attemptCount: 1,
  maxAttempts: 5,
  nextAttemptAt: null,
  lastErrorCode: null,
  leaseUntil: null,
  lastStatusQueriedAt: null,
  statusQueryEvidenceDigest: null,
  operations: [],
  createdAt: '2026-09-09T00:00:00Z',
  updatedAt: '2026-09-09T00:01:00Z',
};

describe('getRecoveryCommandAvailability', () => {
  it('requires reconciliation before retry when the BE disposition says so', () => {
    const availability = getRecoveryCommandAvailability(incident);

    expect(availability.RECONCILE.enabled).toBe(true);
    expect(availability.RETRY.enabled).toBe(false);
    expect(availability.MARK_REVIEW.enabled).toBe(true);
  });

  it('allows retry only for RETRY_ALLOWED incidents with attempts remaining', () => {
    const availability = getRecoveryCommandAvailability({ ...incident, retryDisposition: 'RETRY_ALLOWED' });

    expect(availability.RETRY.enabled).toBe(true);
  });

  it('disables every command for a reconciled incident', () => {
    const availability = getRecoveryCommandAvailability({ ...incident, recoveryStatus: 'RECONCILED' });

    expect(Object.values(availability).every(({ enabled }) => !enabled)).toBe(true);
  });
});
