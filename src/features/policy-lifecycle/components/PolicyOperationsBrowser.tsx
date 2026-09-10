import { ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { useEffect, useState, type FormEvent } from 'react';
import { normalizeApiError } from '../../../shared/api/apiError';
import { EmptyState, ErrorState, LoadingPanel, SectionCard, StatusBadge } from '../../../shared/components';
import { usePolicyArtifactHistory, usePolicyArtifacts } from '../hooks/usePolicyLifecycle';
import { DEFAULT_TABLE_PAGE_SIZE } from '../../../shared/config/pagination';
import type { ExecutionPackType, PolicyArtifactSummary, PolicyLifecycleStage } from '../model/types';

const PAGE_SIZE = DEFAULT_TABLE_PAGE_SIZE;
const stages: PolicyLifecycleStage[] = [
  'DRAFT', 'VALIDATED', 'CANDIDATE', 'REPLAY', 'SHADOW', 'APPROVED', 'ACTIVE', 'SUPERSEDED', 'REVIEW', 'ROLLED_BACK',
];

type Props = {
  executionPack: ExecutionPackType;
  selectedArtifactId: string;
  selectedArtifactVersion: string;
  onSelect: (artifact: PolicyArtifactSummary) => void;
  onClearSelection: () => void;
};

export function PolicyOperationsBrowser({
  executionPack, selectedArtifactId, selectedArtifactVersion, onSelect, onClearSelection,
}: Props) {
  const [queryInput, setQueryInput] = useState('');
  const [query, setQuery] = useState('');
  const [stage, setStage] = useState<PolicyLifecycleStage | ''>('');
  const [actionableOnly, setActionableOnly] = useState(false);
  const [offset, setOffset] = useState(0);
  const artifacts = usePolicyArtifacts({
    executionPack, lifecycleStage: stage || undefined, query: query || undefined,
    actionableOnly, limit: PAGE_SIZE, offset,
  });
  const history = usePolicyArtifactHistory(selectedArtifactId, selectedArtifactVersion);

  useEffect(() => setOffset(0), [executionPack]);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onClearSelection();
    setOffset(0);
    setQuery(queryInput.trim());
  }

  function changeStage(value: PolicyLifecycleStage | '') {
    onClearSelection();
    setOffset(0);
    setStage(value);
  }

  function changeActionableOnly(value: boolean) {
    onClearSelection();
    setOffset(0);
    setActionableOnly(value);
  }

  function changePage(nextOffset: number) {
    setOffset(nextOffset);
  }

  return (
    <SectionCard
      title="Policy Operations"
      description="권한 범위의 Artifact를 검색하고 Lifecycle·승인 Evidence를 탐색합니다."
      actions={artifacts.data ? <span className="result-count">정책 {artifacts.data.total}개</span> : undefined}
    >
      <form className="recovery-toolbar" onSubmit={submit}>
        <label className="field field-grow"><span>Artifact 검색</span><input value={queryInput} onChange={(event) => setQueryInput(event.target.value)} placeholder="ID, Version, Workload, Purpose, 생성자" /></label>
        <label className="field"><span>Lifecycle Stage</span><select value={stage} onChange={(event) => changeStage(event.target.value as PolicyLifecycleStage | '')}><option value="">전체</option>{stages.map((item) => <option value={item} key={item}>{item}</option>)}</select></label>
        <label className="checkbox-row"><input type="checkbox" checked={actionableOnly} onChange={(event) => changeActionableOnly(event.target.checked)} /><span>조치 가능만</span></label>
        <button className="button button-secondary" type="submit"><Search size={15} />검색</button>
      </form>

      {artifacts.isLoading ? <LoadingPanel label="Policy Artifact 목록을 불러오는 중입니다" /> : artifacts.isError ? (
        <ErrorState description={normalizeApiError(artifacts.error).message} onRetry={() => artifacts.refetch()} />
      ) : !artifacts.data || artifacts.data.items.length === 0 ? (
        <EmptyState compact title="Policy Artifact가 없습니다" description="현재 Pack·Stage·검색 조건과 권한 Scope에 일치하는 Artifact가 없습니다." />
      ) : (
        <div className={`table-shell${artifacts.isFetching ? ' is-refreshing' : ''}`}>
          <div className="table-head table-policy-artifacts"><span>Artifact</span><span>Scope</span><span>Stage</span><span>Updated</span></div>
          {artifacts.data.items.map((item) => (
            <button
              className={`table-row table-policy-artifacts${selectedArtifactId === item.artifactId && selectedArtifactVersion === item.artifactVersion ? ' active' : ''}`}
              type="button"
              key={`${item.artifactId}:${item.artifactVersion}`}
              onClick={() => onSelect(item)}
            >
              <span><code>{item.artifactId}</code><small>{item.artifactVersion}</small></span>
              <span>{item.workloadId}<small>{item.purposeCode}</small></span>
              <span><StatusBadge tone={item.currentSelection ? 'success' : item.lifecycleStage === 'REVIEW' ? 'warning' : 'neutral'}>{item.currentSelection ? 'CURRENT' : item.lifecycleStage}</StatusBadge><small>{item.nextAction ?? 'NO ACTION'}</small></span>
              <span>{new Date(item.updatedAt).toLocaleString('ko-KR')}<small>rev {item.revision}</small></span>
            </button>
          ))}
          <div className="pagination-row">
            <span>{offset + 1}-{Math.min(offset + PAGE_SIZE, artifacts.data.total)} / {artifacts.data.total}</span>
            <div>
              <button className="button button-secondary button-icon" type="button" aria-label="이전 Policy Artifact" disabled={offset === 0} onClick={() => changePage(Math.max(0, offset - PAGE_SIZE))}><ChevronLeft size={15} /></button>
              <button className="button button-secondary button-icon" type="button" aria-label="다음 Policy Artifact" disabled={offset + PAGE_SIZE >= artifacts.data.total} onClick={() => changePage(offset + PAGE_SIZE)}><ChevronRight size={15} /></button>
            </div>
          </div>
        </div>
      )}

      {!selectedArtifactId ? (
        <EmptyState compact title="Artifact 선택 대기" description="목록에서 Artifact를 선택하면 Transition과 Shadow Evidence를 조회합니다." />
      ) : history.isLoading ? <LoadingPanel label="Policy History를 불러오는 중입니다" /> : history.isError ? (
        <ErrorState description={normalizeApiError(history.error).message} onRetry={() => history.refetch()} />
      ) : history.data ? (
        <div className="content-grid content-grid-two policy-history-grid">
          <div className="history-list"><h3>Transition History · {history.data.transitions.length}/{history.data.transitionTotal}</h3>{history.data.transitions.length === 0 ? <p className="helper-text">저장된 전이 이력이 없습니다.</p> : history.data.transitions.map((item) => <article key={item.transitionId}><strong>{item.fromStage} → {item.toStage}</strong><span>{item.reasonCode}</span><small>{item.actorId} · {new Date(item.occurredAt).toLocaleString('ko-KR')}</small></article>)}{history.data.transitionHasMore ? <p className="helper-text">최근 100건만 표시합니다.</p> : null}</div>
          <div className="history-list"><h3>Shadow Evidence · {history.data.shadowEvaluations.length}/{history.data.shadowTotal}</h3>{history.data.shadowEvaluations.length === 0 ? <p className="helper-text">저장된 Shadow Evidence가 없습니다.</p> : history.data.shadowEvaluations.map((item) => <article key={item.shadowEvaluationId}><strong>{item.result} · {item.evaluationCaseId}</strong><span>{item.diffFields.length ? item.diffFields.join(', ') : '변경 없음'}</span><small>{item.evaluatedBy} · {new Date(item.evaluatedAt).toLocaleString('ko-KR')}</small></article>)}{history.data.shadowHasMore ? <p className="helper-text">최근 100건만 표시합니다.</p> : null}</div>
        </div>
      ) : null}
    </SectionCard>
  );
}
