import { useDashboardSummary } from '../../features/monitoring';
import { AlertTriangle, ArrowRight, BarChart3, ChevronDown, Database, ShieldCheck, ShieldX, Workflow } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BulletList, DomainSwitch, EmptyState, ErrorState, KeyValues, MetricCard, PageHeader, SectionCard, StatusBadge } from '../../shared/components';
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
  const domainPacks = executionPacks.filter((pack) => pack.key !== 'common');
  const selectedDomainKey = selectedPack.key === 'common' ? 'ai' : selectedPack.key;

  return (
    <section className="page-section">
      <PageHeader
        eyebrow="RUNTIME CONTROL PLANE"
        title="운영 개요"
        description="요청부터 데이터 접근, 외부 전송, 응답 검증, 전달까지 전체 Gateway 상태를 확인합니다."
        actions={<StatusBadge tone={summary.isError ? 'danger' : summary.data ? 'success' : 'warning'}>{summary.isError ? 'API ERROR' : summary.data ? 'REAL DATA' : 'API 연결 대기'}</StatusBadge>}
      />

      <SectionCard title="실행 축 선택" description="AI, SaaS, Digital Asset 축을 같은 라우트 안에서 전환해 정책 Harness와 실행 경계를 비교합니다.">
        <DomainSwitch
          label="실행 축 선택"
          value={selectedDomainKey}
          options={domainPacks.map((pack) => ({
            key: pack.key,
            label: pack.label,
            description: pack.scope,
            badge: pack.implementation,
          }))}
          onChange={(packKey) => {
            selectPack(packKey);
            setSelectedBoundary('01');
          }}
        />
      </SectionCard>

      <div className="content-grid content-grid-two">
        <SectionCard title="Existing Control Baseline" description="기존 금융권 통제는 대체하지 않고 Runtime 판단의 입력 근거로 사용합니다.">
          <p className="plain-copy">{selectedPack.baseline}</p>
          <BulletList items={['접근권한·기간제 승인', '마스킹·해제 절차', 'DLP Finding·반출승인', '감사 로그·사후 소명']} />
        </SectionCard>

        <SectionCard title="FPG Extended Boundary" description="Prompt, API, Webhook, Response처럼 기존 반출 통제 밖의 실행 경계를 다룹니다.">
          <BulletList items={selectedPack.executionSurfaces} />
        </SectionCard>
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
          <MetricCard label="처리 요청" value={summary.data?.requestCount} description="GET /v1/monitoring/overview" state={overviewState} icon={Workflow} />
          <MetricCard label="Data Access 차단" value={null} description="GET /v1/monitoring/data-access" state="unconnected" icon={Database} tone="amber" />
          <MetricCard label="Raw Egress 방지" value={summary.data?.blockCount} description="GET /v1/monitoring/overview" state={overviewState} icon={ShieldX} tone="red" />
          <MetricCard label="Response Leakage" value={null} description="GET /v1/monitoring/privacy" state="unconnected" icon={ShieldCheck} tone="purple" />
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
