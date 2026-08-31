import { useQuery } from '@tanstack/react-query';
import { getDashboardSummary } from '../../shared/api/adminApi';

export function OverviewPage() {
  const { data } = useQuery({
    queryKey: ['dashboard-summary'],
    queryFn: getDashboardSummary,
  });

  return (
    <section className="page-section">
      <header className="page-header">
        <p className="page-kicker">Overview</p>
        <h1>운영 개요</h1>
      </header>
      <div className="metric-grid">
        <article className="metric-card">
          <span>오늘 요청</span>
          <strong>{data?.requestCount ?? '-'}</strong>
        </article>
        <article className="metric-card">
          <span>검토 대기</span>
          <strong>{data?.reviewCount ?? '-'}</strong>
        </article>
        <article className="metric-card">
          <span>차단</span>
          <strong>{data?.blockCount ?? '-'}</strong>
        </article>
      </div>
    </section>
  );
}
