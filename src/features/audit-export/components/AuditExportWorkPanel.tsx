import { AlertTriangle, Check, ChevronDown, ChevronUp, Download, FileClock, RotateCcw, X } from 'lucide-react';
import { Fragment, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuthContext } from '../../auth';
import { normalizeApiError } from '../../../shared/api/apiError';
import { EmptyState, ErrorState, LoadingPanel, SectionCard, StatusBadge } from '../../../shared/components';
import {
  useAuditExport, useAuditExportWork, useAuditExportWorkSummary, useCreateAuditExport,
  useDecideAuditExport, useDownloadAuditExport,
} from '../hooks/useAuditExport';
import type { AuditExportJob, AuditExportStatus, AuditExportWorkView } from '../model/types';

const PAGE_SIZE = 10;
const APPROVAL_REASON = '요청 범위 및 반출 목적 확인';
const STATUS_LABELS: Record<AuditExportStatus, string> = {
  REQUESTED: '승인 대기', APPROVED: '생성 대기', GENERATING: '생성 중', READY: '다운로드 가능',
  REJECTED: '반려', FAILED: '실패', EXPIRED: '만료', REVOKED: '폐기됨',
};
const VIEWS: Array<[AuditExportWorkView, string]> = [
  ['MY_REQUESTS', '내 요청'],
  ['MY_HISTORY', '내 요청 이력'],
  ['APPROVAL_QUEUE', '승인할 요청'],
  ['DECISION_HISTORY', '내 처리 이력'],
  ['AUDIT_HISTORY', '기관 감사 이력'],
];

function canAccessView(view: AuditExportWorkView | null, requester: boolean, privileged: boolean, auditor: boolean) {
  if (!view) return false;
  if (view === 'MY_REQUESTS' || view === 'MY_HISTORY') return requester;
  if (view === 'APPROVAL_QUEUE' || view === 'DECISION_HISTORY') return privileged;
  return auditor;
}

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

function waitingTime(createdAt: string) {
  const elapsedMillis = Date.now() - new Date(createdAt).getTime();
  if (!Number.isFinite(elapsedMillis) || elapsedMillis < 0) return null;
  const hours = Math.floor(elapsedMillis / 3_600_000);
  if (hours >= 24) return { overdue: true, label: `24시간 초과 · ${hours}시간 대기` };
  if (hours < 1) return { overdue: false, label: '1시간 미만 대기' };
  return { overdue: false, label: `${hours}시간 대기` };
}

function isRevocable(status: AuditExportStatus) {
  return status === 'APPROVED' || status === 'GENERATING' || status === 'READY';
}

type ApprovalWorkRowProps = {
  job: AuditExportJob;
  view: AuditExportWorkView;
  privileged: boolean;
  expanded: boolean;
  deciding: boolean;
  downloading: boolean;
  onToggle: (exportId: string) => void;
  onApprove: (exportId: string) => Promise<void>;
  onReject: (exportId: string, reason: string) => Promise<void>;
  onRevoke: (exportId: string, reason: string) => Promise<void>;
  onDownload: (job: AuditExportJob) => Promise<void>;
  onRerequest: (job: AuditExportJob, reason: string) => Promise<void>;
};

