import { useState, type FormEvent } from 'react';
import { FileCheck2, LockKeyhole, Search } from 'lucide-react';
import { useAuditExecutions, useExecutionEvidence } from '../../features/audit-trace';
import { normalizeApiError } from '../../shared/api/apiError';
import { EmptyState, ErrorState, KeyValues, LoadingPanel, PackContextSummary, PageHeader, SectionCard, StatusBadge } from '../../shared/components';
import { useExecutionPack } from '../../shared/prototype';

export function AuditPage() {
  const { selectedPack } = useExecutionPack();
  const [executionId, setExecutionId] = useState('');
  const [submittedExecutionId, setSubmittedExecutionId] = useState('');
  const audit = useAuditExecutions({ size: 20 });
  const evidence = useExecutionEvidence(submittedExecutionId);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmittedExecutionId(executionId.trim());
  }

  return (
    <section className="page-section">
      <PageHeader
        eyebrow="REQUEST TO OUTCOME · RAW-FREE EVIDENCE"
        title="Decision Trace"
        description="승인부터 외부 실행, 결과 검증과 감사까지 하나의 실행 ID로 재현합니다."
        actions={<StatusBadge tone={audit.isSuccess ? 'success' : 'warning'}>{audit.isSuccess ? 'AUDIT API CONNECTED' : 'AUDIT API'}</StatusBadge>}
      />

      <PackContextSummary label={selectedPack.label} scope={selectedPack.scope} descriptor={selectedPack.descriptor} objective={selectedPack.objective} />

      <SectionCard title="Evidence Pack 조회" description="Execution ID로 Privacy-safe 감사 증적을 조회합니다." actions={<FileCheck2 size={16} />}>
        <form className="search-row" onSubmit={submit}>
          <label className="field field-grow">
            <span>Execution ID</span>
            <input value={executionId} onChange={(event) => setExecutionId(event.target.value)} placeholder="조회할 execution ID" required />
          </label>
          <button className="button button-primary" type="submit">검색</button>
        </form>
      </SectionCard>

      <SectionCard title={selectedPack.key === 'digital-asset' ? '거래 실행 증적' : '고객상담 AI 안전 실행 증적'} description={selectedPack.objective} actions={<StatusBadge tone={evidence.data ? 'success' : 'neutral'}>{evidence.data ? evidence.data.runtimeStatus : 'NO EVIDENCE'}</StatusBadge>}>
        {evidence.isLoading ? <LoadingPanel label="감사 증적을 불러오는 중입니다" /> : evidence.isError ? (
          <ErrorState description={normalizeApiError(evidence.error).message} onRetry={() => evidence.refetch()} />
        ) : evidence.data ? (
          <KeyValues items={[
            ['Execution ID', evidence.data.executionId],
            ['Trace ID', evidence.data.traceId],
            ['Workload', evidence.data.workloadId],
            ['Purpose', evidence.data.purposeCode],
            ['Final Action', evidence.data.policy.finalAction ?? '—'],
            ['Policy Version', evidence.data.policy.policyVersion ?? '—'],
            ['Destination', evidence.data.egress.destinationProfileId ?? '—'],
            ['Connector', evidence.data.egress.connectorStatus ?? '—'],
            ['Recovery', String(evidence.data.recovery.recoveryStatus ?? '—')],
            ['Export Digest', evidence.data.exportContentDigest],
          ]} />
        ) : (
          <EmptyState icon={Search} title="Execution ID 입력 대기" description="Runtime 실행 결과의 executionId를 입력하면 digest 기반 Evidence Pack을 조회합니다." endpoint="GET /api/admin/audit/executions/{executionId}/evidence" />
        )}
      </SectionCard>

      <SectionCard title="감사 실행 목록" description="현재 인증 사용자의 Institution·Workload 범위만 최신순으로 표시합니다." actions={<StatusBadge>{audit.data ? `${audit.data.totalElements} ITEMS` : 'READ MODEL'}</StatusBadge>}>
        <div className="empty-table">
          <div className="table-head table-audit">
            <span>발생 시각</span><span>Execution ID</span><span>Workload</span><span>Final Action</span><span>Status</span>
          </div>
          {audit.isLoading ? <LoadingPanel label="감사 실행 목록을 불러오는 중입니다" /> : audit.isError ? (
            <ErrorState description={normalizeApiError(audit.error).message} onRetry={() => audit.refetch()} />
          ) : audit.data?.items.length ? audit.data.items.map((item) => (
            <button className="table-row table-audit" type="button" key={item.executionId} onClick={() => { setExecutionId(item.executionId); setSubmittedExecutionId(item.executionId); }}>
              <span>{new Date(item.createdAt).toLocaleString('ko-KR')}</span>
              <code>{item.executionId}</code>
              <span>{item.workloadId}</span>
              <StatusBadge tone={item.finalAction === 'BLOCK' ? 'danger' : item.finalAction === 'REVIEW' ? 'warning' : 'success'}>{item.finalAction}</StatusBadge>
              <span>{item.status}</span>
            </button>
          )) : <EmptyState title="데이터가 없습니다" description="현재 권한 범위에 저장된 Runtime 실행 이력이 없습니다." endpoint="GET /api/admin/audit/executions" />}
        </div>
      </SectionCard>

      <div className="notice notice-info">
        <LockKeyhole size={17} />
        <p><b>Privacy-safe Audit</b><span>Raw Prompt, 고객·계좌 원문, Token Map은 표시하지 않습니다. Metadata, Digest, Reason Code만 조회합니다.</span></p>
      </div>
    </section>
  );
}
