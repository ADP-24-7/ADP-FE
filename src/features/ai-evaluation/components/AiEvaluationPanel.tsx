import { Activity, FileCheck2, FilterX, Search, ShieldCheck } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { normalizeApiError } from '../../../shared/api/apiError';
import { EmptyState, ErrorState, KeyValues, LoadingPanel, MetricCard, SearchAssistInput, SectionCard, StatusBadge } from '../../../shared/components';
import type { RuntimeExecutionTrace } from '../../runtime-execution/model/types';
import { useAiCalibrationEvidence, useAiEvaluationBundle, useAiEvaluationReadiness, useAiExecutionTraces, useAiTransformGovernanceProfile } from '../hooks/useAiEvaluationRun';

const CURRENT_RUN_ID = 'ai-experiment-02-financial-regulatory-v5';

const reasonLabels: Record<string, string> = {
  RESPONSE_SENSITIVE_DATA_DETECTED: '응답에서 민감 데이터가 탐지됨',
  RAW_VALUE_REFLECTION: 'Provider 입력값이 응답에 그대로 반영됨',
  SUBJECT_SCOPE_MISMATCH: '승인된 고객 범위와 실행 대상이 다름',
  AI_FIXED_CONDITIONS_MISMATCH: 'Frozen Contract 조건과 실행 조건이 다름',
};

function statusTone(status?: string | null) {
  if (!status) return 'neutral' as const;
  if (['BLOCKED', 'DENIED', 'FAILED', 'REJECTED', 'WITHHELD', 'MISMATCH'].includes(status)) return 'danger' as const;
  if (['REVIEW', 'REVIEW_REQUIRED', 'SENT_UNKNOWN', 'INCOMPLETE'].includes(status)) return 'warning' as const;
  if (['PASSED', 'PASS', 'COMPLETED', 'DELIVERED', 'MATCH', 'APPLIED', 'VALIDATED'].includes(status)) return 'success' as const;
  return 'neutral' as const;
}

function stageStatus(trace: RuntimeExecutionTrace, stage: string) {
  return trace.stages.find((item) => item.stage === stage)?.status;
}

function contractStatus(trace: RuntimeExecutionTrace) {
  const model = trace.evidence.aiModel;
  return model?.evaluationContractDigest && model.expectedInputDigest === model.actualInputDigest ? 'MATCH' : 'MISMATCH';
}

function policyStatus(trace: RuntimeExecutionTrace) {
  return trace.policyDecision ?? 'NOT_REACHED';
}

function operationalReasons(trace: RuntimeExecutionTrace) {
  return [...new Set([
    ...(trace.evidence.approvalReasonCodes ?? []),
    ...(trace.evidence.responseGuardReasonCodes ?? []),
    ...(trace.evidence.responseFindingTypes ?? []),
    ...(trace.policyReasonCodes ?? []),
  ])];
}

function metricMillis(value?: number | null) {
  return value == null ? 'NOT_AVAILABLE' : `${value.toLocaleString()} ms`;
}

function wallClockMillis(trace: RuntimeExecutionTrace) {
  const elapsed = new Date(trace.updatedAt).getTime() - new Date(trace.createdAt).getTime();
  return Number.isFinite(elapsed) && elapsed >= 0 ? elapsed : null;
}

function stageMillis(trace: RuntimeExecutionTrace, stage: string) {
  return trace.stageTimings.find((timing) => timing.stage === stage)?.durationMillis ?? null;
}

function fpgStageMillis(trace: RuntimeExecutionTrace) {
  const completed = trace.stageTimings.filter((timing) => timing.stage !== 'PROVIDER');
  return completed.length ? completed.reduce((total, timing) => total + timing.durationMillis, 0) : null;
}

