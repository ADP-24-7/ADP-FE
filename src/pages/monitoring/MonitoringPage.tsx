import { Activity, AlertTriangle, History, RefreshCw, Search, ShieldAlert, ShieldCheck, Workflow } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { useOperationsSummary, usePolicyOperationEvents } from '../../features/operations-monitoring';
import type { PolicyEventCategory, PolicyOperationEventParams } from '../../features/operations-monitoring';
import { normalizeApiError } from '../../shared/api/apiError';
import { EmptyState, ErrorState, LoadingPanel, MetricCard, PackContextSummary, PageHeader, SectionCard, StatusBadge } from '../../shared/components';
import { useExecutionPack } from '../../shared/prototype';

export function MonitoringPage() {
  const { selectedPack } = useExecutionPack();
  const [windowMinutes, setWindowMinutes] = useState(60);
  const [workloadId, setWorkloadId] = useState('');
  const [category, setCategory] = useState<PolicyEventCategory | ''>('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [eventParams, setEventParams] = useState<PolicyOperationEventParams>({ page: 0, size: 20 });
  const summary = useOperationsSummary(windowMinutes);
  const events = usePolicyOperationEvents(eventParams);
  const metricState = summary.isLoading ? 'loading' : summary.isError ? 'error' : 'value';
  const totalPages = events.data ? Math.ceil(events.data.total / events.data.size) : 0;

  function searchEvents(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setEventParams({
      workloadId: workloadId.trim() || undefined,
      category: category || undefined,
      from: from ? new Date(from).toISOString() : undefined,
      to: to ? new Date(to).toISOString() : undefined,
      page: 0,
      size: 20,
    });
  }

  function resetEvents() {
    setWorkloadId('');
    setCategory('');
    setFrom('');
    setTo('');
    setEventParams({ page: 0, size: 20 });
  }

  return (
    <section className="page-section">
      <PageHeader
        eyebrow="OPERATIONS READ MODEL · LOW-CARDINALITY SIGNALS"
        title="Operations Monitoring"
        description="Runtime, Recovery, Policy와 Security 운영 상태를 권한 범위와 지정 시간창 안에서 확인합니다."
        actions={<StatusBadge tone={summary.isSuccess ? 'success' : 'warning'}>{summary.isSuccess ? 'SUMMARY CONNECTED' : 'OPERATIONS API'}</StatusBadge>}
      />

      <PackContextSummary label={selectedPack.label} scope={selectedPack.scope} descriptor={selectedPack.descriptor} objective={selectedPack.objective} />

      <SectionCard
        title="Operations Summary"
        description="브라우저가 Prometheus를 직접 조회하지 않고 BE의 scoped Read Model을 사용합니다."
        actions={(
          <label className="inline-select">
            <span>집계 범위</span>
            <select value={windowMinutes} onChange={(event) => setWindowMinutes(Number(event.target.value))} aria-label="Operations 집계 범위">
              <option value={15}>최근 15분</option>
              <option value={60}>최근 60분</option>
              <option value={360}>최근 6시간</option>
              <option value={1440}>최근 24시간</option>
            </select>
          </label>
        )}
      >
        <div className="metric-grid metric-grid-six">
          <MetricCard label="Runtime Total" value={summary.data?.runtime.total} description="지정 시간창 전체" state={metricState} icon={Activity} tone="blue" />
          <MetricCard label="Completed" value={summary.data?.runtime.completed} description="정상 종결" state={metricState} icon={ShieldCheck} tone="green" />
          <MetricCard label="Blocked" value={summary.data?.runtime.blocked} description="정책 차단" state={metricState} icon={ShieldAlert} tone="red" />
          <MetricCard label="Recovery Backlog" value={summary.data?.recovery.backlog} description="처리 대기" state={metricState} icon={Workflow} tone="purple" />
          <MetricCard label="Policy Drift" value={summary.data?.policy.driftedSelections} description="선택 불일치" state={metricState} icon={AlertTriangle} tone="amber" />
          <MetricCard label="Denied Attempts" value={summary.data?.security.deniedAttempts} description="보안 거부" state={metricState} icon={ShieldAlert} tone="red" />
        </div>
        {summary.isError ? <ErrorState description={normalizeApiError(summary.error).message} onRetry={() => summary.refetch()} /> : null}
        {summary.data ? (
          <div className="operations-health-grid">
            <article>
              <span>Recovery</span>
              <strong>{summary.data.recovery.manualReview} review · {summary.data.recovery.exhausted} exhausted</strong>
              <small>{summary.data.recovery.completedOperations} completed operations · {summary.data.recovery.staleOperations} stale</small>
            </article>
            <article>
              <span>Policy</span>
              <strong>{summary.data.policy.currentSelections} selections · {summary.data.policy.driftedSelections} drift</strong>
              <small>{summary.data.policy.activations} activation · {summary.data.policy.rollbacks} rollback</small>
            </article>
            <article>
              <span>Security</span>
              <strong>{summary.data.security.deniedAttempts} denied attempts</strong>
              <small>{summary.data.security.institutionScopeMismatch} scope mismatch · {summary.data.security.authorizationPolicyDenied} policy denied</small>
            </article>
          </div>
        ) : null}
      </SectionCard>

      <SectionCard className="search-assist-card" title="Policy Operation History" description="Lifecycle Transition과 Current Selection Event를 단일 append-only 이력으로 검색합니다." actions={<History size={16} />}>
        <form className="search-filter-grid" onSubmit={searchEvents}>
          <label className="field"><span>Workload ID</span><input value={workloadId} onChange={(event) => setWorkloadId(event.target.value)} placeholder="Workload ID 직접 입력" /></label>
          <label className="field">
            <span>Category</span>
            <select value={category} onChange={(event) => setCategory(event.target.value as PolicyEventCategory | '')}>
              <option value="">전체 Category</option>
              <option value="LIFECYCLE_TRANSITION">LIFECYCLE_TRANSITION</option>
              <option value="CURRENT_SELECTION">CURRENT_SELECTION</option>
            </select>
          </label>
          <label className="field"><span>From</span><input type="datetime-local" value={from} onChange={(event) => setFrom(event.target.value)} /></label>
          <label className="field"><span>To</span><input type="datetime-local" value={to} onChange={(event) => setTo(event.target.value)} /></label>
          <div className="search-filter-actions">
            <button className="button button-primary" type="submit"><Search size={14} />검색</button>
            <button className="button button-secondary" type="button" onClick={resetEvents} title="검색 조건 초기화"><RefreshCw size={14} /></button>
          </div>
        </form>

        <div className="table-shell policy-events-table-shell">
          <div className="table-head table-policy-events">
            <span>OCCURRED</span><span>CATEGORY / TYPE</span><span>ARTIFACT</span><span>WORKLOAD / PURPOSE</span><span>REVISION</span><span>ACTOR / REASON</span>
          </div>
          {events.isLoading ? <LoadingPanel label="운영 이력을 불러오는 중입니다" /> : events.isError ? (
            <ErrorState description={normalizeApiError(events.error).message} onRetry={() => events.refetch()} />
          ) : events.data?.items.length ? events.data.items.map((item) => (
            <div className="table-row table-policy-events" key={item.eventId}>
              <span>{new Date(item.occurredAt).toLocaleString('ko-KR')}</span>
              <span><StatusBadge tone={item.category === 'CURRENT_SELECTION' ? 'success' : 'info'}>{item.category}</StatusBadge><small>{item.eventType}</small></span>
              <span><code>{item.artifactId}</code><small>{item.artifactVersion} · {item.executionPack}</small></span>
              <span>{item.workloadId}<small>{item.purposeCode}</small></span>
              <span>Artifact {item.artifactRevision ?? '—'}<small>Selection {item.selectionRevision ?? '—'}</small></span>
              <span>{item.actorId}<small>{item.reasonCode}</small></span>
            </div>
          )) : <EmptyState title="정책 운영 이력이 없습니다" description="현재 검색 조건과 권한 범위에 해당하는 Lifecycle 또는 Selection Event가 없습니다." endpoint="GET /api/admin/operations/policy-events" />}
        </div>
        <div className="pagination-row">
          <span>{events.data ? `${events.data.total}건 · ${events.data.page + 1}/${Math.max(totalPages, 1)} 페이지` : '조회 대기'}</span>
          <div>
            <button className="button button-secondary" type="button" disabled={(eventParams.page ?? 0) === 0} onClick={() => setEventParams((value) => ({ ...value, page: Math.max(0, (value.page ?? 0) - 1) }))}>이전</button>
            <button className="button button-secondary" type="button" disabled={!totalPages || (eventParams.page ?? 0) + 1 >= totalPages} onClick={() => setEventParams((value) => ({ ...value, page: (value.page ?? 0) + 1 }))}>다음</button>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Security Finding Detail" description="개별 거부 사건과 Trace를 연결하는 상세 Read Model" actions={<StatusBadge>API 대기</StatusBadge>}>
        <EmptyState icon={ShieldAlert} title="상세 Finding API 연결 대기" description="Operations Summary는 집계만 제공합니다. 개별 Finding 목록은 BE Controller가 추가될 때 연결합니다." endpoint="Security Finding list/detail API 미구현" />
      </SectionCard>
    </section>
  );
}
