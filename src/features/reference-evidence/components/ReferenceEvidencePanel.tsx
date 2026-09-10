import { BookOpenCheck, RefreshCw, Search } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { normalizeApiError } from '../../../shared/api/apiError';
import { EmptyState, ErrorState, KeyValues, LoadingPanel, SectionCard, StatusBadge } from '../../../shared/components';
import { useReferenceEvidence, useReferenceEvidenceDetail } from '../hooks/useReferenceEvidence';
import type { ReferenceEvidenceSearch, ReferenceEvidenceType } from '../model/types';

const evidenceTypes: ReferenceEvidenceType[] = ['REGULATION', 'REGULATORY_SANDBOX', 'POLICY_GUIDE', 'BANK_TREND', 'DIGITAL_ASSET_INFRA'];

export function ReferenceEvidencePanel() {
  const [type, setType] = useState<ReferenceEvidenceType | ''>('');
  const [workloadId, setWorkloadId] = useState('');
  const [query, setQuery] = useState('');
  const [params, setParams] = useState<ReferenceEvidenceSearch>({ limit: 20, offset: 0 });
  const [selected, setSelected] = useState({ evidenceId: '', evidenceVersion: '' });
  const evidence = useReferenceEvidence(params);
  const detail = useReferenceEvidenceDetail(selected.evidenceId, selected.evidenceVersion);
  const page = Math.floor((params.offset ?? 0) / (params.limit ?? 20));
  const totalPages = evidence.data ? Math.ceil(evidence.data.total / evidence.data.limit) : 0;

  function search(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSelected({ evidenceId: '', evidenceVersion: '' });
    setParams({ evidenceType: type || undefined, workloadId: workloadId.trim() || undefined, query: query.trim() || undefined, limit: 20, offset: 0 });
  }

  function changePage(nextPage: number) {
    setSelected({ evidenceId: '', evidenceVersion: '' });
    setParams((current) => ({ ...current, offset: nextPage * (current.limit ?? 20) }));
  }

  return (
    <div className="reference-evidence-stack">
      <SectionCard className="search-assist-card" title="Reference Evidence" description="Runtime Policy와 분리된 관리자 보조 근거를 Institution·Workload Scope 안에서 탐색합니다.">
        <form className="search-filter-grid reference-evidence-filter" onSubmit={search}>
          <label className="field"><span>Evidence Type</span><select value={type} onChange={(event) => setType(event.target.value as ReferenceEvidenceType | '')}><option value="">전체 Type</option>{evidenceTypes.map((item) => <option key={item}>{item}</option>)}</select></label>
          <label className="field"><span>Workload ID</span><input value={workloadId} onChange={(event) => setWorkloadId(event.target.value)} placeholder="Workload scope" /></label>
          <label className="field"><span>검색어</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Title · Authority · Claim" /></label>
          <div className="search-filter-actions"><button className="button button-primary" type="submit" disabled={evidence.isFetching}><Search size={14} />검색</button><button className="button button-secondary" type="button" onClick={() => evidence.refetch()} disabled={evidence.isFetching} title="Reference Evidence 새로고침"><RefreshCw size={14} /></button></div>
        </form>
        <div className="table-shell reference-evidence-table-shell">
          <div className="table-head table-reference-evidence"><span>TYPE / STATUS</span><span>TITLE / AUTHORITY</span><span>VERSION</span><span>WORKLOAD</span><span>EFFECTIVE</span></div>
          {evidence.isLoading ? <LoadingPanel label="Reference Evidence를 불러오는 중입니다" /> : evidence.isError ? <ErrorState description={normalizeApiError(evidence.error).message} onRetry={() => evidence.refetch()} /> : evidence.data?.items.length ? evidence.data.items.map((item) => (
            <button key={`${item.evidenceId}:${item.evidenceVersion}`} type="button" className={`table-row table-reference-evidence${selected.evidenceId === item.evidenceId && selected.evidenceVersion === item.evidenceVersion ? ' active' : ''}`} onClick={() => setSelected({ evidenceId: item.evidenceId, evidenceVersion: item.evidenceVersion })}>
              <span><StatusBadge tone="info">{item.evidenceType}</StatusBadge><small>{item.status}</small></span><span><strong>{item.title}</strong><small>{item.authority}</small></span><code>{item.evidenceId} · {item.evidenceVersion}</code><span>{item.workloadRefs.join(' · ') || '공통'}</span><span>{item.effectiveFrom ?? '—'} ~ {item.effectiveTo ?? '—'}</span>
            </button>
          )) : <EmptyState icon={BookOpenCheck} title="Reference Evidence가 없습니다" description="현재 검색 조건과 권한 범위에 등록된 보조 근거가 없습니다. Gateway Runtime은 Evidence 부재와 독립적으로 동작합니다." endpoint="GET /api/admin/reference-evidence" />}
        </div>
        <div className="pagination-row"><span>{evidence.data ? `${evidence.data.total}건 · ${page + 1}/${Math.max(totalPages, 1)} 페이지` : '조회 대기'}</span><div><button className="button button-secondary" type="button" disabled={page === 0 || evidence.isFetching} onClick={() => changePage(page - 1)}>이전</button><button className="button button-secondary" type="button" disabled={!totalPages || page + 1 >= totalPages || evidence.isFetching} onClick={() => changePage(page + 1)}>다음</button></div></div>
      </SectionCard>
      <SectionCard title="Evidence Detail" description="Source와 Analysis를 분리하고 원문 대신 위치·Version·Digest를 확인합니다.">
        {!selected.evidenceId ? <EmptyState icon={BookOpenCheck} title="Evidence 선택 대기" description="위 목록에서 관리자 보조 근거를 선택하세요." /> : detail.isLoading ? <LoadingPanel label="Evidence 상세를 불러오는 중입니다" /> : detail.isError ? <ErrorState description={normalizeApiError(detail.error).message} onRetry={() => detail.refetch()} /> : detail.data ? <KeyValues items={[
          ['Evidence', `${detail.data.evidenceId} · ${detail.data.evidenceVersion}`], ['Bundle', `${detail.data.bundleId} · ${detail.data.bundleVersion}`], ['Source', `${detail.data.sourceRef} · ${detail.data.sourceLocator}`], ['Analysis', `${detail.data.analysisRef} · ${detail.data.analysisVersion}`], ['Claim Scope', detail.data.claimScope], ['Claim Summary', detail.data.claimSummary], ['Workload Relevance', detail.data.workloadRefs.join(' · ') || '공통'], ['Content Digest', detail.data.contentDigest],
        ]} /> : null}
      </SectionCard>
    </div>
  );
}
