import { Activity, AlertTriangle, Clock3, ListRestart, ShieldX, Workflow } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { AiEvaluationPanel } from '../../features/ai-evaluation';
import { useOperationsSummary } from '../../features/operations-monitoring';
import { RecoveryOperationsPanel } from '../../features/recovery-operations';
import { ReviewQueuePanel } from '../../features/review-queue';
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
  const navigate = useNavigate();
  const location = useLocation();
  const { selectedPack } = useExecutionPack();
  const summary = useOperationsSummary(60, selectedPack.apiValue);
  const metricState = summary.isLoading ? 'loading' : summary.isError ? 'error' : 'value';
  const [operationsView, setOperationsView] = useState<'review' | 'recovery' | 'safeguards'>(() => window.location.hash === '#review-queue' ? 'review' : 'recovery');

  useEffect(() => {
    if (location.hash === '#review-queue') setOperationsView('review');
    if (location.hash === '#recovery-incidents') setOperationsView('recovery');
  }, [location.hash]);

  if (selectedPack.key === 'ai') {
    return (
      <section className="page-section">
        <PageHeader
          eyebrow="AI RUNTIME CONTROL · PRIVACY-SAFE TRACE"
          title="AI Admin"
          description="이상 실행을 찾고 Policy부터 Controlled Delivery까지 차단 지점을 확인합니다."
          actions={<StatusBadge tone="info">실행 증적</StatusBadge>}
        />
        <PackContextSummary
          label={selectedPack.label}
          scope={selectedPack.scope}
          descriptor={selectedPack.descriptor}
          objective="외부 Provider 호출과 최종 사용자 전달을 분리해 통제 상태를 확인합니다."
          dataScope="Raw Prompt, Provider Response, 민감값 원문 제외"
        />
        <AiEvaluationPanel />
      </section>
    );
  }

  return (
    <section className="page-section">
      <PageHeader
        eyebrow="RECOVERY OPERATIONS · RECONCILIATION FIRST"
        title="Runtime · Recovery"
        description="SENT_UNKNOWN을 재전송하지 않고 외부 상태 확인, 안전 재시도와 수동 검토 Evidence로 수렴시킵니다."
        actions={<StatusBadge tone={summary.isSuccess ? 'success' : 'warning'}>{summary.isSuccess ? '운영 API 연결' : '운영 API 확인 필요'}</StatusBadge>}
      />

      <PackContextSummary
        label={selectedPack.label}
        scope={selectedPack.scope}
        descriptor={selectedPack.descriptor}
        objective={selectedPack.objective}
        dataScope="전체 권한 허용 Workload · Pack 필터 미지원"
      />

      <div className="metric-grid metric-grid-six">
        <MetricCard label="최근 실행" value={summary.data?.runtime.total} description="최근 60분 전체 실행" state={metricState} icon={Activity} tone="blue" />
        <MetricCard label="실행 실패" value={summary.data?.runtime.failed} description="복구 전환이 필요한 실패" state={metricState} icon={ShieldX} tone="red" />
        <MetricCard label="복구 대기" value={summary.data?.recovery.backlog} description="자동 상태 확인 대기" state={metricState} icon={Workflow} tone="purple" />
        <MetricCard label="수동 검토" value={summary.data?.recovery.manualReview} description="운영자 판단 필요" state={metricState} icon={AlertTriangle} tone="amber" />
        <MetricCard label="처리 지연" value={summary.data?.recovery.staleOperations} description="임계시간을 넘긴 명령" state={metricState} icon={ListRestart} tone="red" />
        <MetricCard label="최장 대기" value={secondsLabel(summary.data?.recovery.oldestBacklogAgeSeconds)} description="가장 오래된 복구 대기" state={metricState} icon={Clock3} tone="amber" />
      </div>

      {summary.isError ? (
        <ErrorState title="운영 Summary를 불러오지 못했습니다" description={normalizeApiError(summary.error).message} onRetry={() => summary.refetch()} />
      ) : null}

      <div className="admin-workspace-tabs" role="tablist" aria-label="Digital Asset 운영 업무">
        <button type="button" role="tab" aria-selected={operationsView === 'review'} className={operationsView === 'review' ? 'active' : ''} onClick={() => setOperationsView('review')}>검토 대기</button>
        <button type="button" role="tab" aria-selected={operationsView === 'recovery'} className={operationsView === 'recovery' ? 'active' : ''} onClick={() => setOperationsView('recovery')}>복구 처리</button>
        <button type="button" role="tab" aria-selected={operationsView === 'safeguards'} className={operationsView === 'safeguards' ? 'active' : ''} onClick={() => setOperationsView('safeguards')}>안전 기준</button>
      </div>

      {operationsView === 'review' ? <div id="review-queue" className="anchored-section">
        <ReviewQueuePanel
          key={`review-${selectedPack.key}`}
          executionPack="DIGITAL_ASSET"
          onOpenTrace={(executionId, section) => navigate(`/audit?executionId=${encodeURIComponent(executionId)}&section=${section}`)}
          onOpenRecovery={(recoveryId) => { setOperationsView('recovery'); setSearchParams({ recoveryId }, { replace: true }); }}
        />
      </div> : null}

      {operationsView === 'recovery' ? <div id="recovery-incidents" className="anchored-section">
        <RecoveryOperationsPanel
          key={`recovery-${selectedPack.key}`}
          executionPack={selectedPack.apiValue}
          initialRecoveryId={searchParams.get('recoveryId') ?? ''}
          onSelectionChange={(recoveryId) => {
            if (recoveryId) setSearchParams({ recoveryId }, { replace: true });
            else setSearchParams({}, { replace: true });
          }}
        />
      </div> : null}

      {operationsView === 'safeguards' ? <SectionCard title="복구 안전 기준" description="자동 Worker와 수동 명령이 공유하는 보수적 처리 순서">
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
      </SectionCard> : null}
    </section>
  );
}
