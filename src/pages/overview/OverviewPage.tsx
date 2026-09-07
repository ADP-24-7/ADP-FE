import { useBackendReadiness } from '../../features/monitoring';
import { AlertTriangle, ArrowRight, CircleGauge, ListChecks, ShieldAlert, ShieldCheck, ShieldX, Workflow } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { EmptyState, KeyValues, MetricCard, PageHeader, SectionCard, StatusBadge } from '../../shared/components';
import { useExecutionPack } from '../../shared/prototype';

const operatorFlow = [
  ['01', 'Monitor', '이상 탐지'],
  ['02', 'Finding', '통제 분류'],
  ['03', 'Trace', '사건 재현'],
  ['04', 'Decision', 'Review · Reconcile'],
  ['05', 'Resolution', '조치 Evidence'],
] as const;

export function OverviewPage() {
  const readiness = useBackendReadiness();
  const navigate = useNavigate();
  const { selectedPack } = useExecutionPack();

  const readinessState = readiness.isLoading ? 'loading' : readiness.isError ? 'error' : 'value';

  return (
    <section className="page-section">
      <PageHeader
        eyebrow="POLICY DECISION → FINDING → TRACE → RECOVERY"
        title="Security Overview"
        description="현재 위험, 영향받은 실행과 필요한 조치를 한 화면에서 확인합니다."
        actions={<StatusBadge tone={readiness.isError ? 'danger' : readiness.data?.status === 'UP' ? 'success' : 'warning'}>{readiness.isError ? 'BE UNAVAILABLE' : readiness.data?.status === 'UP' ? 'BE READY' : 'BE CHECKING'}</StatusBadge>}
      />

      <div className="metric-grid metric-grid-six">
        <MetricCard label="Security Findings" value={null} description="Aggregate API 미구현" state="unconnected" icon={ShieldAlert} tone="red" />
        <MetricCard label="Open Incidents" value={null} description="Incident Read Model 미구현" state="unconnected" icon={AlertTriangle} tone="amber" />
        <MetricCard label="Runtime Block" value={null} description="Prometheus 집계 연동 대기" state="unconnected" icon={ShieldX} tone="red" />
        <MetricCard label="Unresolved Outcome" value={null} description="Recovery Read API 미구현" state="unconnected" icon={Workflow} tone="purple" />
        <MetricCard label="Audit Health" value={null} description="Prometheus query 연동 대기" state="unconnected" icon={ShieldCheck} tone="green" />
        <MetricCard label="BE Readiness" value={readiness.data?.status} description="GET /actuator/health/readiness" state={readinessState} icon={CircleGauge} tone="blue" />
      </div>

      <div className="content-grid content-grid-wide-left">
        <SectionCard title="Attention Required" description="정상 BLOCK이 아닌 운영 확인 대상" actions={<button className="button button-secondary" type="button" onClick={() => navigate('/monitoring')}>전체 보기 <ArrowRight size={14} /></button>}>
          <div className="finding-list">
            {[
              ['Request digest mismatch', 'Security Findings Read Model 미구현'],
              ['Maker–Checker violation', 'Policy Review Queue 미구현'],
              ['Settlement state mismatch', 'Recovery Incident Read Model 미구현'],
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
              ['Backend Readiness', readiness.data?.status ?? '연결 확인 중'],
              ['Event Pipeline', 'Prometheus event pipeline metrics'],
              ['Recovery Worker', 'Prometheus recovery metrics'],
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
            endpoint="Prometheus Query API 또는 BFF Aggregation 미구현"
          />
        </SectionCard>
      </div>
    </section>
  );
}
