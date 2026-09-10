import { ArrowRight, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { EmptyState, StatusBadge } from '../../../shared/components';
import type { MonitoringIssue } from '../model/monitoringViewModel';

export function ActionableIssueList({ issues }: { issues: MonitoringIssue[] }) {
  const navigate = useNavigate();

  if (!issues.length) {
    return <EmptyState compact icon={ShieldCheck} title="현재 열린 복구 조치가 없습니다" description="조회된 Recovery Incident가 모두 대사 완료됐거나 조치 대상이 없습니다." />;
  }

  return (
    <div className="actionable-issue-list">
      {issues.slice(0, 8).map((issue) => (
        <article key={issue.id}>
          <div className="actionable-issue-main">
            <StatusBadge tone={issue.state === 'action' ? 'danger' : 'warning'}>{issue.stateLabel}</StatusBadge>
            <div>
              <strong>{issue.title}</strong>
              <span>{issue.summary}</span>
              <p>{issue.recommendation}</p>
            </div>
            <button className="button button-secondary" type="button" onClick={() => navigate('/analysis')}>
              Recovery 열기 <ArrowRight size={14} />
            </button>
          </div>
          <details className="technical-details technical-details-inline">
            <summary>식별자와 원시 상태</summary>
            <div>
              <span>Execution</span><code>{issue.executionId}</code>
              <span>Recovery</span><code>{issue.id}</code>
              <span>Status</span><p>{issue.observedStatus} · {issue.recoveryStatus}</p>
              <span>Retry</span><p>{issue.retryDisposition}</p>
              <span>Updated</span><p>{new Date(issue.updatedAt).toLocaleString('ko-KR')}</p>
            </div>
          </details>
        </article>
      ))}
    </div>
  );
}
