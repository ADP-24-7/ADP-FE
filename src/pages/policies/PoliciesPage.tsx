import { ArrowRight, LockKeyhole, RefreshCw, Search } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { DigitalAssetArtifactPanel } from '../../features/digital-asset';
import { PolicyArtifactCreatePanel, PolicyGovernancePanel, usePolicyLifecycle } from '../../features/policy-lifecycle';
import { normalizeApiError } from '../../shared/api/apiError';
import { EmptyState, ErrorState, KeyValues, LoadingPanel, PackContextSummary, PageHeader, SearchAssistInput, SectionCard, StatusBadge } from '../../shared/components';
import { useExecutionPack } from '../../shared/prototype';

const lifecycle = [
  ['DRAFT', 'Policy Owner'],
  ['VALIDATED', 'BE Validation'],
  ['CANDIDATE', 'Artifact Ready'],
  ['REPLAY', 'Operator'],
  ['SHADOW', 'Runtime Diff'],
  ['APPROVED', 'Checker'],
  ['ACTIVE', 'Version Locked'],
] as const;

const policyOutcomes = [
  ['동일 조건', 'REUSE_ALLOWED', '기존 승인정책을 그대로 집행합니다.', 'success'],
  ['보호 가능한 변경', 'TRANSFORM_REQUIRED', '승인된 처리 후 실행합니다.', 'info'],
  ['범위 확장', 'REVIEW / BLOCK', '실행 전에 중단하고 담당자가 검토합니다.', 'warning'],
] as const;

