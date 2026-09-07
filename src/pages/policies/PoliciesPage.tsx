import { ArrowRight, LockKeyhole, RefreshCw, Search } from 'lucide-react';
import { EmptyState, KeyValues, PackContextSummary, PageHeader, SectionCard, StatusBadge } from '../../shared/components';
import { useExecutionPack } from '../../shared/prototype';

const lifecycle = [
  ['DRAFT', 'Policy Owner'],
  ['REVIEW', 'Checker'],
  ['SHADOW', 'Runtime Diff'],
  ['ACTIVE', 'Version Locked'],
] as const;

const policyOutcomes = [
  ['동일 조건', 'REUSE_ALLOWED', '기존 승인정책을 그대로 집행합니다.', 'success'],
  ['보호 가능한 변경', 'TRANSFORM_REQUIRED', '승인된 처리 후 실행합니다.', 'info'],
  ['범위 확장', 'REVIEW / BLOCK', '실행 전에 중단하고 담당자가 검토합니다.', 'warning'],
] as const;

export function PoliciesPage() {
  const { selectedPack } = useExecutionPack();

  return (
    <section className="page-section">
      <PageHeader
        eyebrow="CONTROL PLANE · MAKER-CHECKER"
        title="정책 · 승인"
        description="사전 승인 범위를 정의하고, 변경된 조건만 검토해 실행 정책으로 활성화합니다."
        actions={<button className="button button-secondary" type="button" disabled><RefreshCw size={15} />Artifact 동기화</button>}
      />

      <PackContextSummary label={selectedPack.label} scope={selectedPack.scope} descriptor={selectedPack.descriptor} objective={selectedPack.objective} />

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
        <p className="helper-text"><LockKeyhole size={14} />Maker와 Checker가 분리되지 않으면 ACTIVE 승격은 비활성화됩니다.</p>
      </SectionCard>

      <div className="content-grid content-grid-wide-left">
        <SectionCard
          title={`${selectedPack.label === 'Digital Asset' ? 'STABLECOIN_CARD_SPEND' : 'CUSTOMER_SUPPORT_AI'}`}
          description="현재 활성 승인 Snapshot"
          actions={<div className="search-field search-field-disabled"><Search size={15} /><input placeholder="API 연결 후 검색 활성화" aria-label="Version 또는 Artifact 검색" disabled /></div>}
        >
          <KeyValues
            items={[
              ['Policy Version', 'API 연결 대기'],
              ['Approval Reference', 'API 연결 대기'],
              ['Valid Until', 'API 연결 대기'],
              ['Reuse Rule', '모든 조건이 동일할 때만'],
            ]}
          />
          <p className="helper-text"><LockKeyhole size={14} />Policy Harness는 승인 결과를 Runtime이 집행할 수 있게 고정한 계약입니다.</p>
        </SectionCard>
        <SectionCard title="Review Queue" description="검토가 필요한 요청과 정책 변경" actions={<StatusBadge>API 대기</StatusBadge>}>
          <EmptyState
            title="API 연결 대기"
            description="관리 명령 요청이 생성되면 승인자와 사유를 표시합니다."
            endpoint="GET /v1/reviews"
          />
        </SectionCard>
      </div>

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
        <SectionCard title="Shadow 진입 기준" description="False Allow, Decision Diff, Review Burden, Audit Gap" actions={<StatusBadge>NOT_EVALUATED</StatusBadge>}>
          <EmptyState compact title="API 연결 대기" description="Shadow 평가 결과가 연결되면 표시합니다." endpoint="POST /v1/policies/{policyId}/shadow" />
        </SectionCard>
        <SectionCard title="Artifact 무결성" description="Schema, Digest, Evidence Reference, Vocabulary" actions={<StatusBadge>NOT_VERIFIED</StatusBadge>}>
          <EmptyState compact title="API 연결 대기" description="검증할 Artifact가 연결되면 표시합니다." endpoint="GET /v1/policy-evaluation-artifacts/{artifactId}" />
        </SectionCard>
      </div>
    </section>
  );
}
