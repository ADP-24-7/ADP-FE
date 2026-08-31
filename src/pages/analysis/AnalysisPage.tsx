import { EmptyState, PageHeader, SectionCard } from '../../shared/components';

const analysisSections = [
  ['데이터셋', '검증 데이터셋 버전과 범위', 'GET /v1/analysis/datasets'],
  ['실험 결과', '탐지율·오탐률·유용성 평가', 'GET /v1/analysis/experiments'],
  ['근거 및 기준', '판단 기준, 신뢰구간, 적용 범위', 'GET /v1/policy-evaluation-artifacts'],
];

export function AnalysisPage() {
  return (
    <section className="page-section">
      <PageHeader
        eyebrow="Analysis"
        title="분석 및 평가"
        description="DA가 검증한 아티팩트와 실험 결과를 조회합니다. 임시 성능 수치나 예시 차트는 표시하지 않습니다."
      />

      <div className="content-grid content-grid-three">
        {analysisSections.map(([title, description, endpoint]) => (
          <SectionCard key={title} title={title} description={description}>
            <EmptyState
              compact
              title="API 연결 대기"
              description="API 연결 또는 검증된 아티팩트 적재 후 표시됩니다."
              endpoint={endpoint}
            />
          </SectionCard>
        ))}
      </div>

      <SectionCard title="평가 결과" description="실험별 기준 충족 여부와 정책 반영 가능성을 비교합니다.">
        <div className="empty-table">
          <div className="table-head table-analysis">
            <span>실험</span><span>데이터셋</span><span>Privacy</span><span>Utility</span><span>결과</span>
          </div>
          <EmptyState
            title="API 연결 대기"
            description="DA 결과가 적재되면 서버 응답을 기준으로 행이 생성됩니다."
          />
        </div>
      </SectionCard>
    </section>
  );
}
