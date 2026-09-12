import type { ExecutionEvidencePack } from '../../audit-trace';
import type { RuntimeExecutionTrace } from '../../runtime-execution';

const NOT_AVAILABLE = 'NOT AVAILABLE FROM BE READ API';

export type DigitalAssetAdminRuntimeView = {
  executionId: string;
  requestId: string;
  traceId: string;
  workloadPurpose: string;
  policySnapshot: string;
  decision: string;
  reasonCodes: string;
  asset: string;
  exactAmountEvidence: string;
  destination: string;
  externalExecution: string;
  executionStatus: string;
  evidenceStatus: string;
  reconciliationStatus: string;
  finalState: string;
  existingExecutionReused: string;
  replayCount: string;
  additionalExternalEffect: string;
  timestamp: string;
};

function present(value: string | number | null | undefined) {
  return value != null && String(value).length > 0 ? String(value) : NOT_AVAILABLE;
}

export function buildDigitalAssetAdminRuntimeView(
  evidence: ExecutionEvidencePack,
  trace: RuntimeExecutionTrace,
): DigitalAssetAdminRuntimeView {
  const snapshot = trace.digitalAssetRuntimeSnapshot;
  const guard = trace.digitalAssetPreExecutionGuard;
  const postExecution = trace.digitalAssetPostExecutionEvidence;
  const reasonCodes = [
    ...trace.policyReasonCodes,
    ...(guard?.reasonCodes ?? []),
    evidence.audit.reasonCode,
  ].filter((value): value is string => Boolean(value));
  const connectorExecutionId = evidence.egress.connectorExecutionId;
  const connectorStatus = evidence.egress.connectorStatus;
  const externalExecution = connectorExecutionId
    ? `EXECUTED · ${connectorExecutionId}`
    : connectorStatus === 'NOT_SENT' || trace.status === 'BLOCKED'
      ? 'NOT CALLED'
      : NOT_AVAILABLE;
  const exactAmountEvidence = postExecution?.exactAmountDigest
    ? `${postExecution.amountSource} · ${postExecution.exactAmountDigest}`
    : NOT_AVAILABLE;
  const recoveryStatus = evidence.recovery.recoveryStatus;
  const retryDisposition = evidence.recovery.retryDisposition;

  return {
    executionId: evidence.executionId,
    requestId: evidence.requestId,
    traceId: evidence.traceId,
    workloadPurpose: `${evidence.workloadId} / ${evidence.purposeCode}`,
    policySnapshot: snapshot
      ? `${snapshot.approvedPolicySnapshotId} · ${snapshot.approvedPolicyVersion} · ${snapshot.snapshotDigest}`
      : `${present(evidence.policy.policyVersion)} · ${present(evidence.policy.snapshotDigest)}`,
    decision: `${present(trace.policyDecision)} · ${present(trace.finalAction)}`,
    reasonCodes: reasonCodes.length > 0 ? [...new Set(reasonCodes)].join(' · ') : 'NONE',
    asset: 'NOT EXPOSED BY PRIVACY-SAFE READ API',
    exactAmountEvidence,
    destination: present(snapshot?.destinationProfileId ?? evidence.egress.destinationProfileId),
    externalExecution,
    executionStatus: `${trace.status} · ${present(connectorStatus)}`,
    evidenceStatus: postExecution
      ? `${postExecution.status} · ${postExecution.receiptStatus} · ${postExecution.finalityStatus}`
      : 'NOT CREATED',
    reconciliationStatus: recoveryStatus
      ? `${recoveryStatus} · ${present(retryDisposition)} · ${present(evidence.recovery.lastObservedExternalStatus)}`
      : 'NOT REQUIRED',
    finalState: trace.status,
    existingExecutionReused: evidence.idempotency
      ? evidence.idempotency.existingExecutionReused ? 'YES' : 'NO'
      : NOT_AVAILABLE,
    replayCount: present(evidence.idempotency?.replayCount),
    additionalExternalEffect: present(evidence.idempotency?.additionalExternalEffectCount),
    timestamp: `${new Date(evidence.createdAt).toLocaleString('ko-KR')} → ${new Date(evidence.updatedAt).toLocaleString('ko-KR')}`,
  };
}
