import { History, RefreshCw, Search } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import {
  ActionableIssueList,
  InterpretedMetricCard,
  OperationsBrief,
  presentOperationsMonitoring,
  presentRecoveryIssues,
  RuntimeStageHealth,
  useOperationsSummary,
  usePolicyOperationEvents,
} from '../../features/operations-monitoring';
import type { PolicyEventCategory, PolicyOperationEventParams } from '../../features/operations-monitoring';
import { useRecoveryIncidents } from '../../features/recovery-operations';
import { normalizeApiError } from '../../shared/api/apiError';
import { EmptyState, ErrorState, LoadingPanel, PackContextSummary, PageHeader, SectionCard, StatusBadge } from '../../shared/components';
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
  const recovery = useRecoveryIncidents({ page: 0, size: 20 });
  const events = usePolicyOperationEvents(eventParams);
  const monitoringView = summary.data ? presentOperationsMonitoring(summary.data, recovery.data?.items ?? []) : null;
  const recoveryIssues = presentRecoveryIssues(recovery.data?.items ?? []);
  const primaryMetrics = monitoringView?.metrics.filter((item) => item.priority === 'primary') ?? [];
  const secondaryMetrics = monitoringView?.metrics.filter((item) => item.priority === 'secondary') ?? [];
  const totalPages = events.data ? Math.ceil(events.data.total / events.data.size) : 0;
  const eventsRefreshing = events.isFetching && !events.isLoading;
  const summaryError = summary.isError ? normalizeApiError(summary.error) : null;

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

      <PackContextSummary
        label={selectedPack.label}
        scope={selectedPack.scope}
        descriptor={selectedPack.descriptor}
        objective={selectedPack.objective}
        dataScope="전체 권한 허용 Workload · Pack 필터 미지원"
      />

      <div className="monitoring-control-row">
        <div>
          <strong>운영 지표 해석</strong>
          <span>Prometheus를 브라우저에서 직접 조회하지 않고 BE의 권한 범위 Read Model만 사용합니다.</span>
        </div>
        <label className="inline-select">
          <span>집계 범위</span>
          <select value={windowMinutes} onChange={(event) => setWindowMinutes(Number(event.target.value))} aria-label="Operations 집계 범위">
            <option value={15}>최근 15분</option>
            <option value={60}>최근 60분</option>
            <option value={360}>최근 6시간</option>
            <option value={1440}>최근 24시간</option>
          </select>
        </label>
      </div>

      {summary.isLoading ? <LoadingPanel label="운영 요약을 불러오는 중입니다" /> : summaryError?.status === 403 ? (
        <EmptyState title="운영 지표 조회 권한이 없습니다" description="현재 관리자 계정에는 Operations Read Model 조회 권한이 없습니다." endpoint="GET /api/admin/operations/summary" />
      ) : summaryError ? (
        <ErrorState description={summaryError.message} onRetry={() => summary.refetch()} />
      ) : monitoringView ? (
        <>
          <OperationsBrief brief={monitoringView.brief} />

          <SectionCard title="해석형 운영 지표" description="우선 확인할 지표와 참고 지표를 구분합니다. 기준선이 없는 값은 증감이나 이상으로 판정하지 않습니다.">
            <div className="metric-group-heading"><strong>우선 확인</strong><span>Recovery · Policy · Institution scope</span></div>
            <div className="interpreted-metric-grid">
              {primaryMetrics.map((item) => <InterpretedMetricCard key={item.id} metric={item} />)}
            </div>
            <div className="metric-group-heading metric-group-heading-secondary"><strong>운영 참고</strong><span>Recovery limit · Runtime outcome</span></div>
            <div className="interpreted-metric-grid interpreted-metric-grid-secondary">
              {secondaryMetrics.map((item) => <InterpretedMetricCard key={item.id} metric={item} />)}
            </div>
          </SectionCard>

          <SectionCard title="Runtime 단계별 관측 가능 범위" description="실제 관측 중인 단계와 일부 집계만 연결된 단계, 아직 연결되지 않은 단계를 구분합니다.">
            <RuntimeStageHealth stages={monitoringView.stages} />
          </SectionCard>
        </>
      ) : null}

      <div className="content-grid content-grid-wide-left">
        <SectionCard
          title="조치 대상 복구 건"
          description="실제 Recovery Incident 중 대사가 끝나지 않은 항목입니다. SENT_UNKNOWN은 재전송 전에 외부 상태 확인이 우선입니다."
          actions={<StatusBadge tone={recovery.isError ? 'danger' : recovery.isFetching ? 'warning' : 'info'}>{recovery.isError ? 'RECOVERY ERROR' : recovery.isFetching ? 'REFRESHING' : `${recovery.data?.totalElements ?? 0} TOTAL`}</StatusBadge>}
        >
          {recovery.isLoading ? <LoadingPanel label="복구 인시던트를 불러오는 중입니다" /> : recovery.isError ? (
            normalizeApiError(recovery.error).status === 403
              ? <EmptyState compact title="복구 인시던트 조회 권한이 없습니다" description="요약 지표와 별개로 개별 Recovery 정보는 현재 권한으로 조회할 수 없습니다." />
              : <ErrorState description={normalizeApiError(recovery.error).message} onRetry={() => recovery.refetch()} />
          ) : <ActionableIssueList issues={recoveryIssues} total={recovery.data?.totalElements ?? 0} />}
        </SectionCard>

        <SectionCard title="관측 범위 안내" description="현재 계약으로 판정할 수 있는 범위와 추가 데이터가 필요한 단계를 구분합니다.">
          <div className="monitoring-scope-note">
            <strong>과도한 판정을 하지 않습니다</strong>
            <p>BE 응답에는 시계열 기준선, 임계치 값, 데이터 출처 모드가 없습니다. 따라서 증가율·이상 탐지·LIVE/SYNTHETIC 여부를 FE가 추정하지 않습니다.</p>
            <details className="technical-details">
              <summary>현재 데이터 계약</summary>
              <div>
                <span>Summary</span><code>adp-operations-summary/v1</code>
                <span>Recovery</span><code>GET /api/admin/recovery/incidents</code>
                <span>관측 범위</span><p>최근 {summary.data?.windowMinutes ?? windowMinutes}분</p>
                <span>Summary API</span><code>GET /api/admin/operations/summary</code>
                <span>Prometheus</span><p>BE 내부 수집·집계 전용</p>
                <span>데이터 출처</span><p>API 응답에 모드 정보 없음</p>
                <span>Pack Filter</span><p>미지원 · 전체 권한 허용 Workload</p>
              </div>
            </details>
          </div>
        </SectionCard>
      </div>

      <SectionCard
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
      </SectionCard>

    </section>
  );
}
