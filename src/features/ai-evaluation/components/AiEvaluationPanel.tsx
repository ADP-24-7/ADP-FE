import { Search } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { normalizeApiError } from '../../../shared/api/apiError';
import { EmptyState, ErrorState, KeyValues, LoadingPanel, SearchAssistInput, SectionCard, StatusBadge } from '../../../shared/components';
import { useAiEvaluationBundle, useAiEvaluationReadiness } from '../hooks/useAiEvaluationRun';

function readinessTone(status: string) {
  if (status === 'READY') return 'success' as const;
  if (status === 'NOT_STARTED') return 'neutral' as const;
  return 'warning' as const;
}

export function AiEvaluationPanel() {
  const [runId, setRunId] = useState('');
  const [lookupRunId, setLookupRunId] = useState('');
  const readiness = useAiEvaluationReadiness(lookupRunId);
  const bundle = useAiEvaluationBundle(lookupRunId, readiness.data?.bundleAvailable === true);
  const runSuggestions = [
    {
      value: 'ai-eval-baseline-2026-09-07',
      label: '3-model baseline',
      description: 'BE local fixture에 등록된 Evaluation Run 예시',
      source: 'local-example' as const,
    },
  ];

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLookupRunId(runId.trim());
  }

  return (
    <SectionCard
      className="search-assist-card"
      title="AI Evaluation Evidence"
      description="Runtime Evidence의 완결성과 DA 전달 Bundle을 Evaluation Run 단위로 확인합니다."
      actions={readiness.data ? <StatusBadge tone={readinessTone(readiness.data.status)}>{readiness.data.status}</StatusBadge> : undefined}
    >
      <form className="search-row" onSubmit={submit}>
        <label className="field field-grow">
          <span>Evaluation Run ID</span>
          <SearchAssistInput value={runId} onChange={setRunId} suggestions={runSuggestions} placeholder="ai-eval 또는 baseline 입력" ariaLabel="Evaluation Run ID" required />
        </label>
        <button className="button button-primary" type="submit"><Search size={15} />조회</button>
      </form>

      {readiness.isLoading ? <LoadingPanel label="Evaluation Readiness를 확인하는 중입니다" /> : readiness.isError ? (
        <ErrorState description={normalizeApiError(readiness.error).message} onRetry={() => readiness.refetch()} />
      ) : readiness.data ? (
        <div className="result-stack">
          <KeyValues items={[
            ['Evaluation Run', `${readiness.data.evaluationRunId} · ${readiness.data.evaluationRunVersion}`],
            ['Readiness', readiness.data.status],
            ['Expected / Observed', `${readiness.data.expectedExecutionCount} / ${readiness.data.observedExecutionCount}`],
            ['Complete Evidence', String(readiness.data.completeEvidenceCount)],
            ['Missing / Unexpected', `${readiness.data.missingExecutionCount} / ${readiness.data.unexpectedExecutionCount}`],
            ['Bundle', readiness.data.bundleAvailable ? 'AVAILABLE' : 'NOT AVAILABLE'],
          ]} />
          <div className="contract-table" role="table" aria-label="AI evaluation case model evidence">
            <div className="table-head table-readiness" role="row">
              <span>Case / Model</span><span>Runtime</span><span>Provider</span><span>Evidence</span>
            </div>
            {readiness.data.caseModels.map((item) => (
              <div className="table-row table-readiness" role="row" key={`${item.evalCaseId}:${item.profileId}`}>
                <span><strong>{item.evalCaseId}</strong><small>{item.profileId}</small></span>
                <span>{item.runtimeStatus ?? 'NOT OBSERVED'}</span>
                <span>{item.providerStatus ?? 'NOT OBSERVED'}</span>
                <span>{item.evidenceStatus ?? 'INCOMPLETE'}</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <EmptyState compact title="Evaluation Run 입력 대기" description="현재 BE에 등록된 정확한 Run ID로 Readiness를 조회합니다." endpoint="GET /api/admin/ai/evaluation-runs/{evaluationRunId}/readiness" />
      )}

      {bundle.isLoading ? <LoadingPanel label="DA 전달 Bundle을 검증하는 중입니다" /> : bundle.isError ? (
        <ErrorState title="Evaluation Bundle을 불러오지 못했습니다" description={normalizeApiError(bundle.error).message} onRetry={() => bundle.refetch()} />
      ) : bundle.data ? (
        <KeyValues items={[
          ['Bundle', `${bundle.data.manifest.bundleId} · ${bundle.data.manifest.bundleVersion}`],
          ['Schema', bundle.data.manifest.schemaVersion],
          ['Content Digest', bundle.data.manifest.contentDigest],
          ['Executions / Cases / Models', `${bundle.data.manifest.executionCount} / ${bundle.data.manifest.caseCount} / ${bundle.data.manifest.modelCount}`],
          ['Dataset', `${bundle.data.executionConfig.datasetId} · ${bundle.data.executionConfig.datasetVersion}`],
          ['Failures / Sent Unknown', `${bundle.data.failureSummary.failed} / ${bundle.data.failureSummary.sentUnknown}`],
        ]} />
      ) : null}
    </SectionCard>
  );
}
