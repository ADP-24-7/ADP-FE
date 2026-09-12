import { describe, expect, it } from 'vitest';
import type { ExecutionEvidencePack } from '../../audit-trace';
import { digitalAssetRuntimeTraceFixture } from '../../runtime-execution/mocks/fixtures';
import type { RuntimeExecutionTrace } from '../../runtime-execution';
import { buildDigitalAssetAdminRuntimeView } from './adminRuntimeView';

const baseEvidence: ExecutionEvidencePack = {
  schemaVersion: 'adp-execution-evidence/v1',
  exportContentDigest: 'export-digest',
  executionId: digitalAssetRuntimeTraceFixture.executionId,
  requestId: 'request-da-contract',
  traceId: digitalAssetRuntimeTraceFixture.traceId,
  institutionId: 'institution_local',
  workloadId: 'tokenized_asset_purchase',
  purposeCode: 'DIGITAL_ASSET_PURCHASE',
  runtimeStatus: 'COMPLETED',
  authorizationStatus: 'PASSED',
  idempotency: {
    existingExecutionReused: false,
    replayCount: 0,
    additionalExternalEffectCount: 0,
  },
  policy: { policyVersion: 'policy/1.0.0', snapshotDigest: 'snapshot-digest', finalAction: 'ALLOW' },
  data: {},
  egress: {
    destinationProfileId: 'dest_mock_asset_platform_v1',
    outboundGuardStatus: 'PASSED',
    connectorExecutionId: 'connector-da-contract',
    connectorStatus: 'COMPLETED',
  },
  recovery: { recoveryStatus: null, retryDisposition: null, lastObservedExternalStatus: null },
  audit: { auditId: 'audit-da-contract', reasonCode: null, evidenceRefs: [] },
  createdAt: '2026-09-12T00:00:00Z',
  updatedAt: '2026-09-12T00:00:01Z',
};

function trace(overrides: Partial<RuntimeExecutionTrace> = {}): RuntimeExecutionTrace {
  return { ...digitalAssetRuntimeTraceFixture, ...overrides };
}

function evidence(overrides: Partial<ExecutionEvidencePack> = {}): ExecutionEvidencePack {
  return { ...baseEvidence, ...overrides };
}

describe('buildDigitalAssetAdminRuntimeView', () => {
  it('maps GOLDEN_PASS from BE trace and exact evidence', () => {
    const view = buildDigitalAssetAdminRuntimeView(baseEvidence, trace());
    expect(view).toMatchObject({
      decision: 'TRANSFORM · TRANSFORM',
      externalExecution: 'EXECUTED · connector-da-contract',
      evidenceStatus: 'VERIFIED · SUCCESS · FINALIZED',
      finalState: 'COMPLETED',
    });
    expect(view.exactAmountEvidence).toContain(digitalAssetRuntimeTraceFixture.digitalAssetPostExecutionEvidence!.exactAmountDigest);
  });

  it.each([
    ['BLOCK_AMOUNT', 'DIGITAL_ASSET_APPROVED_AMOUNT_EXCEEDED'],
    ['BLOCK_DESTINATION', 'DIGITAL_ASSET_APPROVED_DESTINATION_MISMATCH'],
  ])('maps %s as a pre-execution block with no connector call', (_caseId, reasonCode) => {
    const view = buildDigitalAssetAdminRuntimeView(
      evidence({
        runtimeStatus: 'BLOCKED',
        egress: { ...baseEvidence.egress, connectorExecutionId: null, connectorStatus: 'NOT_SENT' },
      }),
      trace({
        status: 'BLOCKED',
        policyDecision: 'BLOCK',
        finalAction: 'BLOCK',
        policyReasonCodes: [reasonCode],
        digitalAssetPreExecutionGuard: null,
        digitalAssetPostExecutionEvidence: null,
      }),
    );
    expect(view.externalExecution).toBe('NOT CALLED');
    expect(view.reasonCodes).toContain(reasonCode);
    expect(view.evidenceStatus).toBe('NOT CREATED');
  });

  it('maps EXECUTION_FAILED from independent failed receipt evidence', () => {
    const postExecution = digitalAssetRuntimeTraceFixture.digitalAssetPostExecutionEvidence!;
    const view = buildDigitalAssetAdminRuntimeView(
      evidence({ runtimeStatus: 'FAILED' }),
      trace({
        status: 'FAILED',
        digitalAssetPostExecutionEvidence: { ...postExecution, status: 'FAILED', receiptStatus: 'FAILED' },
      }),
    );
    expect(view.evidenceStatus).toBe('FAILED · FAILED · FINALIZED');
    expect(view.finalState).toBe('FAILED');
  });

  it('maps SENT_UNKNOWN_RECOVERED from reconciliation evidence', () => {
    const view = buildDigitalAssetAdminRuntimeView(
      evidence({
        runtimeStatus: 'EXTERNALLY_RECONCILED',
        recovery: {
          recoveryStatus: 'RECONCILED',
          retryDisposition: 'RECONCILE_FIRST',
          lastObservedExternalStatus: 'COMPLETED',
          statusQueryEvidenceDigest: 'status-query-digest',
        },
      }),
      trace({ status: 'EXTERNALLY_RECONCILED' }),
    );
    expect(view.reconciliationStatus).toBe('RECONCILED · RECONCILE_FIRST · COMPLETED');
    expect(view.finalState).toBe('EXTERNALLY_RECONCILED');
  });

  it('maps DUPLICATE_REQUEST only from explicit BE idempotency evidence', () => {
    const view = buildDigitalAssetAdminRuntimeView(
      evidence({
        idempotency: {
          existingExecutionReused: true,
          replayCount: 1,
          additionalExternalEffectCount: 0,
        },
      }),
      trace(),
    );
    expect(view.existingExecutionReused).toBe('YES');
    expect(view.replayCount).toBe('1');
    expect(view.additionalExternalEffect).toBe('0');
  });

  it('does not infer DUPLICATE_REQUEST when BE idempotency evidence is absent', () => {
    const view = buildDigitalAssetAdminRuntimeView(
      evidence({ idempotency: undefined, audit: { ...baseEvidence.audit, reasonCode: 'IDEMPOTENCY_KEY_REUSED' } }),
      trace(),
    );
    expect(view.existingExecutionReused).toBe('NOT AVAILABLE FROM BE READ API');
    expect(view.additionalExternalEffect).toBe('NOT AVAILABLE FROM BE READ API');
  });
});
