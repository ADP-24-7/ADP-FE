import { Filter, Search, ShieldAlert } from 'lucide-react';
import { useState } from 'react';
import { EmptyState, PackContextSummary, PageHeader, SectionCard, StatusBadge } from '../../shared/components';
import { useExecutionPack } from '../../shared/prototype';

const findingFilters = ['전체', 'Authorization', 'Purpose · Action', 'Destination', 'Integrity', 'Replay'] as const;

export function MonitoringPage() {
  const { selectedPack } = useExecutionPack();
  const [selectedFilter, setSelectedFilter] = useState<(typeof findingFilters)[number]>('전체');

  return (
    <section className="page-section">
      <PageHeader
        eyebrow="CONTROL SIGNALS · VIOLATIONS"
        title="Security Findings"
        description="통제가 작동한 이유를 사건 단위 Trace로 연결합니다."
        actions={<StatusBadge tone="warning">API 연결 대기</StatusBadge>}
      />

      <PackContextSummary label={selectedPack.label} scope={selectedPack.scope} descriptor={selectedPack.descriptor} objective={selectedPack.objective} />

      <SectionCard
        title="Finding Filters"
        description="유형별 통제 신호를 선택합니다. API 연결 전에는 필터 상태만 변경합니다."
        actions={<div className="search-field search-field-disabled"><Search size={15} /><input placeholder="API 연결 후 검색 활성화" aria-label="Finding 검색" disabled /></div>}
      >
        <div className="filter-chip-row" role="tablist" aria-label="Finding filter">
          {findingFilters.map((filter) => (
            <button key={filter} type="button" role="tab" aria-selected={filter === selectedFilter} className={filter === selectedFilter ? 'active' : ''} onClick={() => setSelectedFilter(filter)}>
              <Filter size={13} />
              {filter}
            </button>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Security Findings" description="Severity, Finding, Workload, Decision, Trace를 서버 응답으로 표시">
        <div className="table-shell">
          <div className="table-head table-findings">
            <span>SEVERITY</span><span>FINDING</span><span>WORKLOAD</span><span>DECISION</span><span>TRACE</span>
          </div>
          <EmptyState
            icon={ShieldAlert}
            title={`${selectedFilter} API 연결 대기`}
            description="프로토타입의 Synthetic Finding은 사용하지 않습니다. BE Read Model이 준비되면 실제 사건만 표시합니다."
            endpoint="GET /v1/security-findings"
          />
        </div>
      </SectionCard>

      <div className="content-grid content-grid-three">
        <SectionCard title="Authorization" description="권한·목적·Subject Scope 위반">
          <EmptyState compact title="API 연결 대기" description="권한 위반 집계와 최근 Trace를 표시합니다." endpoint="GET /v1/security-findings?category=AUTHORIZATION" />
        </SectionCard>
        <SectionCard title="Destination" description="Provider·Tenant·Region·Rail 경계 위반">
          <EmptyState compact title="API 연결 대기" description="외부 대상 위반 신호를 표시합니다." endpoint="GET /v1/security-findings?category=DESTINATION" />
        </SectionCard>
        <SectionCard title="Integrity · Replay" description="Digest mismatch, idempotency, 중복 실행">
          <EmptyState compact title="API 연결 대기" description="무결성/재시도 통제 결과를 표시합니다." endpoint="GET /v1/security-findings?category=INTEGRITY" />
        </SectionCard>
      </div>
    </section>
  );
}