export function PoliciesPage() {
  const { selectedPack } = useExecutionPack();
  const [artifactId, setArtifactId] = useState('');
  const [artifactVersion, setArtifactVersion] = useState('');
  const [lookup, setLookup] = useState({ artifactId: '', artifactVersion: '' });
  const policy = usePolicyLifecycle(lookup.artifactId, lookup.artifactVersion);
  const artifactSuggestions = selectedPack.key === 'digital-asset' ? [
    {
      value: 'DA-DIGITAL-ASSET-RUNTIME-LOCAL-ACTIVE-001',
      label: 'Local ACTIVE Runtime Artifact',
      description: 'BE local fixture Policy Lifecycle 조회 예시',
      source: 'local-example' as const,
    },
    {
      value: 'DA-DIGITAL-ASSET-RUNTIME-CANDIDATE-001',
      label: 'Local Candidate Artifact',
      description: 'Artifact ingestion 후 Lifecycle 조회 예시',
      source: 'local-example' as const,
    },
  ] : [];

  function submitLookup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLookup({ artifactId: artifactId.trim(), artifactVersion: artifactVersion.trim() });
  }

  return (
    <section className="page-section">
      <PageHeader
        eyebrow="CONTROL PLANE · MAKER-CHECKER"
        title="정책 · 승인"
        description="사전 승인 범위를 정의하고, 변경된 조건만 검토해 실행 정책으로 활성화합니다."
        actions={<button className="button button-secondary" type="button" disabled><RefreshCw size={15} />Artifact 동기화</button>}
      />

      <PackContextSummary label={selectedPack.label} scope={selectedPack.scope} descriptor={selectedPack.descriptor} objective={selectedPack.objective} />

      {selectedPack.key === 'digital-asset' ? <DigitalAssetArtifactPanel /> : null}
      {selectedPack.key === 'ai' ? (
        <PolicyArtifactCreatePanel
          onCreated={(record) => {
            setArtifactId(record.artifactId);
            setArtifactVersion(record.artifactVersion);
            setLookup({ artifactId: record.artifactId, artifactVersion: record.artifactVersion });
          }}
        />
      ) : null}

      <SectionCard title="정책 라이프사이클" description={`${selectedPack.label} 정책이 Runtime에 적용되기 전 거치는 승인 단계`}>
        <div className="lifecycle-row lifecycle-flow">
          {lifecycle.map(([state, owner], index) => (
            <div className="lifecycle-step" key={state}>
              <span>{index + 1}</span>
              <strong>{state}</strong>
              <small>{owner}</small>
              {index < lifecycle.length - 1 ? <ArrowRight size={15} aria-hidden="true" /> : null}
            </div>
          ))}
        </div>
        <p className="helper-text"><LockKeyhole size={14} />승인·활성화·롤백은 PRIVILEGED_OPERATOR 권한과 Maker-Checker 분리를 BE가 최종 검증합니다.</p>
      </SectionCard>

      <div className="content-grid content-grid-wide-left">
        <SectionCard
          className="search-assist-card"
          title="Policy Lifecycle 조회"
          description="Artifact ID와 Version으로 현재 Lifecycle 상태를 확인합니다."
        >
          <form className="search-row policy-search-row" onSubmit={submitLookup}>
            <label className="field field-grow"><span>Artifact ID</span><SearchAssistInput value={artifactId} onChange={setArtifactId} suggestions={artifactSuggestions} placeholder={selectedPack.key === 'digital-asset' ? 'ACTIVE 또는 CANDIDATE 입력' : 'Artifact ID 직접 입력'} ariaLabel="Policy Artifact ID" required /></label>
            <label className="field"><span>Version</span><input value={artifactVersion} onChange={(event) => setArtifactVersion(event.target.value)} placeholder="1.0.0" required /></label>
            <button className="button button-primary" type="submit"><Search size={15} />조회</button>
          </form>
          {policy.isLoading ? <LoadingPanel label="정책 Lifecycle을 불러오는 중입니다" /> : policy.isError ? (
            <ErrorState description={normalizeApiError(policy.error).message} onRetry={() => policy.refetch()} />
          ) : policy.data ? (
            <KeyValues items={[
              ['Artifact', `${policy.data.artifactId} · ${policy.data.artifactVersion}`],
              ['Lifecycle', policy.data.lifecycleStage],
              ['Execution Pack', policy.data.executionPack],
              ['Policy Layer', policy.data.policyLayer],
              ['Workload', policy.data.workloadId],
              ['Purpose', policy.data.purposeCode],
              ['Revision', String(policy.data.revision)],
              ['Artifact Digest', policy.data.artifactDigest],
            ]} />
          ) : <EmptyState compact title="조회 조건 입력 대기" description="현재 BE는 정책 목록 API 없이 정확한 Artifact ID/Version 조회를 제공합니다." endpoint="GET /api/admin/policy-lifecycle/{artifactId}/versions/{artifactVersion}" />}
          <p className="helper-text"><LockKeyhole size={14} />Policy Harness는 승인 결과를 Runtime이 집행할 수 있게 고정한 계약입니다.</p>
        </SectionCard>
        <SectionCard title="Review Queue" description="검토가 필요한 요청과 정책 변경" actions={<StatusBadge>API 대기</StatusBadge>}>
          <EmptyState
            title="API 연결 대기"
            description="관리 명령 요청이 생성되면 승인자와 사유를 표시합니다."
            endpoint="별도 Review Queue API 미구현"
          />
        </SectionCard>
      </div>

      {policy.data ? <PolicyGovernancePanel key={`${policy.data.artifactId}:${policy.data.artifactVersion}`} policy={policy.data} /> : null}

      <SectionCard title="승인된 실행 경계" description="Role·Purpose·Data·Destination·Action 조건">
        <div className="policy-boundary-grid">
          {[
            ['Identity', selectedPack.key === 'digital-asset' ? 'PAYMENT_OPERATOR · CARD_PURCHASE' : 'BRANCH_STAFF · CUSTOMER_SUPPORT'],
            ['Subject Scope', selectedPack.key === 'digital-asset' ? '승인된 거래·가맹점 Scope' : '상담 고객 1명'],
            ['Data Guard', selectedPack.executionSurfaces.join(' · ')],
            ['Capability Guard', selectedPack.key === 'digital-asset' ? 'APPROVED_RAIL · STATUS.READ' : 'CRM.READ · CASE.WRITE'],
            ['Action Guard', selectedPack.key === 'digital-asset' ? 'VERIFY · SUBMIT · RECONCILE' : 'READ · ANALYZE · DRAFT'],
            ['Destination', selectedPack.destinationProfile[0]?.[1] ?? 'API 연결 대기'],
            ['Treatment', selectedPack.fieldTreatments.map(([, value]) => value).join(' · ')],
            ['Human Approval', selectedPack.key === 'digital-asset' ? 'LIMIT_CHANGE · RECONCILE_REQUIRED' : 'TRANSFER · CONTRACT_CHANGE'],
          ].map(([title, value]) => (
            <article key={title}>
              <span>{title}</span>
              <strong>{value}</strong>
              <StatusBadge tone={title === 'Action Guard' || title === 'Destination' ? 'warning' : 'success'}>{title === 'Action Guard' || title === 'Destination' ? '변경 시 재검토' : 'Approved'}</StatusBadge>
            </article>
          ))}
        </div>
      </SectionCard>

      <div className="content-grid content-grid-three">
        {policyOutcomes.map(([title, decision, description, tone]) => (
          <SectionCard key={title} title={title} description={description} actions={<StatusBadge tone={tone}>{decision}</StatusBadge>}>
            <EmptyState compact title="API 연결 대기" description="정책 판정 API 연결 후 실제 조건 일치 여부를 표시합니다." endpoint="POST /v1/runtime/executions" />
          </SectionCard>
        ))}
      </div>

      <div className="content-grid content-grid-two">
        <SectionCard title={`${selectedPack.label} Policy Harness`} description="법규·내규·승인·Provider 계약을 Runtime 정책으로 고정">
          <div className="policy-harness-list">
            {selectedPack.policyHarness.map((item) => (
              <article key={item.title}>
                <strong>{item.title}</strong>
                <p>{item.description}</p>
              </article>
            ))}
          </div>
        </SectionCard>
        <SectionCard title="Destination Profile" description="외부 대상별 Provider·Tenant·Region·Retention 조건">
          <KeyValues items={selectedPack.destinationProfile} />
        </SectionCard>
      </div>

      <div className="content-grid content-grid-two">
        <SectionCard title="Shadow Evidence Read Model" description="평가 이력과 승인 근거를 다시 조회하는 운영 화면" actions={<StatusBadge>API 대기</StatusBadge>}>
          <EmptyState compact title="API 연결 대기" description="Shadow Evaluation POST 응답은 연결됐지만 Evidence 목록과 단건 조회 Controller는 아직 없습니다." endpoint="Shadow Evidence GET API 미구현" />
        </SectionCard>
        <SectionCard title="Artifact 무결성" description="Schema, Digest, Evidence Reference, Vocabulary" actions={<StatusBadge tone={selectedPack.key === 'digital-asset' ? 'success' : 'neutral'}>{selectedPack.key === 'digital-asset' ? 'P0-5 AVAILABLE' : 'NOT VERIFIED'}</StatusBadge>}>
          <EmptyState compact title={selectedPack.key === 'digital-asset' ? '상단 Artifact 도구에서 조회' : 'API 연결 대기'} description={selectedPack.key === 'digital-asset' ? 'BE-owned strict schema와 digest 검증 결과를 실제 Lifecycle Candidate로 확인합니다.' : '해당 Pack의 Artifact Loader API가 아직 없습니다.'} endpoint={selectedPack.key === 'digital-asset' ? 'GET /api/admin/digital-assets/artifacts/{artifactId}/versions/{version}' : 'Artifact Loader API 미구현'} />
        </SectionCard>
      </div>
    </section>
  );
}
