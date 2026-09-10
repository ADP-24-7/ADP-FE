import { ChevronLeft, ChevronRight, Eye, FileCheck2, RefreshCw, Search } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { normalizeApiError } from '../../../shared/api/apiError';
import { EmptyState, ErrorState, KeyValues, LoadingPanel, SectionCard, StatusBadge } from '../../../shared/components';
import {
  useActivateDigitalAssetArtifact,
  useDigitalAssetArtifactCurrentState,
  useDigitalAssetArtifactCurrentStates,
  useIngestDigitalAssetArtifact,
} from '../hooks/useDigitalAssetArtifact';
import { isSha256Digest } from '../model/runtimeContract';
import type { DigitalAssetArtifactCurrentStateItem, DigitalAssetCurrentSelectionStatus } from '../model/types';

const PAGE_SIZE = 10;
const selectionStatus: Record<DigitalAssetCurrentSelectionStatus, { label: string; tone: 'success' | 'neutral' | 'danger' }> = {
  CURRENT: { label: 'CURRENT ACTIVE', tone: 'success' },
  NOT_CURRENT: { label: 'NOT CURRENT', tone: 'neutral' },
  INCONSISTENT: { label: 'INCONSISTENT', tone: 'danger' },
};

type DigitalAssetArtifactPanelProps = {
  onOpenTrace: (executionId: string) => void;
};

