import { AlertTriangle, CheckCircle2, RefreshCw, RotateCcw, Search, ShieldAlert } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { normalizeApiError } from '../../../shared/api/apiError';
import { EmptyState, ErrorState, KeyValues, LoadingPanel, SectionCard, StatusBadge } from '../../../shared/components';
import { useRecoveryCommand, useRecoveryIncident, useRecoveryIncidents } from '../hooks/useRecoveryOperations';
import { getRecoveryCommandAvailability } from '../model/recoveryCommandPolicy';
import type { RecoveryOperationType, RecoveryStatus } from '../model/types';

const recoveryStatuses: RecoveryStatus[] = [
  'PENDING',
  'CLAIMED',
  'RETRY_SCHEDULED',
  'RECONCILED',
  'MANUAL_REVIEW',
  'EXHAUSTED',
];

const commandCopy: Record<RecoveryOperationType, { label: string; description: string }> = {
  RECONCILE: {
    label: '외부 상태 확인',
    description: 'Provider 상태만 조회합니다. 결과를 알 수 없는 요청을 재전송하지 않습니다.',
  },
  RETRY: {
    label: '안전 재시도',
    description: 'BE가 외부 상태를 NOT_SENT로 확인한 경우에만 동일 요청을 재시도합니다.',
  },
  MARK_REVIEW: {
    label: '수동 검토 전환',
    description: '자동 처리를 중단하고 MANUAL_REVIEW 상태로 전환합니다.',
  },
};

function statusTone(status: RecoveryStatus) {
  if (status === 'RECONCILED') return 'success' as const;
  if (status === 'EXHAUSTED') return 'danger' as const;
  if (status === 'MANUAL_REVIEW' || status === 'RETRY_SCHEDULED') return 'warning' as const;
  return 'info' as const;
}

