import { useDashboardSummary } from '../../features/monitoring';
import { AlertTriangle, ArrowRight, BarChart3, ChevronDown, Database, ShieldCheck, ShieldX, Workflow } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BulletList, EmptyState, ErrorState, KeyValues, MetricCard, PageHeader, SectionCard, StatusBadge } from '../../shared/components';
import { executionPacks, timeRanges, useExecutionPack } from '../../shared/prototype';

export function OverviewPage() {
  const summary = useDashboardSummary();
  const navigate = useNavigate();
  const { selectedPack, selectedPackKey, selectPack } = useExecutionPack();
  const [selectedBoundary, setSelectedBoundary] = useState('01');
  const [selectedRange, setSelectedRange] = useState<(typeof timeRanges)[number]>('최근 24시간');
  const [isRangeOpen, setIsRangeOpen] = useState(false);

  const overviewState = summary.isLoading ? 'loading' : summary.isError ? 'error' : summary.data ? 'value' : 'unconnected';
  const selectedBoundaryDetail = selectedPack.boundaries.find((boundary) => boundary.number === selectedBoundary) ?? selectedPack.boundaries[0];

  return (
    <section className="page-section">
      <PageHeader
        eyebrow="EXISTING CONTROL + EXTENDED EXECUTION BOUNDARY"
        title="운영 개요"
        description="기존 금융권 통제를 대체하지 않고, 승인 결과를 새로운 외부 실행 경계까지 일관되게 집행합니다."
        actions={<StatusBadge tone={summary.isError ? 'danger' : summary.data ? 'success' : 'warning'}>{summary.isError ? 'API ERROR' : summary.data ? 'REAL DATA' : 'API 연결 대기'}</StatusBadge>}
      />

      <div className="control-boundary-grid">
        <article className="control-boundary-card">
          <span className="control-card-number">01</span>
          <small>EXISTING CONTROL BASELINE</small>
          <h2>기존 금융권 통제</h2>
          <StatusBadge tone="info">상속</StatusBadge>
          <BulletList items={['접근권한·기간제 승인', '기본 마스킹·해제 절차', '기존 DLP Finding', '파일·메일 반출 승인', '암호화·망연계', '서비스 이용 로그']} />
        </article>

        <article className="control-boundary-card">
          <span className="control-card-number">02</span>
          <small>FPG EXTENDED BOUNDARY</small>
          <h2>새로운 외부 실행 경계</h2>
          <StatusBadge tone="purple">확장</StatusBadge>
          <BulletList items={['Prompt·RAG Context', 'API JSON·Attachment Metadata', 'Provider·Tenant·Region', 'Retention·Training Use', 'Webhook·External Response', 'Protocol Field·Required Exact']} />
        </article>

        <article className="control-boundary-card control-boundary-card-accent">
          <span className="control-card-number">03</span>
          <small>SECURITY FIRST</small>
          <h2>Zero-Unapproved Raw Egress</h2>
          <p>승인 Scope와 실제 Released Field를 매 실행마다 비교하고 하나의 Decision Trace로 연결합니다.</p>
          <BulletList items={['승인 조건 재사용·Review 분기', 'Response Leakage 차단', 'Policy·Profile Expiry 탐지']} />
        </article>
      </div>

      <SectionCard title="Execution Pack 선택" description="채널별 Gateway 계약 범위를 선택하면 아래 운영 경계와 버전 컨텍스트가 즉시 바뀝니다.">
        <div className="execution-pack-grid" role="tablist" aria-label="Execution Pack 선택">
          {executionPacks.map((pack) => (
            <button
              key={pack.key}
              type="button"
              className={pack.key === selectedPackKey ? 'execution-pack-card active' : 'execution-pack-card'}
              role="tab"
              aria-selected={pack.key === selectedPackKey}
              onClick={() => {
                selectPack(pack.key);
                setSelectedBoundary('01');
              }}
            >
              <span>{pack.label}</span>
              <b>{pack.role}</b>
              <small>{pack.scope}</small>
              <em>{pack.badge}</em>
            </button>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Selected Execution Pack" description={`${selectedPack.label} 기준의 prototype contract metadata`}>
        <div className="selected-pack-panel">
          <div>
            <span>SELECTED EXECUTION PACK</span>
            <h2>{selectedPack.label}</h2>
            <p>{selectedPack.objective}</p>
          </div>
          <StatusBadge tone="purple">{selectedPack.descriptor}</StatusBadge>
        </div>
      </SectionCard>

      {summary.isError ? (
        <ErrorState
          description="백엔드의 GET /v1/monitoring/overview 응답 또는 네트워크 설정을 확인해 주세요."
          onRetry={() => void summary.refetch()}
        />
      ) : (
        <div className="metric-grid">
          <MetricCard label="처리 요청" value={summary.data?.requestCount} description="GET /v1/metrics/summary" state={overviewState} icon={Workflow} />
          <MetricCard label="Data Access 차단" value={null} description="정책 외 내부 데이터 접근" state="unconnected" icon={Database} tone="amber" />
          <MetricCard label="외부 전송 방지" value={summary.data?.blockCount} description="Raw·금지 Field Egress 차단" state={overviewState} icon={ShieldX} tone="red" />
          <MetricCard label="결과 Guard" value={null} description="응답·Webhook·State 재검증" state="unconnected" icon={ShieldCheck} tone="purple" />
        </div>
      )}

      <div className="content-grid content-grid-wide-left">
        <SectionCard
          title={`${selectedPack.label} End-to-End 처리 현황`}
          description="선택 Pack의 단계별 처리량과 최종 판정 추이"
          actions={(
            <div className="dropdown">
              <button
                className="select-trigger"
                type="button"
                aria-haspopup="menu"
                aria-expanded={isRangeOpen}
                onClick={() => setIsRangeOpen((current) => !current)}
              >
                {selectedRange}
                <ChevronDown size={14} />
              </button>
              {isRangeOpen ? (
                <div className="dropdown-menu" role="menu">
                  {timeRanges.map((range) => (
                    <button
                      key={range}
                      type="button"
                      role="menuitemradio"
                      aria-checked={range === selectedRange}
                      onClick={() => {
                        setSelectedRange(range);
                        setIsRangeOpen(false);
                      }}
                    >
                      {range}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          )}
        >
          <EmptyState
            icon={BarChart3}
            title="API 연결 대기"
            description={`${selectedRange} Metrics API 연결 후 실제 요청 추이와 최종 판정 분포를 표시합니다.`}
            endpoint="GET /v1/metrics/summary"
          />
        </SectionCard>

        <SectionCard title="Runtime Version Context" description="결정을 재현하기 위한 공통·도메인 버전">
          <KeyValues items={selectedPack.versionContext} />
        </SectionCard>
      </div>

      <div className="content-grid content-grid-three">
        {selectedPack.policyHarness.map((item) => (
          <SectionCard key={item.title} title={item.title} description={item.description}>
            <EmptyState compact title="API 연결 대기" description="Policy Harness API 연결 후 승인된 정책 Artifact 상태를 표시합니다." endpoint="GET /v1/policies" />
          </SectionCard>
        ))}
      </div>

      <div className="content-grid content-grid-two">
        <SectionCard title="선택 Pack 운영 경계" description="보호해야 하는 핵심 지점">
          <div className="boundary-list">
            {selectedPack.boundaries.map((boundary) => (
              <button
                key={boundary.number}
                type="button"
                className={boundary.number === selectedBoundary ? 'boundary-item active' : 'boundary-item'}
                onClick={() => setSelectedBoundary(boundary.number)}
              >
                <span>{boundary.number}</span>
                <p><b>{boundary.title}</b><small>{boundary.description}</small></p>
                <ArrowRight size={14} />
              </button>
            ))}
          </div>
          <div className="boundary-detail">
            <span>{selectedBoundaryDetail.number}</span>
            <p><b>{selectedBoundaryDetail.title}</b><small>{selectedBoundaryDetail.description}</small></p>
            <button className="button button-secondary" type="button" onClick={() => navigate(selectedBoundaryDetail.route)}>
              관련 화면으로 이동
              <ArrowRight size={14} />
            </button>
          </div>
        </SectionCard>

        <SectionCard
          title="최근 운영 이벤트"
          description="Review, Block, Recovery 대상"
          actions={<button className="button button-secondary" type="button" onClick={() => navigate('/audit')}>전체 추적 <ArrowRight size={14} /></button>}
        >
          <EmptyState icon={AlertTriangle} title="API 연결 대기" description="Audit API가 연결되기 전에는 임의 이벤트를 표시하지 않습니다." endpoint="GET /v1/audit-events" />
        </SectionCard>
      </div>
    </section>
  );
}
