import { EmptyState, PageHeader, SectionCard } from '../../shared/components';

const categories = [
  ['Data Access', '조회 필드·행·기간·차단된 접근', '/v1/monitoring/data-access'],
  ['Privacy', '탐지·변환·차단·감사 누락', '/v1/monitoring/privacy'],
  ['Utility', '변환 이후 업무 유용성', '/v1/monitoring/utility'],
  ['Runtime', '가용성·지연·실패·재시도', '/v1/monitoring/runtime'],
  ['Governance', '정책 버전·승인·변경 이력', '/v1/monitoring/governance'],
];

export function MonitoringPage() {
  return (
    <section className="page-section">
      <PageHeader
        eyebrow="Monitoring"
        title="모니터링"
        description="운영 지표를 범주별로 분리합니다. 지표 응답이 없으면 0이나 임의 그래프로 대체하지 않습니다."
        actions={<button className="button button-secondary" disabled>기간 선택</button>}
      />

      <div className="monitoring-grid">
        {categories.map(([title, description, endpoint]) => (
          <SectionCard key={title} title={title} description={description}>
            <div className="metric-placeholder" aria-hidden="true">
              <span /><span /><span /><span />
            </div>
            <EmptyState
              compact
              title="API 연결 대기"
              description="백엔드 집계 API가 응답하면 이 영역에 실제 시계열을 렌더링합니다."
              endpoint={`GET ${endpoint}`}
            />
          </SectionCard>
        ))}
      </div>
    </section>
  );
}
