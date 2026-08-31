import { useDashboardSummary } from '../../features/monitoring';
import { AlertTriangle, BarChart3, Database, ShieldCheck, ShieldX, Workflow } from 'lucide-react';
import { EmptyState, ErrorState, KeyValues, MetricCard, PageHeader, SectionCard, StatusBadge } from '../../shared/components';

export function OverviewPage() {
  const summary = useDashboardSummary();

  const overviewState = summary.isLoading ? 'loading' : summary.isError ? 'error' : summary.data ? 'value' : 'unconnected';
  const checkpoints = [
    ['01', 'Request & Authorization', '인증 주체, Workload, 목적, 동의 범위를 확인'],
    ['02', 'Data Access & Context', '허용된 Dataset, Field, Subject, 기간, 행 수만 조회'],
    ['03', 'Input Detection & Decision', '민감정보 탐지와 정책 판정, Human Review 분기'],
    ['04', 'Transform & Outbound Guard', '토큰화 후 외부 전송 Payload를 최종 검사'],
    ['05', 'Provider & Response Guard', 'LLM 응답의 재식별, 유출, 정책 위반을 재검증'],
    ['06', 'Controlled Delivery & Audit', '안전한 결과만 전달하고 전 단계 근거를 기록'],
  ] as const;

  return (
    <section className="page-section">
      <PageHeader
        eyebrow="RUNTIME CONTROL PLANE"
        title="운영 개요"
        description="요청부터 데이터 접근, 외부 전송, 응답 검증, 전달까지 전체 Gateway 상태를 확인합니다."
        actions={<StatusBadge tone={summary.isError ? 'danger' : summary.data ? 'success' : 'warning'}>{summary.isError ? 'API ERROR' : summary.data ? 'REAL DATA' : 'API 연결 대기'}</StatusBadge>}
      />

      {summary.isError ? (
        <ErrorState
          description="백엔드의 GET /v1/monitoring/overview 응답 또는 네트워크 설정을 확인해 주세요."
          onRetry={() => void summary.refetch()}
        />
      ) : (
        <div className="metric-grid">
          <MetricCard label="처리 요청" value={summary.data?.requestCount} description="GET /v1/monitoring/overview" state={overviewState} icon={Workflow} />
          <MetricCard label="Data Access 차단" value={null} description="GET /v1/monitoring/data-access" state="unconnected" icon={Database} tone="amber" />
          <MetricCard label="Raw Egress 방지" value={summary.data?.blockCount} description="GET /v1/monitoring/overview" state={overviewState} icon={ShieldX} tone="red" />
          <MetricCard label="Response Leakage" value={null} description="GET /v1/monitoring/privacy" state="unconnected" icon={ShieldCheck} tone="purple" />
        </div>
      )}

      <div className="content-grid content-grid-wide-left">
        <SectionCard title="End-to-End 처리 현황" description="단계별 처리량과 최종 판정 추이">
          <EmptyState
            icon={BarChart3}
            title="API 연결 대기"
            description="Metrics API 연결 후 실제 요청 추이와 최종 판정 분포를 표시합니다."
            endpoint="GET /v1/metrics/summary"
          />
        </SectionCard>

        <SectionCard title="Runtime Version Context" description="결정을 재현하기 위한 버전 고정 정보">
          <KeyValues
            items={[
              ['Application', '—'],
              ['Policy Snapshot', '—'],
              ['Analysis Artifact', '—'],
              ['Dataset Snapshot', '—'],
            ]}
          />
        </SectionCard>
      </div>

      <div className="content-grid content-grid-two">
        <SectionCard title="운영 경계" description="현재 설계가 보호해야 하는 핵심 지점">
          <div className="boundary-list">
            {checkpoints.map(([number, title, description]) => (
              <div key={number} className="boundary-item">
                <span>{number}</span>
                <p><b>{title}</b><small>{description}</small></p>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="최근 운영 이벤트" description="Review, Block, Recovery 대상">
          <EmptyState icon={AlertTriangle} title="API 연결 대기" description="Audit API가 연결되기 전에는 임의 이벤트를 표시하지 않습니다." endpoint="GET /v1/audit-events" />
        </SectionCard>
      </div>
    </section>
  );
}
