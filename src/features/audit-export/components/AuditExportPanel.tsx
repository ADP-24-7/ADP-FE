import { useEffect, useState } from 'react';
import { Check, Download, FileOutput, RefreshCw, X } from 'lucide-react';
import { useAuthContext } from '../../auth';
import { normalizeApiError } from '../../../shared/api/apiError';
import { ErrorState, KeyValues, StatusBadge } from '../../../shared/components';
import { useAuditExport, useCreateAuditExport, useDecideAuditExport, useDownloadAuditExport } from '../hooks/useAuditExport';
import type { AuditExportFormat, AuditExportStatus } from '../model/types';

const STATUS_LABELS: Record<AuditExportStatus, string> = {
  REQUESTED: '승인 대기', APPROVED: '생성 대기', GENERATING: '생성 중', READY: '다운로드 가능',
  REJECTED: '반려', FAILED: '생성 실패', EXPIRED: '만료', REVOKED: '권한 회수',
};

export function AuditExportPanel({ executionId }: { executionId: string }) {
  const auth = useAuthContext();
  const storageKey = `adp.audit-export.${executionId}`;
  const [format, setFormat] = useState<AuditExportFormat>('CSV');
  const [reason, setReason] = useState('내부 감사 증적 제출');
  const [exportId, setExportId] = useState(() => window.localStorage.getItem(storageKey) ?? '');
  const [idempotencyKey, setIdempotencyKey] = useState(() => `exp-${crypto.randomUUID()}`);
  const create = useCreateAuditExport();
  const detail = useAuditExport(exportId);
  const decide = useDecideAuditExport();
  const download = useDownloadAuditExport();
  const job = detail.data?.job ?? create.data;
  const canApprove = Boolean(job && job.status === 'REQUESTED'
    && auth.data?.roles.includes('PRIVILEGED_OPERATOR')
    && auth.data.principalId !== job.requesterId);
  const canRevoke = Boolean(job?.status === 'READY' && auth.data?.roles.includes('PRIVILEGED_OPERATOR'));

  useEffect(() => {
    if (!create.data?.exportId) return;
    setExportId(create.data.exportId);
    window.localStorage.setItem(storageKey, create.data.exportId);
  }, [create.data?.exportId, storageKey]);

  async function requestExport() {
    await create.mutateAsync({
      executionId, reportType: 'EXECUTION_EVIDENCE', format,
      reason: reason.trim(), idempotencyKey,
    });
  }

  async function downloadFile() {
    const result = await download.mutateAsync(job!.exportId);
    const url = URL.createObjectURL(result.blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = result.fileName;
    anchor.click();
    URL.revokeObjectURL(url);
    await detail.refetch();
  }

  function resetExport() {
    window.localStorage.removeItem(storageKey);
    setExportId('');
    setIdempotencyKey(`exp-${crypto.randomUUID()}`);
    create.reset();
  }

  const error = create.error ?? detail.error ?? decide.error ?? download.error;

  return (
    <div className="audit-export-panel">
      <div className="audit-export-heading">
        <div><h3>감사 증적 내보내기</h3><p>선택한 실행의 허용된 메타데이터와 Digest만 CSV 또는 PDF로 생성합니다.</p></div>
        {job ? <StatusBadge tone={job.status === 'READY' ? 'success' : job.status === 'FAILED' || job.status === 'REJECTED' ? 'danger' : 'warning'}>{STATUS_LABELS[job.status]}</StatusBadge> : <FileOutput size={18} />}
      </div>

      {!job ? (
        <div className="audit-export-request">
          <div className="segmented-control" role="group" aria-label="내보내기 형식">
            {(['CSV', 'PDF'] as const).map((value) => (
              <button type="button" className={format === value ? 'active' : ''} key={value} onClick={() => setFormat(value)}>{value}</button>
            ))}
          </div>
          <label className="field"><span>반출 목적</span><input maxLength={500} value={reason} onChange={(event) => setReason(event.target.value)} /></label>
          <button className="button button-primary" type="button" disabled={!reason.trim() || create.isPending} onClick={requestExport}>
            <FileOutput size={15} />{create.isPending ? '요청 중' : '승인 요청'}
          </button>
        </div>
      ) : (
        <>
          <KeyValues items={[
            ['Export ID', job.exportId], ['Format', job.format], ['Requester', job.requesterId],
            ['Approver', job.approverId ?? '승인 대기'], ['Content Digest', job.contentDigest ?? '생성 전'],
            ['Expires At', job.expiresAt ? new Date(job.expiresAt).toLocaleString('ko-KR') : '생성 후 확정'],
          ]} />
          <div className="audit-export-actions">
            <button className="button button-secondary" type="button" title="상태 새로고침" onClick={() => detail.refetch()} disabled={detail.isFetching}><RefreshCw size={15} /></button>
            {canApprove ? <button className="button button-primary" type="button" onClick={() => decide.mutate({ exportId: job.exportId, action: 'APPROVE', reason: '반출 범위와 목적 확인' })}><Check size={15} />승인</button> : null}
            {canApprove ? <button className="button button-danger" type="button" onClick={() => decide.mutate({ exportId: job.exportId, action: 'REJECT', reason: '반출 조건 미충족' })}><X size={15} />반려</button> : null}
            {job.status === 'READY' ? <button className="button button-primary" type="button" disabled={download.isPending} onClick={downloadFile}><Download size={15} />다운로드</button> : null}
            {canRevoke ? <button className="button button-danger" type="button" onClick={() => decide.mutate({ exportId: job.exportId, action: 'REVOKE', reason: '다운로드 권한 회수' })}><X size={15} />폐기</button> : null}
            {['REJECTED', 'FAILED', 'EXPIRED', 'REVOKED'].includes(job.status) ? <button className="button button-secondary" type="button" onClick={resetExport}><FileOutput size={15} />새 요청</button> : null}
          </div>
          {job.status === 'REQUESTED' && !canApprove ? <p className="helper-text">요청자와 다른 권한자의 승인이 필요합니다.</p> : null}
        </>
      )}
      {error ? <ErrorState compact description={normalizeApiError(error).message} onRetry={() => exportId ? detail.refetch() : requestExport()} /> : null}
    </div>
  );
}
