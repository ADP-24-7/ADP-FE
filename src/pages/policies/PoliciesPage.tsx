import { EmptyState, PageHeader, SectionCard } from '../../shared/components';

const lifecycle = ['VALIDATED', 'CANDIDATE', 'SHADOW', 'ACTIVE'];

export function PoliciesPage() {
  return (
    <section className="page-section">
      <PageHeader
        eyebrow="Policies"
        title="정책 관리"
        description="검증된 정책의 승격·Shadow·활성화·Rollback 상태를 관리합니다. 현재 존재하지 않는 정책은 만들어 표시하지 않습니다."
        actions={<button className="button button-primary" disabled>아티팩트 등록</button>}
      />

      <SectionCard title="정책 라이프사이클" description="승인된 전이만 순서대로 수행합니다.">
        <div className="lifecycle-row">
          {lifecycle.map((state, index) => (
            <div className="lifecycle-step" key={state}>
              <span>{index + 1}</span>
              <strong>{state}</strong>
            </div>
          ))}
        </div>
        <p className="helper-text">활성 정책이 조회되기 전까지 특정 단계를 활성 상태로 꾸미지 않습니다.</p>
      </SectionCard>

      <div className="content-grid content-grid-two">
        <SectionCard title="정책 목록" description="버전, Digest, 상태, 승인 정보를 조회합니다.">
          <EmptyState
            title="API 연결 대기"
            description="검증된 Policy Artifact가 적재되면 정책 목록이 표시됩니다."
            endpoint="GET /v1/policies"
          />
        </SectionCard>
        <SectionCard title="검토 대기" description="승격 또는 Rollback 승인이 필요한 요청입니다.">
          <EmptyState
            title="API 연결 대기"
            description="관리 명령 요청이 생성되면 승인자와 사유를 표시합니다."
            endpoint="GET /v1/review-items?type=POLICY"
          />
        </SectionCard>
      </div>
    </section>
  );
}
