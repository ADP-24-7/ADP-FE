import { Check, ChevronDown, ChevronUp, Download, FileClock, X } from 'lucide-react';
import { Fragment, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuthContext } from '../../auth';
import { normalizeApiError } from '../../../shared/api/apiError';
import { EmptyState, ErrorState, LoadingPanel, SectionCard, StatusBadge } from '../../../shared/components';
import {
  useAuditExport, useAuditExportWork, useAuditExportWorkSummary,
  useDecideAuditExport, useDownloadAuditExport,
} from '../hooks/useAuditExport';
import type { AuditExportJob, AuditExportStatus, AuditExportWorkView } from '../model/types';

const PAGE_SIZE = 10;
const APPROVAL_REASON = '요청 범위 및 반출 목적 확인';
const STATUS_LABELS: Record<AuditExportStatus, string> = {
  REQUESTED: '승인 대기', APPROVED: '생성 대기', GENERATING: '생성 중', READY: '다운로드 가능',
  REJECTED: '반려', FAILED: '실패', EXPIRED: '만료', REVOKED: '권한 회수',
};
const VIEWS: Array<[AuditExportWorkView, string]> = [
  ['MY_REQUESTS', '내 요청'], ['APPROVAL_QUEUE', '승인할 요청'], ['HISTORY', '전체 이력'],
];

function displayStatus(job: AuditExportJob) {
  return job.status === 'READY' && job.downloadedAt ? '다운로드 완료' : STATUS_LABELS[job.status];
}

function formatDate(value?: string | null) {
  return value ? new Date(value).toLocaleString('ko-KR') : '—';
}

function visiblePages(total: number, current: number) {
  const count = Math.min(5, total);
  const start = Math.max(0, Math.min(current - 2, total - count));
  return Array.from({ length: count }, (_, index) => start + index);
}

