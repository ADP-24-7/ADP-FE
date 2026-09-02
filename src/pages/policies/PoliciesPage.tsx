import { ArrowRight, LockKeyhole, RefreshCw, Search } from 'lucide-react';
import { EmptyState, KeyValues, PackContextSummary, PageHeader, SectionCard, StatusBadge } from '../../shared/components';
import { useExecutionPack } from '../../shared/prototype';

const lifecycle = ['VALIDATED', 'CANDIDATE', 'SHADOW', 'ACTIVE'];

export function PoliciesPage() {
  const { selectedPack } = useExecutionPack();

  return (
    <section className="page-section">
      <PageHeader
        eyebrow="GOVERNANCE CONTROL"
        title="정책 · Review"
        description={`${selectedPack.label}에 적용할 검증된 Analysis Artifact를 Candidate로 인수하고 Shadow 검증과 승인 후 Runtime에 활성화합니다.`}
        actions={<button className="button button-secondary" type="button" disabled><RefreshCw size={15} />Artifact 동기화</button>}
      />

      <PackContextSummary label={selectedPack.label} scope={selectedPack.scope} descriptor={selectedPack.descriptor} objective={selectedPack.objective} />

      <SectionCard title="정책 라이프사이클" description="승인된 전이만 순서대로 수행합니다.">
        <div className="lifecycle-row lifecycle-flow">
          {lifecycle.map((state, index) => (
            <div className="lifecycle-step" key={state}>
              <span>{index + 1}</span>
              <strong>{state}</strong>
              {index < lifecycle.length - 1 ? <ArrowRight size={15} aria-hidden="true" /> : null}
            </div>
          ))}
        </div>
        <p className="helper-text"><LockKeyhole size={14} />VALIDATED는 자동 활성화가 아닙니다. BE 검증과 승인 조건을 모두 통과해야 합니다.</p>
      </SectionCard>

      <div className="content-grid content-grid-wide-left">
        <SectionCard
          title="Policy Snapshots"
          description="교체·Rollback 가능한 불변 정책 단위"
          actions={<div className="search-field search-field-disabled"><Search size={15} /><input placeholder="API 연결 후 검색 활성화" aria-label="Version 또는 Artifact 검색" disabled /></div>}
        >
          <EmptyState
            title="API 연결 대기"
            description="검증된 Policy Artifact가 적재되면 정책 목록이 표시됩니다."
            endpoint="GET /v1/policies"
          />
        </SectionCard>
        <SectionCard title="Review Queue" description="검토가 필요한 요청과 정책 변경" actions={<StatusBadge>—</StatusBadge>}>
          <EmptyState
            title="API 연결 대기"
            description="관리 명령 요청이 생성되면 승인자와 사유를 표시합니다."
            endpoint="GET /v1/reviews"
          />
        </SectionCard>
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
