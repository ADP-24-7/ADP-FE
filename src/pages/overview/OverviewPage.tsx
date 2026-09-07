import { useDashboardSummary } from '../../features/monitoring';
import { AlertTriangle, ArrowRight, CircleGauge, ListChecks, ShieldAlert, ShieldCheck, ShieldX, Workflow } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { EmptyState, ErrorState, KeyValues, MetricCard, PageHeader, SectionCard, StatusBadge } from '../../shared/components';
import { useExecutionPack } from '../../shared/prototype';

const operatorFlow = [
  ['01', 'Monitor', '이상 탐지'],
  ['02', 'Finding', '통제 분류'],
  ['03', 'Trace', '사건 재현'],
  ['04', 'Decision', 'Review · Reconcile'],
  ['05', 'Resolution', '조치 Evidence'],
] as const;

export function OverviewPage() {
  const summary = useDashboardSummary();
  const navigate = useNavigate();
  const { selectedPack } = useExecutionPack();

  const overviewState = summary.isLoading ? 'loading' : summary.isError ? 'error' : summary.data ? 'value' : 'unconnected';

  return (
    <section className="page-section">
      <PageHeader
        eyebrow="POLICY DECISION → FINDING → TRACE → RECOVERY"
        title="Security Overview"
        description="현재 위험, 영향받은 실행과 필요한 조치를 한 화면에서 확인합니다."
        actions={<StatusBadge tone={summary.isError ? 'danger' : summary.data ? 'success' : 'warning'}>{summary.isError ? 'API ERROR' : summary.data ? 'REAL DATA' : 'API 연결 대기'}</StatusBadge>}
      />

      {summary.isError ? (
        <ErrorState
          description="백엔드의 GET /v1/monitoring/overview 응답 또는 네트워크 설정을 확인해 주세요."
          onRetry={() => void summary.refetch()}
        />
      ) : (
        <div className="metric-grid metric-grid-six">
          <MetricCard label="Security Findings" value={null} description="GET /v1/security-findings/summary" state="unconnected" icon={ShieldAlert} tone="red" />
          <MetricCard label="Open Incidents" value={null} description="GET /v1/incidents/summary" state="unconnected" icon={AlertTriangle} tone="amber" />
          <MetricCard label="Runtime Block" value={summary.data?.blockCount} description="GET /v1/metrics/summary" state={overviewState} icon={ShieldX} tone="red" />
          <MetricCard label="Unresolved Outcome" value={null} description="GET /v1/recovery/summary" state="unconnected" icon={Workflow} tone="purple" />
          <MetricCard label="Audit Health" value={null} description="Prometheus audit_outbox metrics" state="unconnected" icon={ShieldCheck} tone="green" />
          <MetricCard label="External Timeout" value={null} description="Prometheus external_interaction timeout" state="unconnected" icon={CircleGauge} tone="blue" />
        </div>
      )}

      <div className="content-grid content-grid-wide-left">
        <SectionCard title="Attention Required" description="정상 BLOCK이 아닌 운영 확인 대상" actions={<button className="button button-secondary" type="button" onClick={() => navigate('/monitoring')}>전체 보기 <ArrowRight size={14} /></button>}>
          <div className="finding-list">
            {[
              ['Request digest mismatch', 'GET /v1/security-findings?severity=CRITICAL'],
              ['Maker–Checker violation', 'GET /v1/reviews?state=OPEN'],
              ['Settlement state mismatch', 'GET /v1/recovery/incidents?domain=DIGITAL_ASSET'],
              ['Audit outbox delayed', 'Prometheus audit_outbox_pending'],
            ].map(([title, endpoint]) => (
              <button key={title} type="button" className="finding-row" onClick={() => navigate('/monitoring')}>
                <span>API</span>
                <strong>{title}</strong>
                <small>{endpoint}</small>
                <ArrowRight size={14} />
              </button>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Enforcement Posture" description="두 실행 도메인의 통제 상태">
          <div className="posture-list">
            <article>
              <strong>AI · Agent</strong>
              <span>Data · Tool · Action · Provider · Response</span>
              <StatusBadge tone={selectedPack.key === 'ai' ? 'success' : 'neutral'}>{selectedPack.key === 'ai' ? 'SELECTED' : 'API 대기'}</StatusBadge>
            </article>
            <article>
              <strong>Digital Asset</strong>
              <span>Value-use · Transaction · Settlement · Reconciliation</span>
              <StatusBadge tone={selectedPack.key === 'digital-asset' ? 'success' : 'neutral'}>{selectedPack.key === 'digital-asset' ? 'SELECTED' : 'API 대기'}</StatusBadge>
            </article>
          </div>
          <KeyValues
            items={[
              ['Policy Engine', 'GET /actuator/health 또는 /v1/policies/active'],
              ['Event Pipeline', 'Prometheus event pipeline metrics'],
              ['Recovery Worker', 'GET /v1/recovery/summary'],
              ['Selected Domain', selectedPack.label],
            ]}
          />
        </SectionCard>
      </div>

      <div className="content-grid content-grid-wide-left">
        <SectionCard title="Operator Flow" description="탐지에서 증명과 복구까지 연결">
          <div className="operator-flow">
            {operatorFlow.map(([number, title, description]) => (
              <button key={number} type="button" onClick={() => navigate(number === '05' ? '/analysis' : number === '03' ? '/audit' : '/monitoring')}>
                <span>{number}</span>
                <strong>{title}</strong>
                <small>{description}</small>
              </button>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Metrics Readiness" description="현재 FE가 기다리는 실제 데이터 소스" actions={<StatusBadge>NO MOCK DATA</StatusBadge>}>
          <EmptyState
            icon={ListChecks}
            title="API 연결 대기"
            description="Prometheus와 Read Model API가 연결되면 숫자, 비율, p95, 추세를 실제 응답으로만 표시합니다."
            endpoint="GET /v1/metrics/summary · /actuator/prometheus"
          />
        </SectionCard>
      </div>
    </section>
  );
}