function ApprovalWorkRow({
  job, view, privileged, expanded, deciding, downloading, onToggle, onApprove, onReject, onRevoke, onDownload, onRerequest,
}: ApprovalWorkRowProps) {
  const detail = useAuditExport(job.exportId, expanded);
  const [decisionMode, setDecisionMode] = useState<'REJECT' | 'REVOKE' | 'REREQUEST' | null>(null);
  const [decisionReason, setDecisionReason] = useState('');
  const actionLabel = view === 'APPROVAL_QUEUE' && job.status === 'REQUESTED' ? '검토' : '상세';
  const waiting = view === 'APPROVAL_QUEUE' && job.status === 'REQUESTED' ? waitingTime(job.createdAt) : null;
  const canRevoke = privileged && isRevocable(job.status);

  function toggle() {
    onToggle(job.exportId);
    if (expanded) {
      setDecisionMode(null);
      setDecisionReason('');
    }
  }

  return <Fragment>
    <div
      className={`table-row table-approval-work approval-clickable-row${expanded ? ' active' : ''}`}
      role="button"
      tabIndex={0}
      aria-expanded={expanded}
      aria-label={`${job.format} 감사 증적 ${actionLabel}`}
      onClick={toggle}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          toggle();
        }
      }}
    >
      <span><StatusBadge tone={job.status === 'READY' ? 'success' : job.status === 'REJECTED' || job.status === 'FAILED' ? 'danger' : 'warning'}>{displayStatus(job)}</StatusBadge>{waiting ? <small className={waiting.overdue ? 'approval-waiting overdue' : 'approval-waiting'}>{waiting.overdue ? <AlertTriangle size={12} /> : null}{waiting.label}</small> : null}</span>
      <span><strong>{job.format} 감사 증적</strong><small>{job.workloadId} · {job.executionPack}</small><code>{job.exportId}</code></span>
      <span><strong>{job.requesterId}</strong><small>{job.approverId ?? '처리자 미지정'}</small></span>
      <span>{formatDate(job.createdAt)}<small>{job.approvedAt ? formatDate(job.approvedAt) : '처리 대기'}</small></span>
      <span className="approval-row-actions"><strong>{actionLabel}</strong>{expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}</span>
    </div>
    {expanded ? <div className="approval-inline-detail">
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
          {detail.data.job.expiresAt ? <div><dt>다운로드 만료</dt><dd>{formatDate(detail.data.job.expiresAt)}</dd></div> : null}
          {detail.data.job.failureCode ? <div><dt>실패 코드</dt><dd>{detail.data.job.failureCode}</dd></div> : null}
        </dl>
        {detail.data.events.length ? <div className="approval-event-history"><strong>처리 이력</strong>{detail.data.events.map((event) => <div key={event.eventId}><span>{event.action}</span><small>{event.fromStatus ?? 'START'} → {event.toStatus}</small><small>{event.actorId}</small><time>{formatDate(event.occurredAt)}</time></div>)}</div> : null}
        <div className="approval-detail-actions">
          {view === 'APPROVAL_QUEUE' && job.status === 'REQUESTED' ? <><div className="approval-standard"><span>승인 기준</span><strong>{APPROVAL_REASON}</strong><small>승인 시 요청 내용은 변경되지 않습니다.</small></div><button className="button button-primary" type="button" disabled={deciding} onClick={() => onApprove(job.exportId)}><Check size={14} />승인</button><button className="button button-danger" type="button" disabled={deciding} onClick={() => { setDecisionMode((value) => value === 'REJECT' ? null : 'REJECT'); setDecisionReason(''); }}><X size={14} />반려</button></> : null}
          {view === 'MY_REQUESTS' && job.status === 'READY' && !job.downloadedAt ? <button className="button button-primary" type="button" disabled={downloading} onClick={() => onDownload(job)}><Download size={14} />다운로드</button> : null}
          {view === 'MY_HISTORY' ? <button className="button button-secondary" type="button" disabled={deciding} onClick={() => { setDecisionMode((value) => value === 'REREQUEST' ? null : 'REREQUEST'); setDecisionReason(job.requestReason); }}><RotateCcw size={14} />다시 요청</button> : null}
          {canRevoke ? <button className="button button-danger" type="button" disabled={deciding} onClick={() => { setDecisionMode((value) => value === 'REVOKE' ? null : 'REVOKE'); setDecisionReason(''); }}><X size={14} />폐기</button> : null}
          <button className="icon-button" title="상세 닫기" type="button" onClick={toggle}><X size={14} /></button>
        </div>
        {decisionMode ? <div className="approval-rejection-form"><label className="field"><span>{decisionMode === 'REVOKE' ? '폐기 사유' : decisionMode === 'REJECT' ? '반려 사유' : '새 요청 목적'}</span><textarea value={decisionReason} maxLength={500} rows={3} placeholder={decisionMode === 'REVOKE' ? '승인 또는 반출을 중단해야 하는 근거를 입력하세요' : decisionMode === 'REJECT' ? '요청자가 보완해야 할 내용을 구체적으로 입력하세요' : '현재 업무 목적에 맞게 반출 목적을 확인하거나 수정하세요'} onChange={(event) => setDecisionReason(event.target.value)} /></label><button className={`button ${decisionMode === 'REREQUEST' ? 'button-primary' : 'button-danger'}`} type="button" disabled={!decisionReason.trim() || deciding} onClick={() => decisionMode === 'REVOKE' ? onRevoke(job.exportId, decisionReason.trim()) : decisionMode === 'REJECT' ? onReject(job.exportId, decisionReason.trim()) : onRerequest(job, decisionReason.trim())}>{decisionMode === 'REVOKE' ? '폐기 확정' : decisionMode === 'REJECT' ? '반려 확정' : '새 요청 제출'}</button></div> : null}
      </> : null}
    </div> : null}
  </Fragment>;
}

