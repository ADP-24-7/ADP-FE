import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { useSearchParams as useRouterSearchParams } from 'react-router-dom';
import { FileCheck2, LockKeyhole, RotateCcw, Search } from 'lucide-react';
import { useAuditExecutions, useExecutionEvidence } from '../../features/audit-trace';
import { AuditExportPanel } from '../../features/audit-export';
import type { AuditSearchParams } from '../../features/audit-trace';
import { normalizeApiError } from '../../shared/api/apiError';
import { EmptyState, ErrorState, KeyValues, LoadingPanel, PackContextSummary, PageHeader, SearchAssistInput, SectionCard, StatusBadge } from '../../shared/components';
import { DEFAULT_TABLE_PAGE_SIZE } from '../../shared/config/pagination';
import { useExecutionPack } from '../../shared/prototype';

export function AuditPage() {
  const [routeSearchParams, setRouteSearchParams] = useRouterSearchParams();
  const initialExecutionId = routeSearchParams.get('executionId') ?? '';
  const requestedSection = routeSearchParams.get('section');
  const investigationLabel = requestedSection === 'post-execution'
    ? '실행 결과 증적'
    : requestedSection === 'response-guard'
      ? 'Response Guard Finding'
      : requestedSection === 'decision'
        ? 'Policy Decision'
        : null;
  const { selectedPack } = useExecutionPack();
  const [submittedExecutionId, setSubmittedExecutionId] = useState(initialExecutionId);
  const [workloadId, setWorkloadId] = useState('');
  const [status, setStatus] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [searchParams, setSearchParams] = useState<AuditSearchParams>({ executionPack: selectedPack.apiValue, page: 0, size: DEFAULT_TABLE_PAGE_SIZE });
  const audit = useAuditExecutions(searchParams);
  const evidence = useExecutionEvidence(submittedExecutionId);
  const activePackRef = useRef(selectedPack.apiValue);
  const policyDecisionEvidenceRef = useRef<HTMLDivElement>(null);
  const postExecutionEvidenceRef = useRef<HTMLDivElement>(null);
  const totalPages = audit.data ? Math.ceil(audit.data.totalElements / audit.data.size) : 0;
  const isRefreshing = audit.isFetching && !audit.isLoading;

  useEffect(() => {
    if (!evidence.data) return;

    const section = requestedSection === 'decision'
      ? policyDecisionEvidenceRef.current
      : requestedSection === 'post-execution' || requestedSection === 'response-guard'
        ? postExecutionEvidenceRef.current
        : null;
    if (!section) return;

    section.scrollIntoView?.({ behavior: 'smooth', block: 'center' });
    section.focus({ preventScroll: true });
  }, [evidence.data, requestedSection]);

  useEffect(() => {
    if (activePackRef.current === selectedPack.apiValue) return;
    activePackRef.current = selectedPack.apiValue;
    setSubmittedExecutionId('');
    setSearchParams((current) => ({
      ...current,
      executionPack: selectedPack.apiValue,
      workloadId: undefined,
      page: 0,
    }));
    setWorkloadId('');
  }, [selectedPack.apiValue]);

  const workloadSuggestions = useMemo(() => {
    const apiValues = [...new Set(audit.data?.items.map((item) => item.workloadId) ?? [])];
    return [
      ...apiValues.map((value) => ({ value, description: '현재 감사 목록에서 확인된 Workload', source: 'api' as const })),
      ...[
        { value: 'customer_summary', label: 'AI 고객 요약', description: '예시 Workload', source: 'local-example' as const },
        { value: 'tokenized_asset_purchase', label: 'Digital Asset 구매', description: '예시 Workload', source: 'local-example' as const },
      ].filter((example) => !apiValues.includes(example.value)),
    ];
  }, [audit.data?.items]);

  function search(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmittedExecutionId('');
    const nextRouteParams = new URLSearchParams(routeSearchParams);
    nextRouteParams.delete('executionId');
    nextRouteParams.delete('section');
    setRouteSearchParams(nextRouteParams, { replace: true });
    setSearchParams({
      executionPack: selectedPack.apiValue,
      workloadId: workloadId.trim() || undefined,
      status: status || undefined,
      from: from ? new Date(from).toISOString() : undefined,
      to: to ? new Date(to).toISOString() : undefined,
      page: 0,
      size: DEFAULT_TABLE_PAGE_SIZE,
    });
  }

  function resetSearch() {
    setWorkloadId('');
    setStatus('');
    setFrom('');
    setTo('');
    setSubmittedExecutionId('');
    const nextRouteParams = new URLSearchParams(routeSearchParams);
    nextRouteParams.delete('executionId');
    nextRouteParams.delete('section');
    setRouteSearchParams(nextRouteParams, { replace: true });
    setSearchParams({ executionPack: selectedPack.apiValue, page: 0, size: DEFAULT_TABLE_PAGE_SIZE });
  }

  function changePage(page: number) {
    setSearchParams((current) => ({ ...current, page }));
  }

  function selectExecution(executionId: string) {
    setSubmittedExecutionId(executionId);
    const nextRouteParams = new URLSearchParams(routeSearchParams);
    nextRouteParams.set('executionId', executionId);
    nextRouteParams.delete('section');
    setRouteSearchParams(nextRouteParams, { replace: true });
  }

  const activeFilters = [
    searchParams.workloadId ? `Workload: ${searchParams.workloadId}` : null,
    searchParams.status ? `Status: ${searchParams.status}` : null,
    searchParams.from ? `From: ${new Date(searchParams.from).toLocaleString('ko-KR')}` : null,
    searchParams.to ? `To: ${new Date(searchParams.to).toLocaleString('ko-KR')}` : null,
  ].filter(Boolean) as string[];

  return (
    <section className="page-section">
      <PageHeader
        eyebrow="REQUEST TO OUTCOME · RAW-FREE EVIDENCE"
        title="Decision Trace"
        description="승인부터 외부 실행, 결과 검증과 감사까지 하나의 실행 ID로 재현합니다."
      />

      <PackContextSummary label={selectedPack.label} scope={selectedPack.scope} descriptor={selectedPack.descriptor} objective={selectedPack.objective} />

      {investigationLabel ? (
        <div className="investigation-context" role="status">
          <FileCheck2 size={17} />
          <p><strong>{investigationLabel} 조사 문맥</strong><span>{initialExecutionId} 실행의 전체 Evidence Chain에서 해당 구간을 우선 확인합니다.</span></p>
          <StatusBadge tone="info">TRACE LINKED</StatusBadge>
        </div>
      ) : null}

      <SectionCard className="search-assist-card" title="감사 실행 검색" description="현재 인증 사용자의 Institution·Workload 범위 안에서 서버 Read Model을 검색합니다." actions={<Search size={16} />}>
        <form className="search-filter-grid" onSubmit={search}>
          <label className="field">
            <span>Workload ID</span>
            <SearchAssistInput value={workloadId} onChange={setWorkloadId} suggestions={workloadSuggestions} placeholder="예: customer 또는 tokenized 입력" ariaLabel="감사 Workload 검색" />
          </label>
          <label className="field">
            <span>Status</span>
            <select value={status} onChange={(event) => setStatus(event.target.value)}>
              <option value="">전체 상태</option>
              <option value="COMPLETED">COMPLETED</option>
              <option value="REVIEW_REQUIRED">REVIEW_REQUIRED</option>
              <option value="BLOCKED">BLOCKED</option>
              <option value="EGRESSING">EGRESSING</option>
              <option value="EXTERNALLY_RECONCILED">EXTERNALLY_RECONCILED</option>
              <option value="FAILED">FAILED</option>
            </select>
          </label>
          <label className="field"><span>From</span><input type="datetime-local" value={from} onChange={(event) => setFrom(event.target.value)} /></label>
          <label className="field"><span>To</span><input type="datetime-local" value={to} onChange={(event) => setTo(event.target.value)} /></label>
          <div className="search-filter-actions">
            <button className="button button-primary" type="submit"><Search size={15} />검색</button>
            <button className="button button-secondary" type="button" onClick={resetSearch} title="검색 조건 초기화"><RotateCcw size={15} /></button>
          </div>
        </form>
        {activeFilters.length ? <div className="active-filter-row" aria-label="적용된 검색 조건">{activeFilters.map((filter) => <span key={filter}>{filter}</span>)}</div> : null}
      </SectionCard>

      <div className="audit-workspace">
        <SectionCard
          className="audit-list-card"
          title="감사 실행 목록"
          description="실행을 선택하면 오른쪽에서 전체 증적을 확인할 수 있습니다."
          actions={audit.data ? <span className="result-count">총 {audit.data.totalElements}건</span> : undefined}
        >
          <div className={`table-shell audit-table-shell${isRefreshing ? ' is-refreshing' : ''}`} aria-busy={isRefreshing}>
            <div className="table-head table-audit">
              <span>발생 시각</span><span>Execution ID</span><span>Workload</span><span>Final Action</span><span>Status</span>
            </div>
            {audit.isLoading ? <LoadingPanel label="감사 실행 목록을 불러오는 중입니다" /> : audit.isError ? (
              <ErrorState description={normalizeApiError(audit.error).message} onRetry={() => audit.refetch()} compact />
            ) : audit.data?.items.length ? audit.data.items.map((item) => (
              <button
                className={`table-row table-audit${submittedExecutionId === item.executionId ? ' active' : ''}`}
                type="button"
                disabled={isRefreshing}
                key={item.executionId}
                onClick={() => selectExecution(item.executionId)}
              >
                <span>{new Date(item.createdAt).toLocaleString('ko-KR')}</span>
                <code>{item.executionId}</code>
                <span>{item.workloadId}</span>
                <StatusBadge tone={item.finalAction === 'BLOCK' ? 'danger' : item.finalAction === 'REVIEW' ? 'warning' : 'success'}>{item.finalAction}</StatusBadge>
                <span>{item.status}</span>
              </button>
            )) : <EmptyState title="검색 결과가 없습니다" description={activeFilters.length ? '현재 권한 범위에서 검색 조건에 일치하는 Runtime 실행이 없습니다.' : '현재 권한 범위에 저장된 Runtime 실행 이력이 없습니다.'} />}
          </div>
          <div className="pagination-row">
            <span>{audit.data ? `총 ${audit.data.totalElements}건 · ${audit.data.page + 1}/${Math.max(totalPages, 1)} 페이지` : '조회 대기'}</span>
            <div>
              <button className="button button-secondary" type="button" disabled={(searchParams.page ?? 0) === 0 || isRefreshing} onClick={() => changePage(Math.max(0, (searchParams.page ?? 0) - 1))}>이전</button>
              <button className="button button-secondary" type="button" disabled={!totalPages || (searchParams.page ?? 0) + 1 >= totalPages || isRefreshing} onClick={() => changePage((searchParams.page ?? 0) + 1)}>다음</button>
            </div>
          </div>
        </SectionCard>

        <SectionCard
          className="audit-detail-card"
          title={selectedPack.key === 'digital-asset' ? '거래 실행 증적' : '고객상담 AI 안전 실행 증적'}
          description="선택한 실행의 정책, 외부 전송과 복구 증적을 원문 없이 확인합니다."
          actions={evidence.data ? <StatusBadge tone="success">{evidence.data.runtimeStatus}</StatusBadge> : undefined}
        >
          {submittedExecutionId ? (
            <div className="audit-evidence-stack">
              <AuditExportPanel key={submittedExecutionId} executionId={submittedExecutionId} />
              {evidence.isLoading ? <LoadingPanel label="감사 증적을 불러오는 중입니다" /> : evidence.isError ? (
                <ErrorState description="상세 실행 증적은 승인 권한이 있는 운영자만 조회할 수 있습니다." onRetry={() => evidence.refetch()} compact />
              ) : evidence.data ? (
                <>
                  <div
                    ref={policyDecisionEvidenceRef}
                    id="policy-decision-evidence"
                    className={requestedSection === 'decision' ? 'anchored-section evidence-focus-section evidence-focus-section-active' : 'anchored-section evidence-focus-section'}
                    tabIndex={-1}
                    aria-label="Policy Decision Evidence"
                  >
                  <KeyValues items={[
                    ['Execution ID', evidence.data.executionId],
                    ['Trace ID', evidence.data.traceId],
                    ['Workload', evidence.data.workloadId],
                    ['Purpose', evidence.data.purposeCode],
                    ['Final Action', evidence.data.policy.finalAction ?? '—'],
                    ['Policy Version', evidence.data.policy.policyVersion ?? '—'],
                    ['Destination', evidence.data.egress.destinationProfileId ?? '—'],
                    ['Connector', evidence.data.egress.connectorStatus ?? '—'],
                    ['Recovery', String(evidence.data.recovery.recoveryStatus ?? '—')],
                    ['Export Digest', evidence.data.exportContentDigest],
                  ]} />
                  </div>
                  <div
                    ref={postExecutionEvidenceRef}
                    id="post-execution-evidence"
                    className={requestedSection === 'post-execution' || requestedSection === 'response-guard' ? 'anchored-section evidence-focus-section evidence-focus-section-active' : 'anchored-section evidence-focus-section'}
                    tabIndex={-1}
                    aria-label="우선 확인 Evidence"
                  >
                    <h3>External Execution & Response Evidence</h3>
                    <p className="helper-text">Provider 전송부터 Response Guard와 Controlled Delivery까지 검증합니다.</p>
                    <KeyValues items={[
                      ['Destination Profile', evidence.data.egress.destinationProfileId ?? '—'],
                      ['Outbound Guard', evidence.data.egress.outboundGuardStatus ?? '—'],
                      ['Connector Status', evidence.data.egress.connectorStatus ?? '—'],
                      ['Provider Request Digest', evidence.data.egress.providerRequestDigest ?? '—'],
                      ['Provider Response Digest', evidence.data.egress.providerResponseDigest ?? '—'],
                      ['Response Guard', evidence.data.egress.responseGuardStatus ?? '—'],
                      ['Controlled Delivery', evidence.data.egress.controlledDeliveryStatus ?? '—'],
                      ['Delivered Response Digest', evidence.data.egress.controlledDeliveryResponseDigest ?? '—'],
                      ['Recovery Status', String(evidence.data.recovery.recoveryStatus ?? '—')],
                      ['Status Query Evidence', String(evidence.data.recovery.statusQueryEvidenceDigest ?? '—')],
                    ]} />
                  </div>
                </>
              ) : null}
            </div>
          ) : (
            <EmptyState icon={Search} title="실행 선택 대기" description="왼쪽 감사 실행 목록에서 확인할 실행을 선택하세요." />
          )}
        </SectionCard>
      </div>

      <div className="notice notice-info">
        <LockKeyhole size={17} />
        <p><b>Privacy-safe Audit</b><span>Raw Prompt, 고객·계좌 원문, Token Map은 표시하지 않습니다. Metadata, Digest, Reason Code만 조회합니다.</span></p>
      </div>
    </section>
  );
}
