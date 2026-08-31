import { CircleGauge, RefreshCw, RotateCcw, ShieldX } from 'lucide-react';
import { EmptyState, KeyValues, PageHeader, SectionCard, StatusBadge } from '../../shared/components';

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
        eyebrow="OBSERVABILITY & RECOVERY"
        title="모니터링 · Recovery"
        description="데이터 접근, Privacy, Utility, Runtime, Governance를 분리해 관찰하고 불확실한 전송 상태를 복구합니다."
        actions={<StatusBadge tone="warning">METRICS API 대기</StatusBadge>}
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

      <div className="content-grid content-grid-wide-left">
        <SectionCard title="Recovery Control" description="Timeout 이후 중복 전송과 결과 유실을 막는 운영 절차" actions={<StatusBadge>데이터 없음</StatusBadge>}>
          <KeyValues
            items={[
              ['SENT_UNKNOWN', '—'],
              ['Outbox Pending', '—'],
              ['Replay Candidates', '—'],
              ['Open Incidents', '—'],
            ]}
          />
          <div className="action-row">
            <button className="button button-secondary" type="button" disabled><RefreshCw size={14} />Reconcile</button>
            <button className="button button-secondary" type="button" disabled><RotateCcw size={14} />Safe Replay</button>
            <button className="button button-secondary" type="button" disabled><ShieldX size={14} />Rollback</button>
          </div>
        </SectionCard>

        <SectionCard title="Infrastructure Health" description="업무 지표와 분리된 의존성 상태">
          <EmptyState compact icon={CircleGauge} title="API 연결 대기" description="Gateway, DB, Vault, Provider, Audit Outbox 상태를 연결합니다." endpoint="GET /v1/health" />
        </SectionCard>
      </div>
    </section>
  );
}