export function AuditExportWorkPanel() {
  const auth = useAuthContext();
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedView = searchParams.get('view') as AuditExportWorkView | null;
  const privileged = Boolean(auth.data?.roles.includes('PRIVILEGED_OPERATOR'));
  const auditor = Boolean(auth.data?.roles.includes('AUDITOR'));
  const operator = Boolean(auth.data?.roles.includes('OPERATOR'));
  const exportEligible = operator || privileged || auditor;
  const allowedViews = VIEWS.filter(([key]) => canAccessView(key, exportEligible, privileged, auditor));
  const requestedViewAllowed = canAccessView(requestedView, exportEligible, privileged, auditor);
  const [view, setView] = useState<AuditExportWorkView>(
    requestedViewAllowed && requestedView ? requestedView : 'MY_REQUESTS',
  );
  const [page, setPage] = useState(0);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => new Set());
  const summary = useAuditExportWorkSummary(exportEligible);
  const work = useAuditExportWork(view, page, PAGE_SIZE, exportEligible && canAccessView(view, exportEligible, privileged, auditor));
  const decide = useDecideAuditExport();
  const download = useDownloadAuditExport();
  const create = useCreateAuditExport();
  const pages = work.data ? Math.ceil(work.data.totalElements / work.data.size) : 0;

  useEffect(() => {
    const nextView = canAccessView(requestedView, exportEligible, privileged, auditor) && requestedView
      ? requestedView
      : 'MY_REQUESTS';
    if (view !== nextView) {
      setView(nextView);
      setPage(0);
      closeDetails();
    }
  }, [auditor, exportEligible, privileged, requestedView, view]);

  useEffect(() => {
    if (pages > 0 && page >= pages) setPage(pages - 1);
  }, [page, pages]);

  function closeDetails() {
    setExpandedIds(new Set());
  }

  function selectView(next: AuditExportWorkView) {
    setView(next);
    setPage(0);
    closeDetails();
    setSearchParams({ section: 'approvals', view: next });
  }

  function toggleJob(exportId: string) {
    setExpandedIds((current) => {
      const next = new Set(current);
      if (next.has(exportId)) next.delete(exportId);
      else next.add(exportId);
      return next;
    });
  }

  async function approveJob(exportId: string) {
    await decide.mutateAsync({ exportId, action: 'APPROVE', reason: APPROVAL_REASON });
    setExpandedIds((current) => new Set([...current].filter((id) => id !== exportId)));
    await work.refetch();
  }

  async function rejectJob(exportId: string, reason: string) {
    await decide.mutateAsync({ exportId, action: 'REJECT', reason });
    setExpandedIds((current) => new Set([...current].filter((id) => id !== exportId)));
    await work.refetch();
  }

  async function revokeJob(exportId: string, reason: string) {
    await decide.mutateAsync({ exportId, action: 'REVOKE', reason });
    setExpandedIds((current) => new Set([...current].filter((id) => id !== exportId)));
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

  async function rerequestJob(job: AuditExportJob, reason: string) {
    await create.mutateAsync({
      executionId: job.executionId,
      reportType: 'EXECUTION_EVIDENCE',
      format: job.format,
      reason,
      idempotencyKey: `audit-export-rerequest-${crypto.randomUUID()}`,
    });
    setExpandedIds((current) => new Set([...current].filter((id) => id !== job.exportId)));
    selectView('MY_REQUESTS');
  }

  if (!exportEligible) return null;

  return <SectionCard title="요청 및 승인" description="내 감사 증적 반출 요청을 추적하고 권한이 있는 요청만 검토합니다." actions={<FileClock size={17} />}>
    <div className="approval-summary-strip">
      <span><small>내 승인 대기</small><strong>{summary.data?.personal.pendingApproval ?? '—'}</strong></span>
      <span><small>다운로드 가능</small><strong>{summary.data?.personal.readyToDownload ?? '—'}</strong></span>
      {privileged ? <span><small>승인 필요</small><strong>{summary.data?.approvals.pending ?? '—'}</strong></span> : null}
      {privileged ? <span><small>24시간 이상 대기</small><strong>{summary.data?.approvals.waitingOver24Hours ?? '—'}</strong></span> : null}
    </div>
    <div className="segmented-control approval-tabs" role="tablist" aria-label="승인 업무 구분">
      {allowedViews.map(([key, label]) => <button key={key} type="button" role="tab" aria-selected={view === key} className={view === key ? 'active' : ''} onClick={() => selectView(key)}>{label}</button>)}
    </div>
    {view === 'APPROVAL_QUEUE' ? <div className="approval-priority-note"><AlertTriangle size={15} /><span><strong>우선 처리</strong> 24시간을 초과한 요청부터 오래된 접수 순으로 표시합니다.</span></div> : null}

    <div className="table-shell approval-work-table-shell">
      <div className="table-head table-approval-work"><span>상태</span><span>요청</span><span>요청자 / 처리자</span><span>요청일 / 처리일</span><span>작업</span></div>
      {work.isLoading ? <LoadingPanel label="승인 업무를 불러오는 중입니다" /> : work.isError ? <ErrorState description={normalizeApiError(work.error).message} onRetry={() => work.refetch()} /> : work.data?.items.length ? work.data.items.map((job) => <ApprovalWorkRow key={job.exportId} job={job} view={view} privileged={privileged} expanded={expandedIds.has(job.exportId)} deciding={decide.isPending || create.isPending} downloading={download.isPending} onToggle={toggleJob} onApprove={approveJob} onReject={rejectJob} onRevoke={revokeJob} onDownload={downloadJob} onRerequest={rerequestJob} />) : <EmptyState title="표시할 승인 업무가 없습니다" description="현재 계정과 권한 범위에 해당하는 감사 증적 요청이 없습니다." />}
    </div>
    <div className="pagination-row"><span>{work.data ? `${work.data.totalElements}건 · 페이지당 ${PAGE_SIZE}건` : '조회 대기'}</span><div className="numbered-pagination">
      <button className="button button-secondary" type="button" disabled={page === 0} onClick={() => { setPage((value) => value - 1); closeDetails(); }}>이전</button>
      {visiblePages(pages, page).map((pageIndex) => <button key={pageIndex} className={`page-button${page === pageIndex ? ' active' : ''}`} type="button" aria-label={`${pageIndex + 1}페이지`} aria-current={page === pageIndex ? 'page' : undefined} onClick={() => { setPage(pageIndex); closeDetails(); }}>{pageIndex + 1}</button>)}
      <button className="button button-secondary" type="button" disabled={!pages || page + 1 >= pages} onClick={() => { setPage((value) => value + 1); closeDetails(); }}>다음</button>
    </div></div>
  </SectionCard>;
}
