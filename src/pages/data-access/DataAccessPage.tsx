import { Boxes, LockKeyhole, Search } from 'lucide-react';
import { EmptyState, KeyValues, PackContextSummary, PageHeader, SectionCard, StatusBadge } from '../../shared/components';
import { useExecutionPack } from '../../shared/prototype';

export function DataAccessPage() {
  const { selectedPack } = useExecutionPack();

  return (
    <section className="page-section">
      <PageHeader
        eyebrow="DATA MINIMIZATION BOUNDARY"
        title="Workload · Data Access"
        description={`${selectedPack.label} 흐름이 DB에 직접 접근하지 않도록 Workload별 허용 범위와 사전 정의 Query Adapter를 관리합니다.`}
        actions={<StatusBadge tone="warning">DEFAULT DENY</StatusBadge>}
      />

      <PackContextSummary label={selectedPack.label} scope={selectedPack.scope} descriptor={selectedPack.descriptor} />

      <div className="content-grid content-grid-two">
        <SectionCard
          title="Workload Registry"
          description="서비스 주체, 목적, Provider, Retrieval Profile 연결"
          actions={<button className="button button-secondary" type="button" disabled><Boxes size={15} />Workload 등록</button>}
        >
          <EmptyState title="API 연결 대기" description="등록된 Workload가 없거나 API가 아직 연결되지 않았습니다." endpoint="GET /v1/workloads" />
        </SectionCard>

        <SectionCard title="Retrieval Profile" description="자유 SQL 대신 허용된 조회 계약만 실행" actions={<StatusBadge>NOT CONFIGURED</StatusBadge>}>
          <KeyValues
            items={[
              ['Dataset', '—'],
              ['Field Allowlist', '—'],
              ['Subject Scope', '—'],
              ['Time Window', '—'],
              ['Row Limit', '—'],
              ['Query Adapter', '—'],
            ]}
          />
        </SectionCard>
      </div>

      <SectionCard
        title="Data Access Decisions"
        description="요청 목적과 데이터 최소화 규칙에 따른 조회 허용·축소·차단 결과"
        actions={(
          <div className="search-field search-field-disabled">
            <Search size={15} />
            <input placeholder="API 연결 후 검색 활성화" aria-label="Trace ID 또는 Workload 검색" disabled />
          </div>
        )}
      >
        <div className="table-shell">
          <div className="table-head table-access">
            <span>TRACE ID</span>
            <span>WORKLOAD</span>
            <span>DATASET</span>
            <span>REQUESTED</span>
            <span>RELEASED</span>
            <span>DECISION</span>
            <span>REASON</span>
          </div>
          <EmptyState compact title="API 연결 대기" description="Data Access decision API가 연결되면 실제 이력을 표시합니다." endpoint="GET /v1/data-access/decisions" />
        </div>
      </SectionCard>

      <div className="notice notice-info">
        <LockKeyhole size={17} />
        <p>
          <b>DB Credential 및 자유 SQL 금지</b>
          <span>Gateway는 권한이 제한된 Adapter만 호출하며, 조회된 원문 Context는 외부 전송 전 다시 탐지·변환됩니다.</span>
        </p>
      </div>
    </section>
  );
}