export function DigitalAssetArtifactPanel({ onOpenTrace }: DigitalAssetArtifactPanelProps) {
  const [queryInput, setQueryInput] = useState('');
  const [query, setQuery] = useState('');
  const [currentOnly, setCurrentOnly] = useState(false);
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState({ artifactId: '', artifactVersion: '' });
  const [manifestReference, setManifestReference] = useState('');
  const [expectedContentDigest, setExpectedContentDigest] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [activationConfirmed, setActivationConfirmed] = useState(false);

  const artifacts = useDigitalAssetArtifactCurrentStates({
    query: query || undefined,
    currentOnly,
    page,
    size: PAGE_SIZE,
  });
  const detail = useDigitalAssetArtifactCurrentState(selected.artifactId, selected.artifactVersion);
  const ingestion = useIngestDigitalAssetArtifact();
  const activation = useActivateDigitalAssetArtifact();
  const totalPages = artifacts.data ? Math.ceil(artifacts.data.totalElements / artifacts.data.size) : 0;
  const canActivate = detail.data?.artifact.lifecycleStage === 'APPROVED';

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSelected({ artifactId: '', artifactVersion: '' });
    setPage(0);
    setQuery(queryInput.trim());
  }

  function changeCurrentOnly(value: boolean) {
    setCurrentOnly(value);
    setSelected({ artifactId: '', artifactVersion: '' });
    setPage(0);
  }

  function selectArtifact(item: DigitalAssetArtifactCurrentStateItem) {
    setActivationConfirmed(false);
    activation.reset();
    setSelected({ artifactId: item.artifactId, artifactVersion: item.artifactVersion });
  }

  function submitIngestion(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const digest = expectedContentDigest.trim();
    if (!confirmed || !isSha256Digest(digest)) return;
    ingestion.mutate(
      { manifestReference: manifestReference.trim(), expectedContentDigest: digest },
      {
        onSuccess: (result) => {
          setSelected({ artifactId: result.artifactId, artifactVersion: result.artifactVersion });
          setConfirmed(false);
        },
      },
    );
  }

  return (
    <div className="digital-asset-current-state-stack">
      <SectionCard
        title="Digital Asset Current State"
        description="현재 권한 범위의 Artifact와 Runtime에 선택된 Active 상태를 탐색합니다."
        actions={(
          <div className="section-action-group">
            <button className="button button-secondary" type="button" onClick={() => artifacts.refetch()} disabled={artifacts.isFetching} title="Current State 새로고침"><RefreshCw size={14} />새로고침</button>
          </div>
        )}
      >
        <form className="recovery-toolbar" onSubmit={submitSearch}>
          <label className="field field-grow"><span>Artifact 검색</span><input value={queryInput} onChange={(event) => setQueryInput(event.target.value)} placeholder="ID, Version, Workload, Purpose, Destination" /></label>
          <label className="checkbox-row"><input type="checkbox" checked={currentOnly} onChange={(event) => changeCurrentOnly(event.target.checked)} /><span>Current Active만</span></label>
          <button className="button button-secondary" type="submit"><Search size={15} />검색</button>
        </form>

        <div className="table-shell digital-asset-current-state-table-shell" aria-busy={artifacts.isFetching}>
          <div className="table-head table-digital-asset-current-state"><span>ARTIFACT</span><span>SCOPE</span><span>CURRENT STATE</span><span>RUNTIME EVIDENCE</span></div>
          {artifacts.isLoading ? <LoadingPanel label="Digital Asset Artifact 상태를 불러오는 중입니다" /> : artifacts.isError ? (
            <ErrorState description={normalizeApiError(artifacts.error).message} onRetry={() => artifacts.refetch()} />
          ) : artifacts.data?.items.length ? artifacts.data.items.map((item) => (
            <button
              className={`table-row table-digital-asset-current-state${selected.artifactId === item.artifactId && selected.artifactVersion === item.artifactVersion ? ' active' : ''}`}
              type="button"
              disabled={artifacts.isFetching}
              key={`${item.artifactId}:${item.artifactVersion}`}
              onClick={() => selectArtifact(item)}
            >
              <span><code>{item.artifactId}</code><small>{item.artifactVersion} · rev {item.revision}</small></span>
              <span>{item.workloadId}<small>{item.purposeCode}</small></span>
              <span><StatusBadge tone={selectionStatus[item.currentSelectionStatus].tone}>{selectionStatus[item.currentSelectionStatus].label}</StatusBadge><small>{item.lifecycleStage}</small></span>
              <span>{item.latestRuntimeStatus ?? 'NO EXECUTION'}<small>{item.runtimeExecutionCount} execution · {item.latestExecutionId ?? 'evidence 없음'}</small></span>
            </button>
          )) : (
            <EmptyState icon={Search} title="Digital Asset Artifact가 없습니다" description="현재 검색 조건과 Institution·Workload 권한 범위에 일치하는 Artifact가 없습니다." endpoint="GET /api/admin/digital-assets/artifacts" />
          )}
        </div>
        <div className="pagination-row">
          <span>{artifacts.data ? `${artifacts.data.totalElements}건 · ${artifacts.data.page + 1}/${Math.max(totalPages, 1)} 페이지` : '조회 대기'}</span>
          <div>
            <button className="button button-secondary button-icon" type="button" aria-label="이전 Digital Asset Artifact" disabled={page === 0 || artifacts.isFetching} onClick={() => { setPage(Math.max(0, page - 1)); setSelected({ artifactId: '', artifactVersion: '' }); }}><ChevronLeft size={15} /></button>
            <button className="button button-secondary button-icon" type="button" aria-label="다음 Digital Asset Artifact" disabled={!totalPages || page + 1 >= totalPages || artifacts.isFetching} onClick={() => { setPage(page + 1); setSelected({ artifactId: '', artifactVersion: '' }); }}><ChevronRight size={15} /></button>
          </div>
        </div>

        {!selected.artifactId ? (
          <EmptyState compact title="Artifact 선택 대기" description="목록에서 Artifact를 선택하면 Current Active와 Runtime·Policy Evidence를 확인합니다." />
        ) : detail.isLoading ? <LoadingPanel label="Artifact Current State 상세를 불러오는 중입니다" /> : detail.isError ? (
          <ErrorState description={normalizeApiError(detail.error).message} onRetry={() => detail.refetch()} />
        ) : detail.data ? (
          <div className="result-stack">
            <KeyValues items={[
              ['Artifact', `${detail.data.artifact.artifactId} · ${detail.data.artifact.artifactVersion}`],
              ['Current Selection', detail.data.artifact.currentSelectionStatus],
              ['Lifecycle', `${detail.data.artifact.lifecycleStage} · revision ${detail.data.artifact.revision}`],
              ['Artifact Digest', detail.data.artifact.artifactDigest],
              ['Canonical Contract', `${detail.data.canonicalContractVersion} · ${detail.data.canonicalContractDigest}`],
              ['Runtime Control', `${detail.data.runtimeControlVersion} · ${detail.data.runtimeControlDigest}`],
              ['Crosswalk', `${detail.data.crosswalkVersion} · ${detail.data.crosswalkDigest}`],
              ['Workload / Purpose', `${detail.data.artifact.workloadId} / ${detail.data.artifact.purposeCode}`],
              ['Destination Profile', detail.data.artifact.destinationProfileId],
              ['Manifest', `${detail.data.manifestReference} · ${detail.data.fileCount} files`],
              ['Activated By / At', detail.data.activeSelection ? `${detail.data.activeSelection.activatedBy} · ${new Date(detail.data.activeSelection.activatedAt).toLocaleString('ko-KR')}` : 'NOT CURRENT'],
              ['Latest Runtime', detail.data.latestRuntimeEvidence ? `${detail.data.latestRuntimeEvidence.runtimeStatus} · ${detail.data.latestRuntimeEvidence.executionId}` : 'NO EXECUTION EVIDENCE'],
              ['Approved Policy', detail.data.latestRuntimeEvidence ? `${detail.data.latestRuntimeEvidence.approvedPolicySnapshotId} · ${detail.data.latestRuntimeEvidence.approvedPolicyVersion}` : 'NO PINNED POLICY'],
              ['Post Execution', detail.data.latestRuntimeEvidence?.postExecutionStatus ?? 'NO POST EVIDENCE'],
            ]} />
            <div className="section-action-group">
              {detail.data.latestRuntimeEvidence ? <button className="button button-secondary" type="button" onClick={() => onOpenTrace(detail.data.latestRuntimeEvidence!.executionId)}><Eye size={14} />Decision Trace</button> : null}
            </div>
            {detail.data.artifact.lifecycleStage !== 'ACTIVE' ? (
              <div className="command-confirmation-row">
                <label className="checkbox-row">
                  <input type="checkbox" checked={activationConfirmed} onChange={(event) => setActivationConfirmed(event.target.checked)} disabled={!canActivate} />
                  <span>{canActivate ? '승인된 Candidate를 단일 Current Active Runtime Artifact로 승격합니다.' : '별도 Checker가 Lifecycle을 APPROVED로 전이한 뒤 활성화할 수 있습니다.'}</span>
                </label>
                <button className="button button-primary" type="button" disabled={!canActivate || !activationConfirmed || activation.isPending} onClick={() => activation.mutate({ artifactId: detail.data.artifact.artifactId, artifactVersion: detail.data.artifact.artifactVersion })}><FileCheck2 size={15} />{activation.isPending ? '활성화 중...' : 'Runtime Artifact 활성화'}</button>
              </div>
            ) : null}
            {activation.isError ? <ErrorState title="Artifact 활성화에 실패했습니다" description={normalizeApiError(activation.error).message} onRetry={() => activation.reset()} /> : null}
          </div>
        ) : null}
      </SectionCard>

      <SectionCard title="Artifact Bundle 등록" description="Server-owned Content Store에서 5-role Bundle을 검증하고 Lifecycle Candidate로 등록합니다." actions={<StatusBadge tone="info">P0-5 INGEST</StatusBadge>}>
        <form className="form-grid compact-form-grid" onSubmit={submitIngestion}>
          <label className="field field-full"><span>Manifest Reference</span><input value={manifestReference} onChange={(event) => setManifestReference(event.target.value)} placeholder="validated/.../manifest.json" required /></label>
          <label className="field field-full"><span>Expected Content Digest</span><input value={expectedContentDigest} onChange={(event) => setExpectedContentDigest(event.target.value)} placeholder="sha256:64 lowercase hex" required /></label>
          <label className="checkbox-row field-full"><input type="checkbox" checked={confirmed} onChange={(event) => setConfirmed(event.target.checked)} /><span>BE 검증과 Lifecycle CANDIDATE 등록을 요청합니다.</span></label>
          <button className="button button-primary" type="submit" disabled={!confirmed || !isSha256Digest(expectedContentDigest.trim()) || ingestion.isPending}><FileCheck2 size={15} />{ingestion.isPending ? '검증 중...' : 'Bundle 검증 및 등록'}</button>
        </form>
        {ingestion.isError ? <ErrorState title="Artifact 등록에 실패했습니다" description={normalizeApiError(ingestion.error).message} onRetry={() => ingestion.mutate({ manifestReference: manifestReference.trim(), expectedContentDigest: expectedContentDigest.trim() })} /> : null}
      </SectionCard>
    </div>
  );
}
