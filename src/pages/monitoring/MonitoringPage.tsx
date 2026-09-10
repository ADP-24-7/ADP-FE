import { History, RefreshCw, Search } from 'lucide-react';
import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePolicyOperationEvents } from '../../features/operations-monitoring';
import type { PolicyEventCategory, PolicyOperationEventParams } from '../../features/operations-monitoring';
import { SecurityFindingPanel } from '../../features/security-findings';
import { normalizeApiError } from '../../shared/api/apiError';
import { EmptyState, ErrorState, LoadingPanel, PackContextSummary, PageHeader, SectionCard, StatusBadge } from '../../shared/components';
import { useExecutionPack } from '../../shared/prototype';

export function MonitoringPage() {
  const navigate = useNavigate();
  const { selectedPack } = useExecutionPack();
  const [workloadId, setWorkloadId] = useState('');
  const [category, setCategory] = useState<PolicyEventCategory | ''>('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [eventParams, setEventParams] = useState<PolicyOperationEventParams>({ page: 0, size: 20 });
  const events = usePolicyOperationEvents({ ...eventParams, executionPack: selectedPack.apiValue });
  const totalPages = events.data ? Math.ceil(events.data.total / events.data.size) : 0;
  const eventsRefreshing = events.isFetching && !events.isLoading;

  useEffect(() => {
    setEventParams((current) => ({ ...current, page: 0 }));
  }, [selectedPack.apiValue]);

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
        eyebrow="SECURITY FINDING · POLICY HISTORY"
        title="Security Monitoring"
        description="보안 탐지 결과와 정책 변경 이력을 권한 범위에서 조회합니다."
      />

      <PackContextSummary
        label={selectedPack.label}
        scope={selectedPack.scope}
        descriptor={selectedPack.descriptor}
        objective={selectedPack.objective}
        dataScope="보안 탐지 · 정책 이력"
      />

      <div id="security-findings" className="anchored-section"><SecurityFindingPanel
        key={selectedPack.key}
        executionPack={selectedPack.apiValue}
        onOpenTrace={(executionId) => navigate(`/audit?executionId=${encodeURIComponent(executionId)}&section=response-guard`)}
      /></div>

      <div id="policy-events" className="anchored-section"><SectionCard
        className="search-assist-card"
        title="Policy Operation History"
        description="Lifecycle Transition과 Current Selection Event를 단일 append-only 이력으로 검색합니다."
        actions={eventsRefreshing ? <StatusBadge tone="warning">REFRESHING</StatusBadge> : <History size={16} />}
      >
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
            <button className="button button-primary" type="submit" disabled={eventsRefreshing}><Search size={14} />검색</button>
            <button className="button button-secondary" type="button" disabled={eventsRefreshing} onClick={resetEvents} title="검색 조건 초기화"><RefreshCw size={14} /></button>
          </div>
        </form>

        <div className={`table-shell policy-events-table-shell${eventsRefreshing ? ' is-refreshing' : ''}`} aria-busy={eventsRefreshing}>
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
            <button className="button button-secondary" type="button" disabled={(eventParams.page ?? 0) === 0 || eventsRefreshing} onClick={() => setEventParams((value) => ({ ...value, page: Math.max(0, (value.page ?? 0) - 1) }))}>이전</button>
            <button className="button button-secondary" type="button" disabled={!totalPages || (eventParams.page ?? 0) + 1 >= totalPages || eventsRefreshing} onClick={() => setEventParams((value) => ({ ...value, page: (value.page ?? 0) + 1 }))}>다음</button>
          </div>
        </div>
      </SectionCard></div>

    </section>
  );
}
