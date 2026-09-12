import type { ExecutionEvidencePack } from '../../audit-trace';
import type { RuntimeExecutionTrace } from '../../runtime-execution';
import { KeyValues, SectionCard, StatusBadge } from '../../../shared/components';
import { buildDigitalAssetAdminRuntimeView } from '../model/adminRuntimeView';

function tone(status: string) {
  if (status === 'COMPLETED' || status === 'EXTERNALLY_RECONCILED') return 'success' as const;
  if (status === 'BLOCKED' || status === 'FAILED') return 'danger' as const;
  return 'warning' as const;
}

type DigitalAssetRuntimeEvidencePanelProps = {
  evidence: ExecutionEvidencePack;
  trace: RuntimeExecutionTrace;
};

export function DigitalAssetRuntimeEvidencePanel({ evidence, trace }: DigitalAssetRuntimeEvidencePanelProps) {
  const view = buildDigitalAssetAdminRuntimeView(evidence, trace);
  const snapshot = trace.digitalAssetRuntimeSnapshot;
  const guard = trace.digitalAssetPreExecutionGuard;
  const postExecution = trace.digitalAssetPostExecutionEvidence;

  return (
    <SectionCard
      title="Digital Asset Runtime Evidence"
      description="BE Runtime Trace와 Operations Read Evidence를 결합한 privacy-safe 관리자 조회입니다."
      actions={<StatusBadge tone={tone(view.finalState)}>{view.finalState}</StatusBadge>}
    >
      <KeyValues items={[
        ['Execution ID', view.executionId],
        ['Request ID', view.requestId],
        ['Trace ID', view.traceId],
        ['Workload / Purpose', view.workloadPurpose],
        ['Policy / Snapshot', view.policySnapshot],
        ['Decision', view.decision],
        ['Reason Codes', view.reasonCodes],
        ['Asset', view.asset],
        ['Exact Amount Evidence', view.exactAmountEvidence],
        ['Destination', view.destination],
        ['External Execution', view.externalExecution],
        ['Execution Status', view.executionStatus],
        ['Evidence Status', view.evidenceStatus],
        ['Reconciliation', view.reconciliationStatus],
        ['Final State', view.finalState],
        ['Existing Execution Reused', view.existingExecutionReused],
        ['Replay Count', view.replayCount],
        ['Additional External Effect', view.additionalExternalEffect],
        ['Timestamp', view.timestamp],
      ]} />

      {guard ? (
        <div className="runtime-stage-grid" aria-label="Digital Asset pre-execution controls">
          {Object.entries(guard.controlResults).map(([control, result], index) => (
            <article key={control}>
              <span>{String(index + 1).padStart(2, '0')}</span>
              <strong>{control}</strong>
              <StatusBadge tone={result === 'PASSED' ? 'success' : 'danger'}>{result}</StatusBadge>
              <code>{guard.snapshotId}</code>
            </article>
          ))}
        </div>
      ) : null}

      <KeyValues items={[
        ['Artifact', snapshot ? `${snapshot.artifactId} · ${snapshot.artifactVersion}` : 'NOT AVAILABLE'],
        ['Runtime Control', snapshot ? `${snapshot.runtimeControlVersion} · ${snapshot.runtimeControlDigest}` : 'NOT AVAILABLE'],
        ['Outbound Guard', evidence.egress.outboundGuardStatus ?? guard?.status ?? 'NOT AVAILABLE'],
        ['Post-execution Source', postExecution?.evidenceSourceType ?? 'NOT CREATED'],
        ['Status Query Evidence', String(evidence.recovery.statusQueryEvidenceDigest ?? 'NOT AVAILABLE')],
        ['Audit Evidence', `${evidence.audit.auditId} · ${evidence.exportContentDigest}`],
        ['Runtime Stages', trace.stages.map((stage) => `${stage.stage}:${stage.status}`).join(' → ')],
      ]} />

      <p className="helper-text">
        Raw transaction payload, wallet address, secret, provider raw response는 표시하지 않습니다.
        SENT_UNKNOWN 원상태와 RECONCILE_FIRST 이력은 Recovery Incident API 화면에서 동일 execution ID로 조회합니다.
      </p>
    </SectionCard>
  );
}
