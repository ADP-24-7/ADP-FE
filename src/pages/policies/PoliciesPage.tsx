import { ArrowRight, LockKeyhole } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DigitalAssetArtifactPanel } from '../../features/digital-asset';
import { PolicyArtifactCreatePanel, PolicyGovernancePanel, PolicyOperationsBrowser, usePolicyLifecycle } from '../../features/policy-lifecycle';
import { EmptyState, KeyValues, PackContextSummary, PageHeader, SectionCard, StatusBadge } from '../../shared/components';
import { useExecutionPack } from '../../shared/prototype';
import { ReferenceEvidencePanel } from '../../features/reference-evidence';
import { AuditExportWorkPanel } from '../../features/audit-export';

const lifecycle = [
  ['DRAFT', 'Policy Owner'],
  ['VALIDATED', 'BE Validation'],
  ['CANDIDATE', 'Artifact Ready'],
  ['REPLAY', 'Operator'],
  ['SHADOW', 'Runtime Diff'],
  ['APPROVED', 'Checker'],
  ['ACTIVE', 'Version Locked'],
] as const;

export function PoliciesPage() {
  const navigate = useNavigate();
  const { selectedPack } = useExecutionPack();
  const [lookup, setLookup] = useState({ artifactId: '', artifactVersion: '' });
  const policy = usePolicyLifecycle(lookup.artifactId, lookup.artifactVersion);
  const executionPack = selectedPack.key === 'digital-asset' ? 'DIGITAL_ASSET' : 'AI';

  useEffect(() => {
    setLookup({ artifactId: '', artifactVersion: '' });
  }, [selectedPack.key]);

  return (
    <section className="page-section">
      <PageHeader
        eyebrow="CONTROL PLANE · MAKER-CHECKER"
        title="정책 · 승인"
        description="사전 승인 범위를 정의하고, 변경된 조건만 검토해 실행 정책으로 활성화합니다."
      />

      <PackContextSummary label={selectedPack.label} scope={selectedPack.scope} descriptor={selectedPack.descriptor} objective={selectedPack.objective} />

      <div id="approvals" className="anchored-section"><AuditExportWorkPanel /></div>

      {selectedPack.key === 'digital-asset' ? (
        <DigitalAssetArtifactPanel
          onOpenTrace={(executionId) => navigate(`/audit?executionId=${encodeURIComponent(executionId)}`)}
        />
      ) : null}
      {selectedPack.key === 'ai' ? (
        <PolicyArtifactCreatePanel
          onCreated={(record) => {
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

      <PolicyOperationsBrowser
        executionPack={executionPack}
        selectedArtifactId={lookup.artifactId}
        selectedArtifactVersion={lookup.artifactVersion}
        onSelect={(artifact) => setLookup({ artifactId: artifact.artifactId, artifactVersion: artifact.artifactVersion })}
        onClearSelection={() => setLookup({ artifactId: '', artifactVersion: '' })}
      />

      <ReferenceEvidencePanel />

      {policy.data ? <PolicyGovernancePanel key={`${policy.data.artifactId}:${policy.data.artifactVersion}`} policy={policy.data} /> : null}

      <SectionCard title="승인된 실행 경계" description="Role·Purpose·Data·Destination·Action 조건">
        <div className="policy-boundary-grid">
          {[
            ['Identity', selectedPack.key === 'digital-asset' ? 'PAYMENT_OPERATOR · CARD_PURCHASE' : 'BRANCH_STAFF · CUSTOMER_SUPPORT'],
            ['Subject Scope', selectedPack.key === 'digital-asset' ? '승인된 거래·가맹점 Scope' : '상담 고객 1명'],
            ['Data Guard', selectedPack.executionSurfaces.join(' · ')],
            ['Capability Guard', selectedPack.key === 'digital-asset' ? 'APPROVED_RAIL · STATUS.READ' : 'CRM.READ · CASE.WRITE'],
            ['Action Guard', selectedPack.key === 'digital-asset' ? 'VERIFY · SUBMIT · RECONCILE' : 'READ · ANALYZE · DRAFT'],
            ['Destination', selectedPack.destinationProfile[0]?.[1] ?? '미설정'],
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
        <SectionCard title="Shadow Evidence" description="평가 이력과 승인 근거를 다시 조회합니다.">
          <EmptyState compact title="Policy Operations에서 조회" description="선택한 Artifact의 Transition과 Shadow Evidence가 상단 Read Model에 표시됩니다." endpoint="GET /api/admin/policy-lifecycle/{artifactId}/versions/{version}/history" />
        </SectionCard>
        {selectedPack.key === 'digital-asset' ? <SectionCard title="Artifact 무결성" description="Schema, Digest, Evidence Reference, Vocabulary">
          <EmptyState compact title="상단 Artifact 도구에서 조회" description="BE-owned strict schema와 digest 검증 결과를 실제 Lifecycle Candidate로 확인합니다." endpoint="GET /api/admin/digital-assets/artifacts/{artifactId}/versions/{version}" />
        </SectionCard> : null}
      </div>
    </section>
  );
}
