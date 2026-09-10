import { useBackendReadiness } from '../../features/monitoring';
import { useOperationsSummary } from '../../features/operations-monitoring';
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
  const { selectedPack } = useExecutionPack();
  const readiness = useBackendReadiness();
  const operations = useOperationsSummary(60, selectedPack.apiValue);
  const navigate = useNavigate();

  const readinessState = readiness.isLoading ? 'loading' : readiness.isError ? 'error' : 'value';
  const operationsState = operations.isLoading ? 'loading' : operations.isError ? 'error' : 'value';
  const operationalSignals = operations.data ? [
    [operations.data.recovery.backlog, 'Recovery backlog', `${operations.data.recovery.backlog}건 · 가장 오래된 대기 ${operations.data.recovery.oldestBacklogAgeSeconds ?? '—'}초`, '/analysis#recovery-incidents'],
    [operations.data.recovery.manualReview, 'Manual review', `${operations.data.recovery.manualReview}건 · exhausted ${operations.data.recovery.exhausted}건`, '/analysis#review-queue'],
    [operations.data.policy.driftedSelections, 'Policy selection drift', `${operations.data.policy.driftedSelections}건 · current ${operations.data.policy.currentSelections}건`, '/monitoring#policy-events'],
    [operations.data.security.institutionScopeMismatch, 'Institution scope mismatch', `${operations.data.security.institutionScopeMismatch}건 · 전체 denied ${operations.data.security.deniedAttempts}건`, '/monitoring#security-findings'],
  ].filter(([value]) => Number(value) > 0) as Array<[number, string, string, string]> : [];

  return (
    <section className="page-section">
      <PageHeader
        eyebrow="POLICY DECISION → FINDING → TRACE → RECOVERY"
        title="Security Overview"
        description="현재 운영 상태와 서버가 집계한 신호를 한 화면에서 확인합니다."
        actions={<StatusBadge tone={readiness.isError ? 'danger' : readiness.data?.status === 'UP' ? 'success' : 'warning'}>{readiness.isError ? 'BE UNAVAILABLE' : readiness.data?.status === 'UP' ? 'BE READY' : 'BE CHECKING'}</StatusBadge>}
      />

      <div className="metric-grid metric-grid-six">
        <MetricCard label="Denied Attempts" value={operations.data?.security.deniedAttempts} description="최근 60분 보안 거부" state={operationsState} icon={ShieldAlert} tone="red" />
        <MetricCard label="Recovery Backlog" value={operations.data?.recovery.backlog} description="외부 상태 확인 대기" state={operationsState} icon={AlertTriangle} tone="amber" />
        <MetricCard label="Runtime Block" value={operations.data?.runtime.blocked} description="정책 차단 실행" state={operationsState} icon={ShieldX} tone="red" />
        <MetricCard label="Manual Review" value={operations.data?.recovery.manualReview} description="운영자 검토 대상" state={operationsState} icon={Workflow} tone="purple" />
        <MetricCard label="Policy Drift" value={operations.data?.policy.driftedSelections} description="Current Selection 불일치" state={operationsState} icon={ShieldCheck} tone="green" />
        <MetricCard label="BE Readiness" value={readiness.data?.status} description="GET /actuator/health/readiness" state={readinessState} icon={CircleGauge} tone="blue" />
      </div>

      <div className="content-grid content-grid-wide-left">
        <SectionCard title="Current Operational Signals" description="0이 아닌 서버 집계값을 표시하며 FE가 임계치나 이상 여부를 판정하지 않습니다." actions={<button className="button button-secondary" type="button" onClick={() => navigate('/monitoring')}>상세 보기 <ArrowRight size={14} /></button>}>
          {operations.isError ? (
            <EmptyState title="Operations API 오류" description="운영 집계를 불러오지 못했습니다. Monitoring 화면에서 연결 상태를 확인하세요." endpoint="GET /api/admin/operations/summary" />
          ) : operationalSignals.length ? (
            <div className="finding-list">
              {operationalSignals.map(([, title, detail, path]) => (
                <button key={title} type="button" className="finding-row" onClick={() => navigate(path)}>
                  <span>API</span>
                  <strong>{title}</strong>
                  <small>{detail}</small>
                  <ArrowRight size={14} />
                </button>
              ))}
            </div>
          ) : operations.data ? (
            <EmptyState icon={ShieldCheck} title="현재 0이 아닌 운영 신호가 없습니다" description="최근 60분 Recovery, Policy Drift와 Security 거부 집계가 모두 0입니다." />
          ) : <EmptyState title="운영 집계 조회 중" description="권한 범위의 Operations Summary를 불러오고 있습니다." />}
        </SectionCard>

        <SectionCard title="Enforcement Posture" description="두 실행 도메인의 통제 상태">
          <div className="posture-list">
            <article>
              <strong>AI · Agent</strong>
              <span>Data · Tool · Action · Provider · Response</span>
              <StatusBadge tone={selectedPack.key === 'ai' ? 'success' : 'neutral'}>{selectedPack.key === 'ai' ? 'SELECTED' : 'NOT SELECTED'}</StatusBadge>
            </article>
            <article>
              <strong>Digital Asset</strong>
              <span>Value-use · Transaction · Settlement · Reconciliation</span>
              <StatusBadge tone={selectedPack.key === 'digital-asset' ? 'success' : 'neutral'}>{selectedPack.key === 'digital-asset' ? 'SELECTED' : 'NOT SELECTED'}</StatusBadge>
            </article>
          </div>
          <KeyValues
            items={[
              ['Backend Readiness', readiness.data?.status ?? '연결 확인 중'],
              ['Operations Summary', operations.data?.schemaVersion ?? '연결 확인 중'],
              ['Recovery Worker', operations.data ? `${operations.data.recovery.completedOperations} completed operations` : '연결 확인 중'],
              ['Selected Domain', selectedPack.label],
              ['Operations Data Scope', `${selectedPack.apiValue} · Security는 전체 권한 허용 Workload`],
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

        <SectionCard title="Operations Read Model" description="현재 FE가 사용하는 실제 운영 데이터 소스" actions={<StatusBadge tone={operations.isSuccess ? 'success' : 'warning'}>{operations.isSuccess ? 'CONNECTED' : 'CHECKING'}</StatusBadge>}>
          <EmptyState
            icon={ListChecks}
            title={operations.data ? `${operations.data.windowMinutes}분 집계 연결됨` : 'Operations Summary 확인 중'}
            description={operations.data ? `생성 시각 ${new Date(operations.data.generatedAt).toLocaleString('ko-KR')} · 개별 Security Finding은 별도 Read Model이 필요합니다.` : 'BE scoped Operations Summary 응답을 기다리고 있습니다.'}
            endpoint="GET /api/admin/operations/summary"
          />
        </SectionCard>
      </div>
    </section>
  );
}
