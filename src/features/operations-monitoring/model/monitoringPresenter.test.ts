import { describe, expect, it } from 'vitest';
import type { RecoveryIncidentSummary } from '../../recovery-operations';
import type { OperationsSummary } from './types';
import { presentOperationsMonitoring } from './monitoringPresenter';

const summary: OperationsSummary = {
  schemaVersion: 'adp-operations-summary/v1',
  windowMinutes: 60,
  generatedAt: '2026-09-10T00:00:00Z',
  runtime: { total: 8, completed: 5, failed: 1, blocked: 2, reviewRequired: 0 },
  recovery: {
    backlog: 1,
    oldestBacklogAgeSeconds: 180,
    manualReview: 0,
    exhausted: 0,
    completedOperations: 2,
    averageOperationLatencyMillis: 120,
    staleOperations: 0,
    oldestStaleOperationAgeSeconds: null,
  },
  policy: { currentSelections: 1, driftedSelections: 0, activations: 1, rollbacks: 0 },
  security: { deniedAttempts: 2, institutionScopeMismatch: 0, authorizationPolicyDenied: 2 },
};

const sentUnknown: RecoveryIncidentSummary = {
  recoveryId: 'recovery-1',
  executionId: 'execution-1',
  institutionId: 'institution-1',
  workloadId: 'customer_summary',
  purposeCode: 'CUSTOMER_SUPPORT',
  connectorId: 'connector-1',
  observedStatus: 'SENT_UNKNOWN',
  lastObservedExternalStatus: null,
  recoveryStatus: 'PENDING',
  retryDisposition: 'RECONCILE_FIRST',
  attemptCount: 1,
  maxAttempts: 5,
  nextAttemptAt: null,
  lastErrorCode: null,
  createdAt: '2026-09-10T00:00:00Z',
  updatedAt: '2026-09-10T00:01:00Z',
};

describe('presentOperationsMonitoring', () => {
  it('treats policy blocks as normal controls instead of outages', () => {
    const view = presentOperationsMonitoring(summary, []);
    const blocked = view.metrics.find((item) => item.id === 'runtime-blocked');

    expect(blocked).toMatchObject({ state: 'info', stateLabel: '발생 · 관찰', value: '2건' });
    expect(blocked?.impact).toContain('시스템 장애가 아니라');
  });

  it('recommends reconciliation before retry for SENT_UNKNOWN incidents', () => {
    const view = presentOperationsMonitoring(summary, [sentUnknown]);

    expect(view.issues[0]).toMatchObject({ observedStatus: 'SENT_UNKNOWN', retryDisposition: 'RECONCILE_FIRST' });
    expect(view.issues[0].recommendation).toContain('즉시 재전송하지 말고');
    expect(view.issues[0].recommendation).toContain('외부 상태를 먼저 조회');
  });

  it('does not claim a trend when the backend provides no baseline', () => {
    const view = presentOperationsMonitoring(summary, []);
    const failed = view.metrics.find((item) => item.id === 'runtime-failed');

    expect(failed?.impact).toContain('기준선이 제공되지 않아');
    expect(failed?.criterion).toContain('기준선 미제공');
  });

  it('marks unsupported stage summaries as not connected', () => {
    const view = presentOperationsMonitoring(summary, []);

    expect(view.stages.find((item) => item.id === 'data')).toMatchObject({ state: 'unknown', connectionLabel: 'NOT CONNECTED' });
    expect(view.stages.find((item) => item.id === 'response')).toMatchObject({ state: 'unknown', connectionLabel: 'NOT CONNECTED' });
  });

  it('summarizes the highest-priority concrete counts in the brief', () => {
    const view = presentOperationsMonitoring({
      ...summary,
      recovery: { ...summary.recovery, manualReview: 3, exhausted: 2 },
    }, []);

    expect(view.brief.summary).toContain('자동 복구 소진 2건, 수동 검토 3건');
    expect(view.brief.priorityCount).toBe(2);
  });
});
