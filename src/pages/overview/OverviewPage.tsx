import { useDashboardSummary } from '../../features/monitoring';
import { EmptyState, ErrorState, MetricCard, PageHeader, SectionCard } from '../../shared/components';

export function OverviewPage() {
  const summary = useDashboardSummary();

  const hasData = summary.data != null;

  return (
    <section className="page-section">
      <PageHeader
        eyebrow="Overview"
        title="운영 개요"
        description="게이트웨이의 실제 집계 데이터만 표시합니다. 응답이 없으면 임의의 숫자를 채우지 않습니다."
        actions={<button className="button button-secondary" onClick={() => void summary.refetch()}>새로고침</button>}
      />

      {summary.isError ? (
        <ErrorState
          description="백엔드의 GET /v1/monitoring/overview 응답 또는 네트워크 설정을 확인해 주세요."
          onRetry={() => void summary.refetch()}
        />
      ) : (
        <div className="metric-grid">
          <MetricCard label="오늘 요청" value={summary.data?.requestCount} description="오늘 처리된 전체 실행" loading={summary.isLoading} />
          <MetricCard label="검토 대기" value={summary.data?.reviewCount} description="REVIEW 상태 실행" loading={summary.isLoading} />
          <MetricCard label="차단" value={summary.data?.blockCount} description="BLOCK 상태 실행" loading={summary.isLoading} />
        </div>
      )}

      <div className="content-grid content-grid-two">
        <SectionCard title="결정 분포" description="ALLOW · TRANSFORM · REVIEW · BLOCK">
          <EmptyState
            compact
            title={hasData ? '데이터가 없습니다' : 'API 연결 대기'}
            description="분포 응답이 추가되면 실제 비율과 건수를 표시합니다."
            endpoint="GET /v1/monitoring/decisions"
          />
        </SectionCard>

        <SectionCard title="활성 정책" description="현재 런타임에서 사용하는 정책 스냅샷">
          <EmptyState
            compact
            title="API 연결 대기"
            description="ACTIVE 정책이 없거나 정책 조회 API가 아직 연결되지 않았습니다."
            endpoint="GET /v1/policies?status=ACTIVE"
          />
        </SectionCard>
      </div>

      <SectionCard title="최근 운영 알림" description="감사 누락, 전송 상태 불명확, 정책 변경 등의 운영 이벤트">
        <EmptyState
          title="API 연결 대기"
          description="서버에서 실제 알림이 발생하면 최신순으로 표시됩니다."
          endpoint="GET /v1/operations?severity=WARNING,CRITICAL"
        />
      </SectionCard>
    </section>
  );
}