export function AuditExportWorkPanel() {
  const auth = useAuthContext();
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedView = searchParams.get('view') as AuditExportWorkView | null;
  const privileged = Boolean(auth.data?.roles.includes('PRIVILEGED_OPERATOR'));
  const [view, setView] = useState<AuditExportWorkView>(
    requestedView === 'APPROVAL_QUEUE' || requestedView === 'HISTORY' ? requestedView : 'MY_REQUESTS',
  );
  const [page, setPage] = useState(0);
  const [selectedId, setSelectedId] = useState('');
  const [rejecting, setRejecting] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const summary = useAuditExportWorkSummary();
  const work = useAuditExportWork(view, page, PAGE_SIZE, view === 'MY_REQUESTS' || privileged);
  const detail = useAuditExport(selectedId);
  const decide = useDecideAuditExport();
  const download = useDownloadAuditExport();
  const pages = work.data ? Math.ceil(work.data.totalElements / work.data.size) : 0;

  useEffect(() => {
    const nextView = requestedView === 'APPROVAL_QUEUE' || requestedView === 'HISTORY'
      ? (privileged ? requestedView : 'MY_REQUESTS')
      : 'MY_REQUESTS';
    if (view !== nextView) {
      setView(nextView);
      setPage(0);
      closeDetail();
    }
  }, [privileged, requestedView, view]);

  useEffect(() => {
    if (pages > 0 && page >= pages) setPage(pages - 1);
  }, [page, pages]);

  function closeDetail() {
    setSelectedId('');
    setRejecting(false);
    setRejectionReason('');
  }

  function selectView(next: AuditExportWorkView) {
    setView(next);
    setPage(0);
    closeDetail();
    setSearchParams({ section: 'approvals', view: next });
  }

  function selectJob(job: AuditExportJob) {
    if (selectedId === job.exportId) closeDetail();
    else {
      setSelectedId(job.exportId);
      setRejecting(false);
      setRejectionReason('');
    }
  }

  async function approveSelected() {
    await decide.mutateAsync({ exportId: selectedId, action: 'APPROVE', reason: APPROVAL_REASON });
    closeDetail();
    await work.refetch();
  }

  async function rejectSelected() {
    await decide.mutateAsync({ exportId: selectedId, action: 'REJECT', reason: rejectionReason.trim() });
    closeDetail();
    await work.refetch();
  }

  async function downloadJob(job: AuditExportJob) {
    const result = await download.mutateAsync(job.exportId);
    const url = URL.createObjectURL(result.blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = result.fileName;
    anchor.click();
    URL.revokeObjectURL(url);
    await work.refetch();
    if (selectedId === job.exportId) await detail.refetch();
  }

  return <SectionCard title="Requests & Approvals" description="내 감사 증적 반출 요청을 추적하고 권한이 있는 요청만 검토합니다." actions={<FileClock size={17} />}>
    <div className="approval-summary-strip">
      <span><small>내 승인 대기</small><strong>{summary.data?.personal.pendingApproval ?? '—'}</strong></span>
      <span><small>다운로드 가능</small><strong>{summary.data?.personal.readyToDownload ?? '—'}</strong></span>
      {privileged ? <span><small>승인 필요</small><strong>{summary.data?.approvals.pending ?? '—'}</strong></span> : null}
      {privileged ? <span><small>24시간 이상 대기</small><strong>{summary.data?.approvals.waitingOver24Hours ?? '—'}</strong></span> : null}
    </div>
    <div className="segmented-control approval-tabs" role="tablist" aria-label="승인 업무 구분">
      {VIEWS.filter(([key]) => key === 'MY_REQUESTS' || privileged).map(([key, label]) => <button key={key} type="button" role="tab" aria-selected={view === key} className={view === key ? 'active' : ''} onClick={() => selectView(key)}>{label}</button>)}
    </div>

    <div className="table-shell approval-work-table-shell">
      <div className="table-head table-approval-work"><span>상태</span><span>요청</span><span>요청자 / 처리자</span><span>요청일 / 처리일</span><span>작업</span></div>
      {work.isLoading ? <LoadingPanel label="승인 업무를 불러오는 중입니다" /> : work.isError ? <ErrorState description={normalizeApiError(work.error).message} onRetry={() => work.refetch()} /> : work.data?.items.length ? work.data.items.map((job) => <Fragment key={job.exportId}>
        <div className={`table-row table-approval-work${selectedId === job.exportId ? ' active' : ''}`}>
          <span><StatusBadge tone={job.status === 'READY' ? 'success' : job.status === 'REJECTED' || job.status === 'FAILED' ? 'danger' : 'warning'}>{displayStatus(job)}</StatusBadge></span>
          <span><strong>{job.format} 감사 증적</strong><small>{job.workloadId} · {job.executionPack}</small><code>{job.exportId}</code></span>
          <span><strong>{job.requesterId}</strong><small>{job.approverId ?? '처리자 미지정'}</small></span>
          <span>{formatDate(job.createdAt)}<small>{job.approvedAt ? formatDate(job.approvedAt) : '처리 대기'}</small></span>
          <span className="approval-row-actions"><button className="button button-secondary" type="button" aria-expanded={selectedId === job.exportId} onClick={() => selectJob(job)}>{view === 'APPROVAL_QUEUE' && job.status === 'REQUESTED' ? '검토' : '상세'}{selectedId === job.exportId ? <ChevronUp size={14} /> : <ChevronDown size={14} />}</button></span>
        </div>
        {selectedId === job.exportId ? <div className="approval-inline-detail">
          {detail.isLoading ? <LoadingPanel label="요청 상세를 불러오는 중입니다" /> : detail.isError ? <ErrorState compact description={normalizeApiError(detail.error).message} onRetry={() => detail.refetch()} /> : detail.data ? <>
            <div className="approval-detail-purpose"><span>요청 목적</span><strong>{detail.data.job.requestReason}</strong><p>선택한 실행의 정책 판단, 변환, 외부 전송, 복구 메타데이터와 Digest를 포함합니다. 민감 원문은 포함하지 않습니다.</p></div>
            <dl className="approval-detail-grid">
              <div><dt>대상 실행</dt><dd><code>{detail.data.job.executionId}</code></dd></div>
              <div><dt>업무 범위</dt><dd>{detail.data.job.workloadId} · {detail.data.job.executionPack}</dd></div>
              <div><dt>반출 형식</dt><dd>{detail.data.job.reportType} · {detail.data.job.format}</dd></div>
              <div><dt>무결성 기준</dt><dd><code>{detail.data.job.scopeDigest}</code></dd></div>
              <div><dt>요청자</dt><dd>{detail.data.job.requesterId}</dd></div>
              <div><dt>요청 시각</dt><dd>{formatDate(detail.data.job.createdAt)}</dd></div>
              {detail.data.job.approverId ? <div><dt>처리자</dt><dd>{detail.data.job.approverId}</dd></div> : null}
              {detail.data.job.approvalReason ? <div><dt>처리 근거</dt><dd>{detail.data.job.approvalReason}</dd></div> : null}
              {detail.data.job.contentDigest ? <div><dt>결과 Digest</dt><dd><code>{detail.data.job.contentDigest}</code></dd></div> : null}
              {detail.data.job.rowCount != null ? <div><dt>생성 결과</dt><dd>{detail.data.job.rowCount}행 · {detail.data.job.contentSize ?? 0} bytes</dd></div> : null}
              {detail.data.job.failureCode ? <div><dt>실패 코드</dt><dd>{detail.data.job.failureCode}</dd></div> : null}
            </dl>
            {detail.data.events.length ? <div className="approval-event-history"><strong>처리 이력</strong>{detail.data.events.map((event) => <div key={event.eventId}><span>{event.action}</span><small>{event.fromStatus ?? 'START'} → {event.toStatus}</small><small>{event.actorId}</small><time>{formatDate(event.occurredAt)}</time></div>)}</div> : null}
            <div className="approval-detail-actions">
              {view === 'APPROVAL_QUEUE' && job.status === 'REQUESTED' ? <><div className="approval-standard"><span>승인 기준</span><strong>{APPROVAL_REASON}</strong><small>승인 시 요청 내용은 변경되지 않습니다.</small></div><button className="button button-primary" type="button" disabled={decide.isPending} onClick={approveSelected}><Check size={14} />승인</button><button className="button button-danger" type="button" disabled={decide.isPending} onClick={() => setRejecting((value) => !value)}><X size={14} />반려</button></> : null}
              {view === 'MY_REQUESTS' && job.status === 'READY' && !job.downloadedAt ? <button className="button button-primary" type="button" onClick={() => downloadJob(job)}><Download size={14} />다운로드</button> : null}
              <button className="icon-button" title="상세 닫기" type="button" onClick={closeDetail}><X size={14} /></button>
            </div>
            {rejecting ? <div className="approval-rejection-form"><label className="field"><span>반려 사유</span><textarea value={rejectionReason} maxLength={500} rows={3} placeholder="요청자가 보완해야 할 내용을 구체적으로 입력하세요" onChange={(event) => setRejectionReason(event.target.value)} /></label><button className="button button-danger" type="button" disabled={!rejectionReason.trim() || decide.isPending} onClick={rejectSelected}>반려 확정</button></div> : null}
          </> : null}
        </div> : null}
      </Fragment>) : <EmptyState title="표시할 승인 업무가 없습니다" description="현재 계정과 권한 범위에 해당하는 감사 증적 요청이 없습니다." />}
    </div>
    <div className="pagination-row"><span>{work.data ? `${work.data.totalElements}건 · 페이지당 ${PAGE_SIZE}건` : '조회 대기'}</span><div className="numbered-pagination">
      <button className="button button-secondary" type="button" disabled={page === 0} onClick={() => { setPage((value) => value - 1); closeDetail(); }}>이전</button>
      {visiblePages(pages, page).map((pageIndex) => <button key={pageIndex} className={`page-button${page === pageIndex ? ' active' : ''}`} type="button" aria-label={`${pageIndex + 1}페이지`} aria-current={page === pageIndex ? 'page' : undefined} onClick={() => { setPage(pageIndex); closeDetail(); }}>{pageIndex + 1}</button>)}
      <button className="button button-secondary" type="button" disabled={!pages || page + 1 >= pages} onClick={() => { setPage((value) => value + 1); closeDetail(); }}>다음</button>
    </div></div>
  </SectionCard>;
}
