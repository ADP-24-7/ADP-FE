import { Eye, RefreshCw, Search, ShieldAlert } from 'lucide-react';
import { useEffect, useState } from 'react';
import { normalizeApiError } from '../../../shared/api/apiError';
import { EmptyState, ErrorState, KeyValues, LoadingPanel, SectionCard, StatusBadge } from '../../../shared/components';
import { useReviewQueue, useReviewQueueDetail } from '../hooks/useReviewQueue';
import type { ReviewExecutionPack, ReviewSource } from '../model/types';

function sourceTone(source: ReviewSource) {
  if (source === 'RECOVERY') return 'danger' as const;
  if (source === 'POST_EXECUTION') return 'warning' as const;
  return 'info' as const;
}

type ReviewQueuePanelProps = {
  executionPack: ReviewExecutionPack;
  onOpenTrace: (executionId: string) => void;
  onOpenRecovery: (recoveryId: string) => void;
};

export function ReviewQueuePanel({ executionPack, onOpenTrace, onOpenRecovery }: ReviewQueuePanelProps) {
  const [page, setPage] = useState(0);
  const [selectedExecutionId, setSelectedExecutionId] = useState('');
  const queue = useReviewQueue({ executionPack, page, size: 20 });
  const detail = useReviewQueueDetail(selectedExecutionId);
  const totalPages = queue.data ? Math.ceil(queue.data.totalElements / queue.data.size) : 0;

  useEffect(() => {
    setPage(0);
    setSelectedExecutionId('');
  }, [executionPack]);

  return (
    <>
      <SectionCard
        title="Review Queue"
        description="정책·Recovery·외부 실행 검증에서 운영자 판단이 필요한 실행만 표시합니다."
        actions={(
          <div className="section-action-group">
            <StatusBadge tone={queue.isSuccess ? 'success' : 'warning'}>{queue.isSuccess ? 'REVIEW API CONNECTED' : 'REVIEW API'}</StatusBadge>
            <button className="button button-secondary" type="button" onClick={() => queue.refetch()} disabled={queue.isFetching} title="Review Queue 새로고침">
              <RefreshCw size={14} />새로고침
            </button>
          </div>
        )}
      >
        <div className="table-shell recovery-table-shell" aria-busy={queue.isFetching}>
          <div className="table-head table-recovery">
            <span>UPDATED</span><span>EXECUTION</span><span>WORKLOAD</span><span>SOURCE</span><span>ACTION</span><span>REASON</span>
          </div>
          {queue.isLoading ? <LoadingPanel label="Review Queue를 불러오는 중입니다" /> : queue.isError ? (
            <ErrorState description={normalizeApiError(queue.error).message} onRetry={() => queue.refetch()} />
          ) : queue.data?.items.length ? queue.data.items.map((item) => (
            <button
              className={`table-row table-recovery${selectedExecutionId === item.executionId ? ' active' : ''}`}
              type="button"
              key={item.executionId}
              onClick={() => setSelectedExecutionId(item.executionId)}
            >
              <span>{new Date(item.updatedAt).toLocaleString('ko-KR')}</span>
              <span><code>{item.executionId}</code><small>{item.executionPack}</small></span>
              <span>{item.workloadId}<small>{item.purposeCode}</small></span>
              <StatusBadge tone={sourceTone(item.reviewSource)}>{item.reviewSource}</StatusBadge>
              <span>{item.nextAction}</span>
              <span>{item.reasonCodes[0] ?? '—'}</span>
            </button>
          )) : (
            <EmptyState icon={Search} title="검토 대기 실행이 없습니다" description={`${executionPack} 범위와 현재 권한에 해당하는 REVIEW_REQUIRED 실행이 없습니다.`} endpoint="GET /api/admin/review-queue" />
          )}
        </div>
        <div className="pagination-row">
          <span>{queue.data ? `${queue.data.totalElements}건 · ${queue.data.page + 1}/${Math.max(totalPages, 1)} 페이지` : '조회 대기'}</span>
          <div>
            <button className="button button-secondary" type="button" disabled={page === 0 || queue.isFetching} onClick={() => { setPage(Math.max(0, page - 1)); setSelectedExecutionId(''); }}>이전</button>
            <button className="button button-secondary" type="button" disabled={!totalPages || page + 1 >= totalPages || queue.isFetching} onClick={() => { setPage(page + 1); setSelectedExecutionId(''); }}>다음</button>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Review Detail" description="민감 원문 없이 판단 근거와 다음 조사 경로를 확인합니다.">
        {!selectedExecutionId ? (
          <EmptyState icon={ShieldAlert} title="검토 대상 선택 대기" description="위 목록에서 실행을 선택하세요." />
        ) : detail.isLoading ? <LoadingPanel label="Review 상세를 불러오는 중입니다" /> : detail.isError ? (
          <ErrorState description={normalizeApiError(detail.error).message} onRetry={() => detail.refetch()} />
        ) : detail.data ? (
          <div className="recovery-detail-stack">
            <KeyValues items={[
              ['Execution ID', detail.data.executionId],
              ['Trace ID', detail.data.traceId],
              ['Pack / Workload', `${detail.data.executionPack} · ${detail.data.workloadId}`],
              ['Review Source', detail.data.reviewSource],
              ['Next Action', detail.data.nextAction],
              ['Reason Codes', detail.data.reasonCodes.join(' · ') || '—'],
              ['Connector / Response Guard', `${detail.data.connectorStatus ?? '—'} · ${detail.data.responseGuardStatus ?? '—'}`],
              ['Recovery', detail.data.recoveryStatus ?? '—'],
              ['Post-execution Evidence', detail.data.postExecutionEvidenceStatus ?? '—'],
              ['Mismatch Fields', detail.data.mismatchedFields.join(' · ') || '—'],
            ]} />
            <div className="section-action-group">
              <button className="button button-primary" type="button" onClick={() => onOpenTrace(detail.data.executionId)}>
                <Eye size={14} />Decision Trace
              </button>
              {detail.data.recoveryId ? (
                <button className="button button-secondary" type="button" onClick={() => onOpenRecovery(detail.data.recoveryId!)}>
                  <RefreshCw size={14} />Recovery Incident
                </button>
              ) : null}
            </div>
          </div>
        ) : null}
      </SectionCard>
    </>
  );
}
