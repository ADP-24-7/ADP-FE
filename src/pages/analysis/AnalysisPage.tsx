import { Activity, AlertTriangle, Clock3, ListRestart, ShieldX, Workflow } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { AiEvaluationPanel } from '../../features/ai-evaluation';
import { useOperationsSummary } from '../../features/operations-monitoring';
import { RecoveryOperationsPanel } from '../../features/recovery-operations';
import { normalizeApiError } from '../../shared/api/apiError';
import { ErrorState, MetricCard, PackContextSummary, PageHeader, SectionCard, StatusBadge } from '../../shared/components';
import { useExecutionPack } from '../../shared/prototype';

function secondsLabel(value: number | null | undefined) {
  if (value == null) return '—';
  if (value < 60) return `${value}초`;
  return `${Math.floor(value / 60)}분 ${value % 60}초`;
}

export function AnalysisPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { selectedPack } = useExecutionPack();
  const summary = useOperationsSummary(60);
  const metricState = summary.isLoading ? 'loading' : summary.isError ? 'error' : 'value';

  return (
    <section className="page-section">
      <PageHeader
        eyebrow="RECOVERY OPERATIONS · RECONCILIATION FIRST"
        title="Runtime · Recovery"
        description="SENT_UNKNOWN을 재전송하지 않고 외부 상태 확인, 안전 재시도와 수동 검토 Evidence로 수렴시킵니다."
        actions={<StatusBadge tone={summary.isSuccess ? 'success' : 'warning'}>{summary.isSuccess ? 'OPERATIONS API CONNECTED' : 'OPERATIONS API'}</StatusBadge>}
      />

      <PackContextSummary
        label={selectedPack.label}
        scope={selectedPack.scope}
        descriptor={selectedPack.descriptor}
        objective={selectedPack.objective}
        dataScope="전체 권한 허용 Workload · Pack 필터 미지원"
      />

      {selectedPack.key === 'ai' ? <AiEvaluationPanel /> : null}

      <div className="metric-grid metric-grid-six">
        <MetricCard label="Runtime Total" value={summary.data?.runtime.total} description="최근 60분 실행" state={metricState} icon={Activity} tone="blue" />
        <MetricCard label="Runtime Failed" value={summary.data?.runtime.failed} description="FAILED terminal" state={metricState} icon={ShieldX} tone="red" />
        <MetricCard label="Recovery Backlog" value={summary.data?.recovery.backlog} description="자동 처리 대기" state={metricState} icon={Workflow} tone="purple" />
        <MetricCard label="Manual Review" value={summary.data?.recovery.manualReview} description="운영자 검토 필요" state={metricState} icon={AlertTriangle} tone="amber" />
        <MetricCard label="Stale Operations" value={summary.data?.recovery.staleOperations} description="임계시간 초과 명령" state={metricState} icon={ListRestart} tone="red" />
        <MetricCard label="Oldest Backlog" value={secondsLabel(summary.data?.recovery.oldestBacklogAgeSeconds)} description="가장 오래된 대기" state={metricState} icon={Clock3} tone="amber" />
      </div>

      {summary.isError ? (
        <ErrorState title="운영 Summary를 불러오지 못했습니다" description={normalizeApiError(summary.error).message} onRetry={() => summary.refetch()} />
      ) : null}

      <RecoveryOperationsPanel
        initialRecoveryId={searchParams.get('recoveryId') ?? ''}
        onSelectionChange={(recoveryId) => {
          if (recoveryId) setSearchParams({ recoveryId }, { replace: true });
          else setSearchParams({}, { replace: true });
        }}
      />

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