export function AiEvaluationPanel() {
  const [runId, setRunId] = useState(CURRENT_RUN_ID);
  const [lookupRunId, setLookupRunId] = useState(CURRENT_RUN_ID);
  const [selectedExecutionId, setSelectedExecutionId] = useState('');
  const readiness = useAiEvaluationReadiness(lookupRunId);
  const governance = useAiTransformGovernanceProfile(lookupRunId);
  const bundle = useAiEvaluationBundle(lookupRunId, readiness.data?.bundleAvailable === true);
  const calibration = useAiCalibrationEvidence(lookupRunId, readiness.data?.bundleAvailable === true);
  const executionIds = bundle.data?.caseResults.map((item) => item.executionId) ?? [];
  const traceQueries = useAiExecutionTraces(executionIds);
  const traces = traceQueries.flatMap((query) => query.data ? [query.data] : []);
  const tracesLoading = traceQueries.some((query) => query.isLoading);
  const tracesFailed = traceQueries.some((query) => query.isError);
  const selectedTrace = traces.find((trace) => trace.executionId === selectedExecutionId) ?? traces[0];
  const providerExecutions = traces.filter((trace) => trace.evidence.aiModel?.providerHttpStatus != null).length;
  const heldExecutions = traces.filter((trace) => ['BLOCKED', 'REVIEW_REQUIRED'].includes(trace.status) || trace.evidence.controlledDeliveryStatus === 'WITHHELD').length;
  const transformedExecutions = traces.filter((trace) => stageStatus(trace, 'TRANSFORM') === 'COMPLETED').length;
  const matchingContracts = traces.filter((trace) => {
    const decision = policyStatus(trace);
    return contractStatus(trace) === 'MATCH' && (decision === 'ALLOW' || decision === 'TRANSFORM');
  }).length;
  const loading = readiness.isLoading || governance.isLoading || bundle.isLoading || calibration.isLoading || tracesLoading;
  const failed = readiness.isError || governance.isError || bundle.isError || calibration.isError || tracesFailed;
  const state = loading ? 'loading' as const : failed ? 'error' as const : 'value' as const;

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSelectedExecutionId('');
    setLookupRunId(runId.trim());
  }

  return (
    <div className="ai-admin-stack">
      <SectionCard className="search-assist-card" title="AI 실행 모니터링" description="Evaluation Run에 바인딩된 외부 실행과 통제 결과를 조회합니다." actions={readiness.data ? <StatusBadge tone={readiness.data.status === 'READY' ? 'success' : 'warning'}>{readiness.data.status}</StatusBadge> : undefined}>
        <form className="search-row" onSubmit={submit}>
          <label className="field field-grow">
            <span>Evaluation Run ID</span>
            <SearchAssistInput value={runId} onChange={setRunId} suggestions={[
              { value: CURRENT_RUN_ID, label: 'E2 regulatory runtime', description: 'Provider governance blocked · 실행 Evidence 조회', source: 'api' },
              { value: 'ai-eval-baseline-2026-09-07', label: 'Legacy baseline', description: '기존 local fixture', source: 'local-example' },
            ]} placeholder="Evaluation Run ID" ariaLabel="Evaluation Run ID" required />
          </label>
          <button className="button button-primary" type="submit"><Search size={15} />조회</button>
        </form>
      </SectionCard>

      <div className="metric-grid">
        <MetricCard label="External Executions" value={providerExecutions} description="Provider 응답을 받은 실행" state={state} icon={Activity} tone="blue" />
        <MetricCard label="Block / Review / Withheld" value={heldExecutions} description="관리자 확인이 필요한 실행" state={state} icon={FilterX} tone="red" />
        <MetricCard label="Transform Applied" value={transformedExecutions} description="Transform 단계가 적용된 실행" state={state} icon={ShieldCheck} tone="green" />
        <MetricCard label="Policy / Contract Match" value={`${matchingContracts} / ${readiness.data?.expectedExecutionCount ?? 0}`} description="Frozen input과 정책 Evidence 일치" state={state} icon={FileCheck2} tone="neutral" />
      </div>

      {failed ? <ErrorState title="AI Runtime Evidence를 불러오지 못했습니다" description={normalizeApiError(readiness.error ?? governance.error ?? bundle.error ?? calibration.error ?? traceQueries.find((query) => query.error)?.error).message} onRetry={() => { readiness.refetch(); governance.refetch(); bundle.refetch(); calibration.refetch(); traceQueries.forEach((query) => query.refetch()); }} /> : null}

      {governance.data ? <>
        <SectionCard title="Workload / Regulatory Control Context" description="실행 기능이 아닌 관리자용 frozen E2 Requirement Context입니다." actions={<StatusBadge tone="warning">{governance.data.e2ValidationStatus}</StatusBadge>}>
          <div className="content-grid content-grid-two ai-evidence-grid">
            <KeyValues items={[
              ['Workload', `${governance.data.workloadName} (${governance.data.workloadId})`],
              ['Business domain', governance.data.businessDomain],
              ['Purpose', `${governance.data.purposeDescription} (${governance.data.purposeCode})`],
              ['Subject scope', governance.data.subjectScope],
              ['Action', governance.data.actionType],
              ['Requester role', governance.data.requesterRole],
            ]} />
            <KeyValues items={[
              ['E2 handoff', governance.data.e2HandoffDigest],
              ['Requirement version', governance.data.requirementVersion],
              ['E3 profile', `${governance.data.e3ProfileVersion} / ${governance.data.e3ProfileDigest}`],
              ['E3 validation', governance.data.e3ValidationStatus],
              ['Activation', governance.data.activationStatus],
              ['Provider governance', governance.data.providerGovernanceStatus],
              ['External execution', governance.data.externalExecutionStatus],
              ['Provider authorized', governance.data.providerCallAuthorized ? 'YES' : 'NO'],
              ['Requirement enforcement gaps', String(governance.data.requirementEnforcementGaps.length)],
            ]} />
          </div>
        </SectionCard>

        <SectionCard title="Provider Governance / External Execution" description="BE가 동결 계약으로 판정한 Provider·Model·Region·Retention·Reuse 결과입니다." actions={<StatusBadge tone={statusTone(governance.data.providerGovernance.governanceDecision)}>{governance.data.providerGovernance.governanceDecision}</StatusBadge>}>
          <div className="content-grid content-grid-two ai-evidence-grid">
            <KeyValues items={[
              ['Provider', governance.data.providerGovernance.providerConnectionProfileId],
              ['Models', governance.data.providerGovernance.modelProfileIds.join(', ')],
              ['Region', `${governance.data.providerGovernance.requestedRegion} → ${governance.data.providerGovernance.resolvedRegion}`],
              ['Region decision', `${governance.data.providerGovernance.regionDecision} / ${governance.data.providerGovernance.regionReasonCode ?? 'NONE'}`],
              ['Retention', `${governance.data.providerGovernance.approvedRetentionMode} / ${governance.data.providerGovernance.providerConfiguredRetentionMode}`],
              ['Retention decision', `${governance.data.providerGovernance.retentionDecision} / ${governance.data.providerGovernance.retentionReasonCode ?? 'NONE'}`],
            ]} />
            <KeyValues items={[
              ['Reuse', governance.data.providerGovernance.providerReusePurposes.join(', ')],
              ['Reuse decision', `${governance.data.providerGovernance.reuseDecision} / ${governance.data.providerGovernance.reuseReasonCode ?? 'NONE'}`],
              ['Policy version', governance.data.providerGovernance.contractVersion],
              ['Digest', governance.data.providerGovernance.contractDigest],
              ['Activation', governance.data.providerGovernance.activationStatus],
              ['Reasons', governance.data.providerGovernance.reasonCodes.join(', ') || 'NONE'],
            ]} />
          </div>
        </SectionCard>

        <SectionCard title="E2 / E3 Field Control" description="E2 Requirement와 E3의 독립 gate 결과, 현재 Runtime 활성화 차이를 표시합니다." actions={<StatusBadge tone="neutral">{governance.data.fieldControls.length} FIELDS</StatusBadge>}>
          <div className="ai-execution-table-shell">
            <div className="table-head table-ai-field-controls">
              <span>Field / Classification</span><span>Requirement / Intent</span><span>Runtime → Validated</span><span>E3 Validation</span><span>Rejected</span><span>Applicability</span><span>Evidence</span><span>Release</span>
            </div>
            {governance.data.fieldControls.map((field) => <div className="table-row table-ai-field-controls" key={field.fieldName}>
              <span><strong>{field.fieldName}</strong><small>{field.classification}</small><small>{field.businessNeed}</small></span>
              <span><strong>{field.fieldRequirement}</strong><small>{field.transformIntents.join(' + ')}</small></span>
              <span><strong>{field.currentRuntimeMethod} → {field.validatedMethod}</strong><StatusBadge tone={field.currentRuntimeRequirementMatch ? 'success' : 'warning'}>{field.currentRuntimeRequirementMatch ? 'MATCH' : 'NOT ACTIVATED'}</StatusBadge></span>
              <span><strong>P {field.privacyResult} / U {field.utilityResult}</strong><small>R {field.relationResult} / E {field.exactResult}</small><small>{field.runtimeCompatibility}</small></span>
              <span>{field.prohibitedTransformMethods.join(', ') || 'NONE'}</span>
              <StatusBadge tone={statusTone(field.applicability)}>{field.applicability}</StatusBadge>
              <span title={field.destinationCompatibility}>{field.methodEvidenceIds.join(', ')}</span>
              <span><StatusBadge tone={field.externalReleaseAllowed ? 'warning' : 'neutral'}>{field.externalReleaseAllowed ? 'CONDITIONAL' : 'NO'}</StatusBadge><small title={field.evidenceRef}>{field.evidenceRef}</small></span>
            </div>)}
          </div>
        </SectionCard>

        {governance.data.requirementEnforcementGaps.length ? <SectionCard title="Requirement Enforcement Gap" description="E2 Requirement와 현재 Runtime method가 일치하지 않아 후속 구현에서 해소해야 하는 항목입니다.">
          <ul className="reason-code-list">{governance.data.requirementEnforcementGaps.map((gap) => <li key={gap.fieldName}>
            <code>{gap.fieldName}</code><span>{gap.currentRuntimeMethod} → {gap.requiredTransformMethod}: {gap.reason}. {gap.requiredAction}</span>
          </li>)}</ul>
        </SectionCard> : null}
      </> : null}

      <SectionCard title="실행 목록" description="Provider 호출 상태와 Controlled Delivery 결과를 별도 열로 확인합니다." actions={<StatusBadge tone="neutral">{traces.length} EXECUTIONS</StatusBadge>}>
        <div className="ai-execution-table-shell">
          <div className="table-head table-ai-executions">
            <span>Model</span><span>Workload / Purpose</span><span>Runtime</span><span>Transform</span><span>Outbound</span><span>Provider</span><span>Response Guard</span><span>Delivery</span><span>Timestamp</span>
          </div>
          {tracesLoading ? <LoadingPanel label="실행 Trace를 불러오는 중입니다" /> : traces.length ? traces.map((trace) => {
            const model = trace.evidence.aiModel;
            const providerLabel = model?.providerHttpStatus != null ? `HTTP ${model.providerHttpStatus}` : model?.providerStatus ?? 'NOT_REACHED';
            return <button className={`table-row table-ai-executions ${selectedTrace?.executionId === trace.executionId ? 'active' : ''}`} type="button" key={trace.executionId} onClick={() => setSelectedExecutionId(trace.executionId)}>
              <span><strong>{model?.providerModelId ?? model?.profileId ?? 'UNKNOWN'}</strong><small>{trace.executionId}</small></span>
              <span><strong>{trace.workloadId}</strong><small>{trace.purposeCode}</small></span>
              <StatusBadge tone={statusTone(trace.status)}>{trace.status}</StatusBadge>
              <StatusBadge tone={statusTone(stageStatus(trace, 'TRANSFORM'))}>{stageStatus(trace, 'TRANSFORM') === 'COMPLETED' ? 'APPLIED' : 'NOT_APPLIED'}</StatusBadge>
              <StatusBadge tone={statusTone(stageStatus(trace, 'OUTBOUND_GUARD'))}>{stageStatus(trace, 'OUTBOUND_GUARD') === 'COMPLETED' ? 'PASS' : stageStatus(trace, 'OUTBOUND_GUARD') ?? 'NOT_REACHED'}</StatusBadge>
              <StatusBadge tone="info">{providerLabel}</StatusBadge>
              <StatusBadge tone={statusTone(trace.evidence.responseGuardStatus)}>{trace.evidence.responseGuardStatus ?? 'NOT_REACHED'}</StatusBadge>
              <StatusBadge tone={statusTone(trace.evidence.controlledDeliveryStatus)}>{trace.evidence.controlledDeliveryStatus ?? 'NOT_REACHED'}</StatusBadge>
              <span>{new Date(trace.createdAt).toLocaleString('ko-KR')}</span>
            </button>;
          }) : <EmptyState compact title="실행 Evidence 없음" description="선택한 Run에서 관측된 실행이 없습니다." />}
        </div>
      </SectionCard>

      <SectionCard title="Response Finding Calibration" description="BE calibration-evidence의 privacy-safe finding group만 표시합니다.">
        {calibration.data ? <div className="content-grid content-grid-two ai-evidence-grid">
          <KeyValues items={[
            ['Calibration ready', calibration.data.calibrationReady ? 'YES' : 'NO'],
            ['Execution count', String(calibration.data.manifest.executionCount)],
            ['Content digest', calibration.data.manifest.contentDigest],
            ['Readiness reason', calibration.data.readinessReasonCodes.join(', ') || 'NONE'],
          ]} />
          <KeyValues items={calibration.data.executions.flatMap((execution) =>
            execution.findingGroups.map((finding) => [
              `${execution.evalCaseId} / ${execution.modelProfileId}`,
              `${finding.findingType} · ${finding.sourceDataClass ?? 'UNBOUND'} · ${finding.transformStrategy ?? 'UNBOUND'} · ${finding.fieldTreatment ?? 'UNBOUND'} × ${finding.count}`,
            ] as [string, string]))} />
        </div> : <EmptyState compact title="NOT_EXECUTED" description="완전한 3×3 Bundle이 없어 latency, token, response finding을 조회하지 않습니다." />}
      </SectionCard>

      {selectedTrace ? <ExecutionTracePanel trace={selectedTrace} /> : null}
    </div>
  );
}