export function RecoveryOperationsPanel() {
  const [status, setStatus] = useState<RecoveryStatus | ''>('');
  const [page, setPage] = useState(0);
  const [selectedRecoveryId, setSelectedRecoveryId] = useState('');
  const [selectedCommand, setSelectedCommand] = useState<RecoveryOperationType>('RECONCILE');
  const [commandConfirmed, setCommandConfirmed] = useState(false);
  const operationIds = useRef<Partial<Record<RecoveryOperationType, string>>>({});
  const params = { status: status || undefined, page, size: 20 };
  const incidents = useRecoveryIncidents(params);
  const detail = useRecoveryIncident(selectedRecoveryId);
  const command = useRecoveryCommand();
  const totalPages = incidents.data ? Math.ceil(incidents.data.totalElements / incidents.data.size) : 0;
  const commandAvailability = detail.data ? getRecoveryCommandAvailability(detail.data) : null;
  const availableCommands = commandAvailability
    ? (Object.keys(commandCopy) as RecoveryOperationType[]).filter((type) => commandAvailability[type].enabled)
    : [];
  const effectiveCommand = commandAvailability?.[selectedCommand].enabled
    ? selectedCommand
    : availableCommands[0] ?? selectedCommand;

  useEffect(() => {
    setCommandConfirmed(false);
    operationIds.current = {};
  }, [selectedRecoveryId, selectedCommand]);

  function selectIncident(recoveryId: string) {
    command.reset();
    setSelectedRecoveryId(recoveryId);
  }

  function selectCommandType(operationType: RecoveryOperationType) {
    command.reset();
    setSelectedCommand(operationType);
  }

  function executeCommand() {
    if (!selectedRecoveryId || !commandConfirmed || !commandAvailability?.[effectiveCommand].enabled) return;
    const operationId = operationIds.current[effectiveCommand]
      ?? `fe_${effectiveCommand.toLowerCase()}_${crypto.randomUUID()}`;
    operationIds.current[effectiveCommand] = operationId;
    command.mutate({ recoveryId: selectedRecoveryId, operationType: effectiveCommand, operationId }, {
      onSuccess: () => {
        delete operationIds.current[effectiveCommand];
        setCommandConfirmed(false);
      },
    });
  }

  return (
    <>
      <SectionCard
        title="Recovery Incident"
        description="현재 사용자에게 허용된 Institution·Workload 범위의 외부 실행 불명 상태를 조회합니다."
        actions={<StatusBadge tone={incidents.isSuccess ? 'success' : 'warning'}>{incidents.isSuccess ? 'RECOVERY API CONNECTED' : 'RECOVERY API'}</StatusBadge>}
      >
        <div className="recovery-toolbar">
          <label className="field">
            <span>Recovery Status</span>
            <select value={status} onChange={(event) => { setStatus(event.target.value as RecoveryStatus | ''); setPage(0); }}>
              <option value="">전체 상태</option>
              {recoveryStatuses.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </label>
          <button className="button button-secondary" type="button" onClick={() => incidents.refetch()} disabled={incidents.isFetching}>
            <RefreshCw size={14} />새로고침
          </button>
        </div>

        <div className="table-shell recovery-table-shell">
          <div className="table-head table-recovery">
            <span>UPDATED</span><span>RECOVERY / EXECUTION</span><span>WORKLOAD</span><span>STATUS</span><span>ATTEMPT</span><span>DISPOSITION</span>
          </div>
          {incidents.isLoading ? <LoadingPanel label="Recovery Incident를 불러오는 중입니다" /> : incidents.isError ? (
            <ErrorState description={normalizeApiError(incidents.error).message} onRetry={() => incidents.refetch()} />
          ) : incidents.data?.items.length ? incidents.data.items.map((item) => (
            <button
              className={`table-row table-recovery${selectedRecoveryId === item.recoveryId ? ' active' : ''}`}
              type="button"
              key={item.recoveryId}
              onClick={() => selectIncident(item.recoveryId)}
            >
              <span>{new Date(item.updatedAt).toLocaleString('ko-KR')}</span>
              <span><code>{item.recoveryId}</code><small>{item.executionId}</small></span>
              <span>{item.workloadId}<small>{item.purposeCode}</small></span>
              <StatusBadge tone={statusTone(item.recoveryStatus)}>{item.recoveryStatus}</StatusBadge>
              <span>{item.attemptCount} / {item.maxAttempts}</span>
              <span>{item.retryDisposition}</span>
            </button>
          )) : (
            <EmptyState
              icon={Search}
              title="Recovery Incident가 없습니다"
              description={status ? `${status} 조건과 현재 권한 범위에 일치하는 Incident가 없습니다.` : '현재 권한 범위에 저장된 Recovery Incident가 없습니다.'}
              endpoint="GET /api/admin/recovery/incidents"
            />
          )}
        </div>

        <div className="pagination-row">
          <span>{incidents.data ? `${incidents.data.totalElements}건 · ${incidents.data.page + 1}/${Math.max(totalPages, 1)} 페이지` : '조회 대기'}</span>
          <div>
            <button className="button button-secondary" type="button" disabled={page === 0} onClick={() => setPage((value) => Math.max(0, value - 1))}>이전</button>
            <button className="button button-secondary" type="button" disabled={!totalPages || page + 1 >= totalPages} onClick={() => setPage((value) => value + 1)}>다음</button>
          </div>
        </div>
      </SectionCard>

      <div className="content-grid content-grid-wide-left recovery-detail-grid">
        <SectionCard title="Incident Detail" description="Provider correlation 원문을 제외한 상태와 Digest Evidence">
          {!selectedRecoveryId ? (
            <EmptyState icon={Search} title="Incident 선택 대기" description="위 목록에서 Recovery Incident를 선택하세요." />
          ) : detail.isLoading ? <LoadingPanel label="Recovery 상세를 불러오는 중입니다" /> : detail.isError ? (
            <ErrorState description={normalizeApiError(detail.error).message} onRetry={() => detail.refetch()} />
          ) : detail.data ? (
            <div className="recovery-detail-stack">
              <KeyValues items={[
                ['Recovery ID', detail.data.recoveryId],
                ['Execution ID', detail.data.executionId],
                ['Connector', `${detail.data.connectorId} · ${detail.data.observedStatus}`],
                ['External Status', detail.data.lastObservedExternalStatus ?? '확인 전'],
                ['Recovery Status', detail.data.recoveryStatus],
                ['Retry Disposition', detail.data.retryDisposition],
                ['Attempt', `${detail.data.attemptCount} / ${detail.data.maxAttempts}`],
                ['Next Attempt', detail.data.nextAttemptAt ? new Date(detail.data.nextAttemptAt).toLocaleString('ko-KR') : '—'],
                ['Last Error', detail.data.lastErrorCode ?? '—'],
                ['Status Evidence', detail.data.statusQueryEvidenceDigest ?? '—'],
              ]} />
              <div className="operation-history">
                <h3>Operation Evidence</h3>
                {detail.data.operations.length ? detail.data.operations.map((operation) => (
                  <div key={operation.operationId}>
                    <code>{operation.operationId}</code>
                    <span>{operation.operationType}</span>
                    <StatusBadge tone={operation.outcome === 'SUCCEEDED' ? 'success' : operation.outcome === 'IN_PROGRESS' ? 'warning' : 'danger'}>{operation.outcome}</StatusBadge>
                    <small>{operation.reasonCode ?? '—'}</small>
                  </div>
                )) : <EmptyState compact title="운영 명령 이력 없음" description="이 Incident에 실행된 수동 운영 명령이 없습니다." />}
              </div>
            </div>
          ) : null}
        </SectionCard>

        <SectionCard title="Recovery Command" description="모든 명령은 PRIVILEGED_OPERATOR와 operationId 멱등성을 BE가 검증합니다.">
          {!detail.data ? (
            <EmptyState icon={ShieldAlert} title="Incident 선택 필요" description="명령을 실행할 Recovery Incident를 먼저 선택하세요." />
          ) : !availableCommands.length ? (
            <EmptyState
              icon={CheckCircle2}
              title="실행 가능한 Recovery 명령이 없습니다"
              description={commandAvailability?.[effectiveCommand].reason ?? '현재 Incident 상태에서는 추가 운영 명령을 실행할 수 없습니다.'}
            />
          ) : (
            <div className="recovery-command-panel">
              <div className="command-state-guidance">
                <StatusBadge tone={statusTone(detail.data.recoveryStatus)}>{detail.data.recoveryStatus}</StatusBadge>
                <span>현재 상태와 Retry Disposition에 따라 실행 가능한 명령만 활성화됩니다.</span>
              </div>
              <div className="command-selector" role="tablist" aria-label="Recovery command 선택">
                {(Object.keys(commandCopy) as RecoveryOperationType[]).map((type) => (
                  <button
                    key={type}
                    type="button"
                    role="tab"
                    aria-selected={effectiveCommand === type}
                    className={effectiveCommand === type ? 'active' : ''}
                    disabled={!commandAvailability?.[type].enabled}
                    title={commandAvailability?.[type].reason}
                    onClick={() => selectCommandType(type)}
                  >
                    {type === 'RECONCILE' ? <RefreshCw size={14} /> : type === 'RETRY' ? <RotateCcw size={14} /> : <AlertTriangle size={14} />}
                    {commandCopy[type].label}
                  </button>
                ))}
              </div>
              <div className="command-explanation">
                <strong>{commandCopy[effectiveCommand].label}</strong>
                <p>{commandCopy[effectiveCommand].description}</p>
                <small>{commandAvailability?.[effectiveCommand].reason}</small>
              </div>
              <label className="checkbox-row">
                <input type="checkbox" checked={commandConfirmed} onChange={(event) => setCommandConfirmed(event.target.checked)} />
                <span>{detail.data.recoveryId}에 {effectiveCommand} 명령을 실행합니다.</span>
              </label>
              <button className={effectiveCommand === 'RETRY' ? 'button button-danger' : 'button button-primary'} type="button" disabled={!commandConfirmed || command.isPending} onClick={executeCommand}>
                {command.isPending ? '명령 처리 중...' : commandCopy[effectiveCommand].label}
              </button>
              {command.isError ? (
                <ErrorState
                  title="Recovery 명령이 거부됐습니다"
                  description={`${normalizeApiError(command.error).errorCode}: ${normalizeApiError(command.error).message}`}
                  onRetry={executeCommand}
                  retryLabel="같은 Operation ID로 재시도"
                />
              ) : null}
              {command.data ? (
                <div className="governance-result">
                  <CheckCircle2 size={15} />
                  <strong>{command.data.operationType} · {command.data.outcome}</strong>
                  <span>{command.data.recoveryStatus} · {command.data.reasonCode ?? 'NO_REASON'}{command.data.replayed ? ' · REPLAYED' : ''}</span>
                </div>
              ) : null}
            </div>
          )}
        </SectionCard>
      </div>
    </>
  );
}
