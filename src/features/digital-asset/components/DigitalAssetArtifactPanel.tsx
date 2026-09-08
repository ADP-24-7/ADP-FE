import { FileCheck2, Search } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { normalizeApiError } from '../../../shared/api/apiError';
import { EmptyState, ErrorState, KeyValues, LoadingPanel, SearchAssistInput, SectionCard, StatusBadge } from '../../../shared/components';
import { usePolicyLifecycle } from '../../policy-lifecycle';
import { useActivateDigitalAssetArtifact, useDigitalAssetArtifact, useIngestDigitalAssetArtifact } from '../hooks/useDigitalAssetArtifact';
import { isSha256Digest } from '../model/runtimeContract';

export function DigitalAssetArtifactPanel() {
  const [artifactId, setArtifactId] = useState('');
  const [artifactVersion, setArtifactVersion] = useState('');
  const [lookup, setLookup] = useState({ artifactId: '', artifactVersion: '' });
  const [manifestReference, setManifestReference] = useState('');
  const [expectedContentDigest, setExpectedContentDigest] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [activationConfirmed, setActivationConfirmed] = useState(false);
  const artifact = useDigitalAssetArtifact(lookup.artifactId, lookup.artifactVersion);
  const ingestion = useIngestDigitalAssetArtifact();
  const activation = useActivateDigitalAssetArtifact();
  const record = artifact.data ?? (
    lookup.artifactId === ingestion.data?.artifactId && lookup.artifactVersion === ingestion.data?.artifactVersion
      ? ingestion.data
      : undefined
  );
  const lifecycle = usePolicyLifecycle(record?.artifactId ?? '', record?.artifactVersion ?? '');
  const artifactSuggestions = [
    {
      value: 'DA-DIGITAL-ASSET-RUNTIME-LOCAL-ACTIVE-001',
      label: 'Local ACTIVE Runtime Artifact',
      description: 'BE local fixture에서 Runtime이 선택하는 Artifact',
      source: 'local-example' as const,
    },
    {
      value: 'DA-DIGITAL-ASSET-RUNTIME-CANDIDATE-001',
      label: 'Local Candidate Artifact',
      description: 'Artifact ingestion 검증용 ID 예시',
      source: 'local-example' as const,
    },
  ];

  function submitLookup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLookup({ artifactId: artifactId.trim(), artifactVersion: artifactVersion.trim() });
  }

  function submitIngestion(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const digest = expectedContentDigest.trim();
    if (!confirmed || !isSha256Digest(digest)) return;
    ingestion.mutate(
      { manifestReference: manifestReference.trim(), expectedContentDigest: digest },
      {
        onSuccess: (result) => {
          setArtifactId(result.artifactId);
          setArtifactVersion(result.artifactVersion);
          setLookup({ artifactId: result.artifactId, artifactVersion: result.artifactVersion });
          setConfirmed(false);
        },
      },
    );
  }

  const canActivate = lifecycle.data?.lifecycleStage === 'APPROVED';

  return (
    <SectionCard
      className="search-assist-card"
      title="Digital Asset Artifact"
      description="BE-owned 검증을 통과한 5-role Bundle의 Lifecycle Candidate를 조회하거나 등록합니다."
      actions={record ? <StatusBadge tone="success">{lifecycle.data?.lifecycleStage ?? record.lifecycleStage}</StatusBadge> : <StatusBadge tone="info">P0-5/P0-6</StatusBadge>}
    >
      <div className="content-grid content-grid-two artifact-control-grid">
        <form className="form-grid compact-form-grid" onSubmit={submitLookup}>
          <label className="field"><span>Artifact ID</span><SearchAssistInput value={artifactId} onChange={setArtifactId} suggestions={artifactSuggestions} placeholder="ACTIVE 또는 CANDIDATE 입력" ariaLabel="Digital Asset Artifact ID" required /></label>
          <label className="field"><span>Version</span><input value={artifactVersion} onChange={(event) => setArtifactVersion(event.target.value)} placeholder="1.0.0" required /></label>
          <button className="button button-secondary" type="submit"><Search size={15} />Artifact 조회</button>
        </form>
        <form className="form-grid compact-form-grid" onSubmit={submitIngestion}>
          <label className="field field-full"><span>Manifest Reference</span><input value={manifestReference} onChange={(event) => setManifestReference(event.target.value)} placeholder="validated/.../manifest.json" required /></label>
          <label className="field field-full"><span>Expected Content Digest</span><input value={expectedContentDigest} onChange={(event) => setExpectedContentDigest(event.target.value)} placeholder="sha256:64 lowercase hex" required /></label>
          <label className="checkbox-row field-full">
            <input type="checkbox" checked={confirmed} onChange={(event) => setConfirmed(event.target.checked)} />
            <span>BE 검증과 Lifecycle CANDIDATE 등록을 요청합니다.</span>
          </label>
          <button className="button button-primary" type="submit" disabled={!confirmed || !isSha256Digest(expectedContentDigest.trim()) || ingestion.isPending}>
            <FileCheck2 size={15} />{ingestion.isPending ? '검증 중...' : 'Bundle 검증 및 등록'}
          </button>
        </form>
      </div>

      {artifact.isLoading || ingestion.isPending ? <LoadingPanel label="Artifact 무결성과 Lifecycle을 확인하는 중입니다" /> : artifact.isError ? (
        <ErrorState description={normalizeApiError(artifact.error).message} onRetry={() => artifact.refetch()} />
      ) : ingestion.isError ? (
        <ErrorState title="Artifact 등록에 실패했습니다" description={normalizeApiError(ingestion.error).message} onRetry={() => ingestion.mutate({ manifestReference: manifestReference.trim(), expectedContentDigest: expectedContentDigest.trim() })} />
      ) : record ? (
        <div className="result-stack">
          <KeyValues items={[
            ['Artifact', `${record.artifactId} · ${record.artifactVersion}`],
            ['Ingest Stage', record.lifecycleStage],
            ['Policy Lifecycle', lifecycle.isLoading ? '조회 중' : lifecycle.data?.lifecycleStage ?? '조회 필요'],
            ['Artifact Digest', record.artifactDigest],
            ['Canonical Contract', `${record.canonicalContractVersion} · ${record.canonicalContractDigest}`],
            ['Runtime Control', `${record.runtimeControlVersion} · ${record.runtimeControlDigest}`],
            ['Crosswalk', `${record.crosswalkVersion} · ${record.crosswalkDigest}`],
            ['Workload / Purpose', `${record.workloadId} / ${record.purposeCode}`],
            ['Destination Profile', record.destinationProfileId],
            ['Manifest', `${record.manifestReference} · ${record.fileCount} files`],
            ['Ingested By / At', `${record.ingestedBy} · ${record.ingestedAt}`],
          ]} />
          {lifecycle.data && lifecycle.data.lifecycleStage !== 'ACTIVE' ? (
            <div className="command-confirmation-row">
              <label className="checkbox-row">
                <input type="checkbox" checked={activationConfirmed} onChange={(event) => setActivationConfirmed(event.target.checked)} disabled={!canActivate} />
                <span>{canActivate ? '승인된 Candidate를 단일 ACTIVE Runtime Artifact로 승격합니다.' : '별도 Checker가 Lifecycle을 APPROVED로 전이한 뒤 활성화할 수 있습니다.'}</span>
              </label>
              <button
                className="button button-primary"
                type="button"
                disabled={!canActivate || !activationConfirmed || activation.isPending}
                onClick={() => activation.mutate({ artifactId: record.artifactId, artifactVersion: record.artifactVersion })}
              >
                <FileCheck2 size={15} />{activation.isPending ? '활성화 중...' : 'Runtime Artifact 활성화'}
              </button>
            </div>
          ) : null}
          {activation.isError ? <ErrorState title="Artifact 활성화에 실패했습니다" description={normalizeApiError(activation.error).message} onRetry={() => activation.reset()} /> : null}
          {activation.data ? <KeyValues items={[
            ['ACTIVE Artifact', `${activation.data.artifactId} · ${activation.data.artifactVersion}`],
            ['Runtime Control', `${activation.data.runtimeControlVersion} · ${activation.data.runtimeControlDigest}`],
            ['Crosswalk', `${activation.data.crosswalkVersion} · ${activation.data.crosswalkDigest}`],
            ['Activated By / At', `${activation.data.activatedBy} · ${activation.data.activatedAt}`],
          ]} /> : null}
        </div>
      ) : (
        <EmptyState compact title="Artifact 조회 또는 등록 대기" description="로컬 경로 또는 NCP reference는 BE의 server-owned ContentStore 설정으로만 해석됩니다." endpoint="GET/POST /api/admin/digital-assets/artifacts/**" />
      )}
    </SectionCard>
  );
}
