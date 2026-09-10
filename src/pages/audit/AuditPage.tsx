import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { useSearchParams as useRouterSearchParams } from 'react-router-dom';
import { FileCheck2, LockKeyhole, RotateCcw, Search } from 'lucide-react';
import { useAuditExecutions, useExecutionEvidence } from '../../features/audit-trace';
import type { AuditSearchParams } from '../../features/audit-trace';
import { normalizeApiError } from '../../shared/api/apiError';
import { EmptyState, ErrorState, KeyValues, LoadingPanel, PackContextSummary, PageHeader, SearchAssistInput, SectionCard, StatusBadge } from '../../shared/components';
import { useExecutionPack } from '../../shared/prototype';

export function AuditPage() {
  const [routeSearchParams] = useRouterSearchParams();
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
  const [executionId, setExecutionId] = useState(initialExecutionId);
  const [submittedExecutionId, setSubmittedExecutionId] = useState(initialExecutionId);
  const [workloadId, setWorkloadId] = useState('');
  const [status, setStatus] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [searchParams, setSearchParams] = useState<AuditSearchParams>({ size: 20 });
  const audit = useAuditExecutions(searchParams);
  const evidence = useExecutionEvidence(submittedExecutionId);
  const postExecutionEvidenceRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!evidence.data || (requestedSection !== 'post-execution' && requestedSection !== 'response-guard')) return;

    const section = postExecutionEvidenceRef.current;
    if (!section) return;

    section.scrollIntoView?.({ behavior: 'smooth', block: 'center' });
    section.focus({ preventScroll: true });
  }, [evidence.data, requestedSection]);

  const workloadSuggestions = useMemo(() => {
    const apiValues = [...new Set(audit.data?.items.map((item) => item.workloadId) ?? [])];
    return [
      ...apiValues.map((value) => ({ value, description: '현재 감사 목록에서 확인된 Workload', source: 'api' as const })),
      ...[
        { value: 'customer_summary', label: 'AI 고객 요약', description: 'BE local fixture Workload', source: 'local-example' as const },
        { value: 'tokenized_asset_purchase', label: 'Digital Asset 구매', description: 'BE local fixture Workload', source: 'local-example' as const },
      ].filter((example) => !apiValues.includes(example.value)),
    ];
  }, [audit.data?.items]);

  const executionSuggestions = useMemo(() => (
    audit.data?.items.map((item) => ({
      value: item.executionId,
      label: `${item.workloadId} · ${item.status}`,
      description: new Date(item.createdAt).toLocaleString('ko-KR'),
      source: 'api' as const,
    })) ?? []
  ), [audit.data?.items]);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmittedExecutionId(executionId.trim());
  }

  function search(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSearchParams({
      workloadId: workloadId.trim() || undefined,
      status: status || undefined,
      from: from ? new Date(from).toISOString() : undefined,
      to: to ? new Date(to).toISOString() : undefined,
      page: 0,
      size: 20,
    });
  }

  function resetSearch() {
    setWorkloadId('');
    setStatus('');
    setFrom('');
    setTo('');
    setSearchParams({ size: 20 });
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
        actions={<StatusBadge tone={audit.isSuccess ? 'success' : 'warning'}>{audit.isSuccess ? 'AUDIT API CONNECTED' : 'AUDIT API'}</StatusBadge>}
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

      <SectionCard className="search-assist-card" title="Evidence Pack 조회" description="검색 결과에서 선택하거나 Execution ID를 직접 입력해 Privacy-safe 감사 증적을 조회합니다." actions={<FileCheck2 size={16} />}>
        <form className="search-row" onSubmit={submit}>
          <label className="field field-grow">
            <span>Execution ID</span>
            <SearchAssistInput value={executionId} onChange={setExecutionId} suggestions={executionSuggestions} placeholder="검색 결과의 Execution ID 선택 또는 직접 입력" ariaLabel="Evidence Execution ID" required />
          </label>
          <button className="button button-primary" type="submit">검색</button>
        </form>
      </SectionCard>

      <SectionCard title={selectedPack.key === 'digital-asset' ? '거래 실행 증적' : '고객상담 AI 안전 실행 증적'} description={selectedPack.objective} actions={<StatusBadge tone={evidence.data ? 'success' : 'neutral'}>{evidence.data ? evidence.data.runtimeStatus : 'NO EVIDENCE'}</StatusBadge>}>
        {evidence.isLoading ? <LoadingPanel label="감사 증적을 불러오는 중입니다" /> : evidence.isError ? (
          <ErrorState description={normalizeApiError(evidence.error).message} onRetry={() => evidence.refetch()} />
        ) : evidence.data ? (
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
        ) : (
          <EmptyState icon={Search} title="Execution ID 입력 대기" description="Runtime 실행 결과의 executionId를 입력하면 digest 기반 Evidence Pack을 조회합니다." endpoint="GET /api/admin/audit/executions/{executionId}/evidence" />
        )}
      </SectionCard>

      {evidence.data ? (
        <div
          ref={postExecutionEvidenceRef}
          id="post-execution-evidence"
          className={requestedSection === 'post-execution' || requestedSection === 'response-guard' ? 'anchored-section evidence-focus-section evidence-focus-section-active' : 'anchored-section evidence-focus-section'}
          tabIndex={-1}
          aria-label="우선 확인 Evidence"
        >
          <SectionCard
            title="External Execution & Response Evidence"
            description="Provider 전송부터 Response Guard와 Controlled Delivery까지 원문 없이 검증합니다."
            actions={<StatusBadge tone={requestedSection ? 'info' : 'neutral'}>{requestedSection === 'response-guard' ? 'RESPONSE GUARD' : requestedSection === 'post-execution' ? 'POST EXECUTION' : 'EVIDENCE'}</StatusBadge>}
          >
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
          </SectionCard>
        </div>
      ) : null}

      <SectionCard title="감사 실행 목록" description="적용된 검색 조건과 권한 범위에 해당하는 실행만 최신순으로 표시합니다." actions={<StatusBadge>{audit.data ? `${audit.data.totalElements} ITEMS` : 'READ MODEL'}</StatusBadge>}>
        <div className="empty-table">
          <div className="table-head table-audit">
            <span>발생 시각</span><span>Execution ID</span><span>Workload</span><span>Final Action</span><span>Status</span>
          </div>
          {audit.isLoading ? <LoadingPanel label="감사 실행 목록을 불러오는 중입니다" /> : audit.isError ? (
            <ErrorState description={normalizeApiError(audit.error).message} onRetry={() => audit.refetch()} />
          ) : audit.data?.items.length ? audit.data.items.map((item) => (
            <button className="table-row table-audit" type="button" key={item.executionId} onClick={() => { setExecutionId(item.executionId); setSubmittedExecutionId(item.executionId); }}>
              <span>{new Date(item.createdAt).toLocaleString('ko-KR')}</span>
              <code>{item.executionId}</code>
              <span>{item.workloadId}</span>
              <StatusBadge tone={item.finalAction === 'BLOCK' ? 'danger' : item.finalAction === 'REVIEW' ? 'warning' : 'success'}>{item.finalAction}</StatusBadge>
              <span>{item.status}</span>
            </button>
          )) : <EmptyState title="검색 결과가 없습니다" description={activeFilters.length ? '현재 권한 범위에서 검색 조건에 일치하는 Runtime 실행이 없습니다.' : '현재 권한 범위에 저장된 Runtime 실행 이력이 없습니다.'} endpoint="GET /api/admin/audit/executions" />}
        </div>
      </SectionCard>

      <div className="notice notice-info">
        <LockKeyhole size={17} />
        <p><b>Privacy-safe Audit</b><span>Raw Prompt, 고객·계좌 원문, Token Map은 표시하지 않습니다. Metadata, Digest, Reason Code만 조회합니다.</span></p>
      </div>
    </section>
  );
}
