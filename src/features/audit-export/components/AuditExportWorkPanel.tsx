import { Check, Download, FileClock, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuthContext } from '../../auth';
import { normalizeApiError } from '../../../shared/api/apiError';
import { EmptyState, ErrorState, LoadingPanel, SectionCard, StatusBadge } from '../../../shared/components';
import { useAuditExportWork, useAuditExportWorkSummary, useDecideAuditExport, useDownloadAuditExport } from '../hooks/useAuditExport';
import type { AuditExportJob, AuditExportStatus, AuditExportWorkView } from '../model/types';

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

export function AuditExportWorkPanel() {
  const auth = useAuthContext();
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedView = searchParams.get('view') as AuditExportWorkView | null;
  const privileged = Boolean(auth.data?.roles.includes('PRIVILEGED_OPERATOR'));
  const [view, setView] = useState<AuditExportWorkView>(
    requestedView === 'APPROVAL_QUEUE' || requestedView === 'HISTORY' ? requestedView : 'MY_REQUESTS',
  );
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState<AuditExportJob | null>(null);
  const [reason, setReason] = useState('업무 범위와 반출 목적 확인');
  const summary = useAuditExportWorkSummary();
  const work = useAuditExportWork(view, page, 10, view === 'MY_REQUESTS' || privileged);
  const decide = useDecideAuditExport();
  const download = useDownloadAuditExport();

  useEffect(() => {
    if (!privileged && view !== 'MY_REQUESTS') setView('MY_REQUESTS');
  }, [privileged, view]);

  useEffect(() => {
    const nextView = requestedView === 'APPROVAL_QUEUE' || requestedView === 'HISTORY'
      ? (privileged ? requestedView : 'MY_REQUESTS')
      : 'MY_REQUESTS';
    setView(nextView);
    setPage(0);
    setSelected(null);
  }, [privileged, requestedView]);

  function selectView(next: AuditExportWorkView) {
    setView(next);
    setPage(0);
    setSelected(null);
    setSearchParams({ section: 'approvals', view: next });
  }

  async function decideSelected(action: 'APPROVE' | 'REJECT') {
    if (!selected) return;
    await decide.mutateAsync({ exportId: selected.exportId, action, reason: reason.trim() });
    setSelected(null);
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
  }

  const pages = work.data ? Math.ceil(work.data.totalElements / work.data.size) : 0;
  return <SectionCard
    title="Requests & Approvals"
    description="내 감사 증적 반출 요청을 추적하고 권한이 있는 요청만 검토합니다."
    actions={<FileClock size={17} />}
  >
    <div className="approval-summary-strip">
      <span><small>내 승인 대기</small><strong>{summary.data?.personal.pendingApproval ?? '—'}</strong></span>
      <span><small>다운로드 가능</small><strong>{summary.data?.personal.readyToDownload ?? '—'}</strong></span>
      {privileged ? <span><small>승인 필요</small><strong>{summary.data?.approvals.pending ?? '—'}</strong></span> : null}
      {privileged ? <span><small>24시간 이상 대기</small><strong>{summary.data?.approvals.waitingOver24Hours ?? '—'}</strong></span> : null}
    </div>
    <div className="segmented-control approval-tabs" role="tablist" aria-label="승인 업무 구분">
      {VIEWS.filter(([key]) => key === 'MY_REQUESTS' || privileged).map(([key, label]) => <button
        key={key} type="button" role="tab" aria-selected={view === key}
        className={view === key ? 'active' : ''} onClick={() => selectView(key)}
      >{label}</button>)}
    </div>

    <div className="table-shell approval-work-table-shell">
      <div className="table-head table-approval-work"><span>상태</span><span>요청</span><span>요청자 / 처리자</span><span>요청일 / 처리일</span><span>작업</span></div>
      {work.isLoading ? <LoadingPanel label="승인 업무를 불러오는 중입니다" /> : work.isError ? (
        <ErrorState description={normalizeApiError(work.error).message} onRetry={() => work.refetch()} />
      ) : work.data?.items.length ? work.data.items.map((job) => <div className="table-row table-approval-work" key={job.exportId}>
        <span><StatusBadge tone={job.status === 'READY' ? 'success' : job.status === 'REJECTED' || job.status === 'FAILED' ? 'danger' : 'warning'}>{displayStatus(job)}</StatusBadge></span>
        <span><strong>{job.format} 감사 증적</strong><small>{job.workloadId} · {job.executionPack}</small><code>{job.exportId}</code></span>
        <span><strong>{job.requesterId}</strong><small>{job.approverId ?? '처리자 미지정'}</small></span>
        <span>{new Date(job.createdAt).toLocaleString('ko-KR')}<small>{job.approvedAt ? new Date(job.approvedAt).toLocaleString('ko-KR') : '처리 대기'}</small></span>
        <span className="approval-row-actions">
          {view === 'APPROVAL_QUEUE' && job.status === 'REQUESTED' ? <button className="button button-secondary" type="button" onClick={() => setSelected(job)}>검토</button> : null}
          {view === 'MY_REQUESTS' && job.status === 'READY' && !job.downloadedAt ? <button className="button button-primary" type="button" onClick={() => downloadJob(job)}><Download size={14} />다운로드</button> : null}
        </span>
      </div>) : <EmptyState title="표시할 승인 업무가 없습니다" description="현재 계정과 권한 범위에 해당하는 감사 증적 요청이 없습니다." />}
    </div>
    <div className="pagination-row"><span>{work.data ? `${work.data.totalElements}건` : '조회 대기'}</span><div>
      <button className="button button-secondary" type="button" disabled={page === 0} onClick={() => setPage((value) => value - 1)}>이전</button>
      <button className="button button-secondary" type="button" disabled={!pages || page + 1 >= pages} onClick={() => setPage((value) => value + 1)}>다음</button>
    </div></div>

    {selected ? <div className="approval-review-panel">
      <div><strong>{selected.format} 감사 증적 검토</strong><span>{selected.requestReason}</span><small>{selected.workloadId} · {selected.executionId}</small></div>
      <label className="field"><span>처리 사유</span><input value={reason} maxLength={500} onChange={(event) => setReason(event.target.value)} /></label>
      <div><button className="button button-primary" type="button" disabled={!reason.trim() || decide.isPending} onClick={() => decideSelected('APPROVE')}><Check size={14} />승인</button><button className="button button-danger" type="button" disabled={!reason.trim() || decide.isPending} onClick={() => decideSelected('REJECT')}><X size={14} />반려</button><button className="icon-button" title="검토 닫기" type="button" onClick={() => setSelected(null)}><X size={14} /></button></div>
    </div> : null}
  </SectionCard>;
}
