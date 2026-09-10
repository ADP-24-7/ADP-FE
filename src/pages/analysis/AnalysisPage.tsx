import { useNavigate, useSearchParams } from 'react-router-dom';
import { AiEvaluationPanel } from '../../features/ai-evaluation';
import { RecoveryOperationsPanel } from '../../features/recovery-operations';
import { ReviewQueuePanel } from '../../features/review-queue';
import { PackContextSummary, PageHeader, SectionCard, StatusBadge } from '../../shared/components';
import { useExecutionPack } from '../../shared/prototype';

export function AnalysisPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { selectedPack } = useExecutionPack();

  return (
    <section className="page-section">
      <PageHeader
        eyebrow="RECOVERY OPERATIONS · RECONCILIATION FIRST"
        title="Runtime · Recovery"
        description="SENT_UNKNOWN을 재전송하지 않고 외부 상태 확인, 안전 재시도와 수동 검토 Evidence로 수렴시킵니다."
        actions={<StatusBadge tone="info">PACK-SCOPED OPERATIONS</StatusBadge>}
      />

      <PackContextSummary
        label={selectedPack.label}
        scope={selectedPack.scope}
        descriptor={selectedPack.descriptor}
        objective={selectedPack.objective}
        dataScope={`${selectedPack.apiValue} Pack · Runtime / Recovery / Review Queue 기준 조회`}
      />

      {selectedPack.key === 'ai' ? <AiEvaluationPanel /> : null}

      <div id="review-queue" className="anchored-section">
        <ReviewQueuePanel
          key={`review-${selectedPack.key}`}
          executionPack={selectedPack.key === 'digital-asset' ? 'DIGITAL_ASSET' : 'AI'}
          onOpenTrace={(executionId, section) => navigate(`/audit?executionId=${encodeURIComponent(executionId)}&section=${section}`)}
          onOpenRecovery={(recoveryId) => setSearchParams({ recoveryId }, { replace: true })}
        />
      </div>

      <div id="recovery-incidents" className="anchored-section"><RecoveryOperationsPanel
        key={`recovery-${selectedPack.key}`}
        executionPack={selectedPack.apiValue}
        initialRecoveryId={searchParams.get('recoveryId') ?? ''}
        onSelectionChange={(recoveryId) => {
          if (recoveryId) setSearchParams({ recoveryId }, { replace: true });
          else setSearchParams({}, { replace: true });
        }}
      /></div>

      <SectionCard title="Recovery 안전 경계" description="BE-9 worker와 수동 명령이 공유하는 fail-closed 처리 순서">
        <div className="runtime-stage-grid">
          {[
            ['01', 'Claim + Lease', '중복 Worker 차단', 'PostgreSQL claim boundary'],
            ['02', 'Status Query', 'Provider 상태 우선 확인', 'RECONCILE'],
            ['03', 'Safe Retry', 'NOT_SENT일 때만 허용', 'RETRY'],
            ['04', 'Manual Review', '모호하거나 소진된 처리', 'MARK_REVIEW'],
            ['05', 'Evidence', 'Actor·Outcome·Digest 보존', 'recovery_operation_event'],
          ].map(([number, title, description, source]) => (
            <article key={number}>
              <span>{number}</span>
              <strong>{title}</strong>
              <small>{description}</small>
              <code>{source}</code>
            </article>
          ))}
        </div>
        <p className="helper-text">명령 실패 시 같은 논리 재시도는 같은 operationId를 유지합니다. 성공하거나 다른 명령을 선택할 때만 새 ID를 생성합니다.</p>
      </SectionCard>
    </section>
  );
}
