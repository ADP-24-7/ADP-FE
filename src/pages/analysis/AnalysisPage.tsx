import { BarChart3, Gauge } from 'lucide-react';
import { EmptyState, KeyValues, PageHeader, SectionCard, StatusBadge } from '../../shared/components';

const analysisSections = [
  ['데이터셋', '검증 데이터셋 버전과 범위', 'GET /v1/analysis/datasets'],
  ['실험 결과', '탐지율·오탐률·유용성 평가', 'GET /v1/analysis/experiments'],
  ['근거 및 기준', '판단 기준, 신뢰구간, 적용 범위', 'GET /v1/policy-evaluation-artifacts'],
];

export function AnalysisPage() {
  const gates = [
    ['Privacy Gate', '재식별 위험과 민감정보 누출'],
    ['Utility Gate', '정확도, 완전성, Task 성능'],
    ['Operational Gate', '지연, 비용, 실패, Review 부담'],
  ] as const;

  return (
    <section className="page-section">
      <PageHeader
        eyebrow="ANALYSIS ARTIFACT & EVIDENCE"
        title="분석 · Evidence"
        description="DA 실험 결과를 운영 정책으로 넘기기 전에 재현성, Privacy-Utility, 실패 구간과 Handoff 상태를 검증합니다."
        actions={<StatusBadge>NO ARTIFACT</StatusBadge>}
      />

      <SectionCard title="Artifact Version Context" description="운영 정책으로 인수 가능한 검증 산출물">
        <KeyValues
          items={[
            ['Artifact Version', '—'],
            ['Schema Version', '—'],
            ['Dataset Snapshot', '—'],
            ['Experiment ID', '—'],
            ['Digest', '—'],
            ['Valid Until', '—'],
          ]}
        />
      </SectionCard>

      <div className="content-grid content-grid-three">
        {gates.map(([title, description]) => (
          <SectionCard key={title} title={title} description={description} actions={<StatusBadge>NOT_EVALUATED</StatusBadge>}>
            <span className="gate-icon" aria-hidden="true"><Gauge size={18} /></span>
            <KeyValues
              items={[
                ['Observed Value', '—'],
                ['Threshold', '—'],
                ['Confidence', '—'],
              ]}
            />
          </SectionCard>
        ))}
      </div>

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

      <div className="content-grid content-grid-wide-left">
        <SectionCard title="Privacy-Utility Trade-off" description="후보 정책별 보호 수준과 활용성 비교" actions={<StatusBadge>데이터 없음</StatusBadge>}>
          <EmptyState icon={BarChart3} title="API 연결 대기" description="Artifact의 aggregate_metrics를 연결하면 후보 간 비교를 표시합니다." endpoint="GET /v1/analysis/experiments" />
        </SectionCard>

        <SectionCard title="Claim Scope & Handoff" description="결론이 유효한 범위와 BE 인수 조건">
          <KeyValues
            items={[
              ['Population', '—'],
              ['Use Case', '—'],
              ['Provider', '—'],
              ['Known Limitations', '—'],
              ['BE Handoff', '—'],
            ]}
          />
        </SectionCard>
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