function ExecutionTracePanel({ trace }: { trace: RuntimeExecutionTrace }) {
  const model = trace.evidence.aiModel;
  const reasons = operationalReasons(trace);
  const steps = [
    ['Contract', contractStatus(trace), model?.evaluationContractDigest],
    ['Authorization', trace.authorizationDecision, trace.authorizationReason],
    ['Policy', policyStatus(trace), trace.policyVersion],
    ['Transform', stageStatus(trace, 'TRANSFORM') === 'COMPLETED' ? 'PASS' : 'NOT_REACHED', trace.evidence.transformed.digest],
    ['Outbound Guard', stageStatus(trace, 'OUTBOUND_GUARD') === 'COMPLETED' ? 'PASS' : stageStatus(trace, 'OUTBOUND_GUARD') ?? 'NOT_REACHED', trace.evidence.released.digest],
    ['Provider', model?.providerHttpStatus != null ? `HTTP ${model.providerHttpStatus}` : model?.providerStatus ?? 'NOT_REACHED', trace.evidence.providerResponseDigest],
    ['Response Guard', trace.evidence.responseGuardStatus === 'PASSED' ? 'PASS' : trace.evidence.responseGuardStatus ?? 'NOT_REACHED', undefined],
    ['Delivery', trace.evidence.controlledDeliveryStatus ?? 'NOT_REACHED', trace.evidence.controlledDeliveryResponseDigest],
  ] as const;

  return <SectionCard title="Execution Trace" description={trace.executionId} actions={<StatusBadge tone={statusTone(trace.status)}>{trace.status}</StatusBadge>}>
    <div className="ai-trace-flow">
      {steps.map(([label, status, digest], index) => <article key={label} className={`ai-trace-step ai-trace-${statusTone(status)}`}>
        <span>{String(index + 1).padStart(2, '0')}</span><strong>{label}</strong>
        <StatusBadge tone={label === 'Provider' && status.startsWith('HTTP') ? 'info' : statusTone(status)}>{status}</StatusBadge>
        <code title={digest ?? undefined}>{digest ? `${digest.slice(0, 18)}…` : 'NO DIGEST'}</code>
      </article>)}
    </div>
    <div className="content-grid content-grid-two ai-evidence-grid">
      <div><h3>차단 원인</h3>{reasons.length ? <ul className="reason-code-list">{reasons.map((reason) => <li key={reason}><code>{reason}</code><span>{reasonLabels[reason] ?? 'Runtime 통제 조건을 확인해야 합니다.'}</span></li>)}</ul> : <p className="helper-text">기록된 차단 원인이 없습니다.</p>}</div>
      <div><h3>운영 Evidence</h3><KeyValues items={[
        ['Authorization reason', trace.authorizationReason],
        ['Policy reason', trace.policyReasonCodes.join(', ') || 'NONE'],
        ['Final action', trace.finalAction ?? 'NOT_REACHED'],
        ['Model', model?.providerModelId ?? 'NOT_AVAILABLE'],
        ['Provider status', model?.providerStatus ?? 'NOT_AVAILABLE'],
        ['HTTP status', model?.providerHttpStatus == null ? 'NOT_AVAILABLE' : String(model.providerHttpStatus)],
        ['Provider latency', metricMillis(model?.fullResponseLatencyMillis)],
        ['Provider attempt elapsed', metricMillis(model?.attemptElapsedMillis)],
        ['Response Guard latency', metricMillis(stageMillis(trace, 'RESPONSE_GUARD'))],
        ['FPG stage latency', metricMillis(fpgStageMillis(trace))],
        ['Total execution latency', metricMillis(wallClockMillis(trace))],
        ['Input tokens', model?.inputTokens == null ? 'NOT_AVAILABLE' : String(model.inputTokens)],
        ['Output tokens', model?.outputTokens == null ? 'NOT_AVAILABLE' : String(model.outputTokens)],
        ['Total tokens', model?.totalTokens == null ? 'NOT_AVAILABLE' : String(model.totalTokens)],
        ['Response findings', trace.evidence.responseFindingTypes?.join(', ') || 'NOT_AVAILABLE'],
        ['Provider error', model?.errorCategory && model.errorCategory !== 'NONE' ? model.errorCategory : 'NONE'],
        ['Dataset', model ? `${model.datasetId} · ${model.datasetVersion}` : 'NOT_AVAILABLE'],
        ['Case', model?.evalCaseId ?? 'NOT_AVAILABLE'],
        ['Stage timing', trace.stageTimings.length
          ? trace.stageTimings.map((timing) => `${timing.stage} ${timing.durationMillis} ms`).join(' / ')
          : 'NOT_AVAILABLE'],
        ['TTFT', 'NOT_AVAILABLE'],
      ]} /></div>
    </div>
  </SectionCard>;
}
