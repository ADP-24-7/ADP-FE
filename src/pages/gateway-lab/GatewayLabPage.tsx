import { useMutation } from '@tanstack/react-query';
import { Play, RotateCcw, TerminalSquare } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { createRuntimeExecution, getRuntimeExecutionTrace, runtimeExecutionCapabilities } from '../../features/runtime-execution';
import type { RuntimeExecutionRequest, RuntimeExecutionStatus } from '../../features/runtime-execution';
import { BulletList, EmptyState, ErrorState, KeyValues, PackContextSummary, PageHeader, SectionCard, StatusBadge } from '../../shared/components';
import { useExecutionPack } from '../../shared/prototype';

const actionTone = {
  ALLOW: 'success',
  TRANSFORM: 'info',
  REVIEW: 'warning',
  BLOCK: 'danger',
} as const;

const targetPipeline = [
  ['01', 'Request & Authorization', '인증 주체, Workload, 목적, 동의 범위를 확인'],
  ['02', 'Data Access & Context', '허용된 Dataset, Field, Subject, 기간, 행 수만 조회'],
  ['03', 'Input Detection & Decision', '민감정보 탐지와 정책 판정, Human Review 분기'],
  ['04', 'Transform & Outbound Guard', '토큰화 후 외부 전송 Payload를 최종 검사'],
  ['05', 'Provider & Response Guard', 'LLM 응답의 재식별, 유출, 정책 위반을 재검증'],
  ['06', 'Controlled Delivery & Audit', '안전한 결과만 전달하고 전 단계 근거를 기록'],
] as const;

const checkpointDetails = [
  {
    number: '01',
    items: [
      ['Input', 'principal, workloadId, purposeCode, consentRef'],
      ['검증 항목', '인증, 권한, 목적 제한, 동의 범위'],
      ['Output', 'authorizationResult'],
      ['연결 API', 'POST /v1/runtime/executions'],
    ],
  },
  {
    number: '02',
    items: [
      ['Input', 'workloadId, subjectScope, processingContexts'],
      ['검증 항목', 'Dataset, Field Allowlist, Time Window, Row Limit'],
      ['Output', 'canonicalContextDigest'],
      ['연결 API', 'GET /v1/runtime/executions/{executionId}/trace'],
    ],
  },
  {
    number: '03',
    items: [
      ['Input', 'inputDigest, runtimeContextDigest, policy snapshot'],
      ['검증 항목', 'applicabilityResult, policyAction, finalAction'],
      ['Output', 'decisionId, reason codes'],
      ['연결 API', 'POST /v1/runtime/executions'],
    ],
  },
  {
    number: '04',
    items: [
      ['Input', 'policyAction, transform profile'],
      ['검증 항목', 'Tokenization, raw-value residual, provider allowlist'],
      ['Output', 'outboundPayload, egressDecision'],
      ['연결 API', 'POST /v1/runtime/executions · GET /v1/runtime/executions/{executionId}/trace'],
    ],
  },
  {
    number: '05',
    items: [
      ['Input', 'providerResponse, response policy'],
      ['검증 항목', '재식별, 민감정보 회귀, 금칙 응답, citation'],
      ['Output', 'responseDecision, guardedResponse'],
      ['연결 API', 'POST /v1/runtime/executions · GET /v1/runtime/executions/{executionId}/trace'],
    ],
  },
  {
    number: '06',
    items: [
      ['Input', 'guardedResponse, decision evidence'],
      ['검증 항목', 'Delivery 조건, Idempotency, Audit 완전성'],
      ['Output', 'auditId, traceId'],
      ['연결 API', 'GET /v1/audit-events'],
    ],
  },
] as const;

const statusTone: Record<RuntimeExecutionStatus, 'success' | 'warning' | 'danger' | 'info' | 'neutral'> = {
  RECEIVED: 'info',
  AUTHORIZED: 'info',
  RETRIEVED: 'info',
  DECIDED: 'info',
  TRANSFORMED: 'info',
  EGRESSING: 'warning',
  REVIEW_REQUIRED: 'warning',
  COMPLETED: 'success',
  DENIED: 'danger',
  BLOCKED: 'danger',
  FAILED: 'danger',
};

function createIdempotencyKey() {
  return crypto.randomUUID();
}

export function GatewayLabPage() {
  const { selectedPack } = useExecutionPack();
  const [workloadId, setWorkloadId] = useState('');
  const [purposeCode, setPurposeCode] = useState('');
  const [subjectScope, setSubjectScope] = useState('');
  const [destinationProfileId, setDestinationProfileId] = useState('');
  const [processingContextsText, setProcessingContextsText] = useState('AI_USE');
  const [content, setContent] = useState('');
  const [idempotencyKey, setIdempotencyKey] = useState(createIdempotencyKey);
  const [selectedCheckpoint, setSelectedCheckpoint] = useState('01');

  const checkpoint = checkpointDetails.find((item) => item.number === selectedCheckpoint) ?? checkpointDetails[0];
  const canExecute = runtimeExecutionCapabilities.canExecute;

  const execution = useMutation({
    mutationFn: async (request: RuntimeExecutionRequest) => {
      const created = await createRuntimeExecution(request);
      const trace = await getRuntimeExecutionTrace(created.executionId);
      return { created, trace };
    },
  });

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canExecute) {
      return;
    }

    const request: RuntimeExecutionRequest = {
      workloadId,
      purposeCode,
      subjectScope,
      destinationProfileId,
      input: { content },
      idempotencyKey,
      processingContexts: processingContextsText.split(',').map((value) => value.trim()).filter(Boolean),
    };
    execution.mutate(request);
  }

  function markLogicalRequestChanged(update: () => void) {
    update();
    setIdempotencyKey(createIdempotencyKey());
  }

  return (
    <section className="page-section">
      <PageHeader
        eyebrow="END-TO-END CONTRACT LAB"
        title="탐지 및 런타임 결정 검증"
        description={`${selectedPack.label} 기준으로 최종 Gateway 흐름과 현재 BE에서 관측 가능한 Runtime Stage를 분리해 확인합니다.`}
        actions={<StatusBadge tone="warning">AUTH REQUIRED</StatusBadge>}
      />

      <PackContextSummary label={selectedPack.label} scope={selectedPack.scope} descriptor={selectedPack.descriptor} objective={selectedPack.objective} />

      <div className="notice notice-security">
        브라우저에는 `X-ADP-API-Key`를 주입하지 않습니다. Admin 인증 또는 Local BFF가 붙기 전까지 실제 Execute는 비활성화합니다.
      </div>

      <div className="lab-grid">
        <SectionCard title="Gateway 요청 구성" description="실제 API 계약에 필요한 최소 식별자만 입력합니다." className="sticky-card">
          <form className="form-grid" onSubmit={submit}>
            <div className="pack-inline-summary field-full">
              <span>{selectedPack.implementation}</span>
              <strong>{selectedPack.scope}</strong>
              <p>{selectedPack.executionSurfaces.join(' · ')}</p>
            </div>
            <label className="field">
              <span>Workload ID</span>
              <input value={workloadId} onChange={(event) => markLogicalRequestChanged(() => setWorkloadId(event.target.value))} placeholder="BE에 등록된 workload ID" required />
            </label>
            <label className="field">
              <span>Purpose Code</span>
              <input value={purposeCode} onChange={(event) => markLogicalRequestChanged(() => setPurposeCode(event.target.value))} placeholder="승인된 purpose code" required />
            </label>
            <label className="field">
              <span>Subject Scope</span>
              <input value={subjectScope} onChange={(event) => markLogicalRequestChanged(() => setSubjectScope(event.target.value))} placeholder="마스킹된 subject scope" required />
            </label>
            <label className="field">
              <span>Destination Profile ID</span>
              <input value={destinationProfileId} onChange={(event) => markLogicalRequestChanged(() => setDestinationProfileId(event.target.value))} placeholder="BE에 등록된 destination profile" required />
            </label>
            <label className="field field-full">
              <span>Processing Contexts</span>
              <input value={processingContextsText} onChange={(event) => markLogicalRequestChanged(() => setProcessingContextsText(event.target.value))} placeholder="AI_USE" required />
            </label>
            <label className="field field-full">
              <span>사용자 질문</span>
              <textarea value={content} onChange={(event) => markLogicalRequestChanged(() => setContent(event.target.value))} placeholder="민감한 실제 고객정보 대신 테스트용 입력을 사용하세요." rows={8} required />
            </label>
            <div className="input-meta field-full">
              <span>{content.length} chars</span>
              <span>Raw Prompt · Token Map 저장 금지</span>
            </div>
            <div className="idempotency-panel field-full">
              <div>
                <span>Idempotency Key</span>
                <code>{idempotencyKey}</code>
              </div>
              <button className="button button-secondary" type="button" onClick={() => setIdempotencyKey(createIdempotencyKey())}>
                <RotateCcw size={14} />
                새 실행 키
              </button>
            </div>
            <button className="button button-primary" type="submit" disabled={!canExecute || execution.isPending} title="Auth Integration 또는 Local BFF 연결 후 활성화">
              <Play size={16} fill="currentColor" />
              {execution.isPending ? '실행 중...' : 'Auth 연결 후 실행'}
            </button>
          </form>
        </SectionCard>

        <div className="result-stack">
          <SectionCard title="Target Pipeline" description="최종 아키텍처가 목표로 하는 Gateway 처리 단계" actions={<StatusBadge tone="purple">TARGET</StatusBadge>}>
            <div className="checkpoint-list">
              {targetPipeline.map(([number, title, description]) => (
                <button
                  key={number}
                  type="button"
                  className={number === selectedCheckpoint ? 'active' : ''}
                  onClick={() => setSelectedCheckpoint(number)}
                >
                  <span>{number}</span>
                  <p><b>{title}</b><small>{description}</small></p>
                  <StatusBadge>설계</StatusBadge>
                </button>
              ))}
            </div>
          </SectionCard>

          <SectionCard title="Observed Runtime Stages" description="BE가 `/trace`에서 반환한 단계만 실제 관측 결과로 표시합니다." actions={<StatusBadge tone={execution.data ? 'success' : execution.isPending ? 'warning' : 'neutral'}>{execution.data ? 'TRACE' : execution.isPending ? 'RUNNING' : 'NOT STARTED'}</StatusBadge>}>
            {execution.data ? (
              <ol className="trace-list">
                {execution.data.trace.stages.map((stage, index) => (
                  <li key={`${stage.stage}-${index}`}>
                    <span className="trace-index">{index + 1}</span>
                    <div>
                      <strong>{stage.stage}</strong>
                      <StatusBadge tone={statusTone[stage.status]}>{stage.status}</StatusBadge>
                    </div>
                  </li>
                ))}
              </ol>
            ) : (
              <EmptyState compact title="Auth Integration 필요" description="현재 브라우저 FE는 Runtime Executor credential을 보유하지 않습니다." endpoint="GET /v1/runtime/executions/{executionId}/trace" />
            )}
          </SectionCard>

          <SectionCard title="Checkpoint Detail" description="선택한 단계의 입력, 검증, 출력, 연결 API">
            <KeyValues items={checkpoint.items} />
            <p className="helper-text">POST 응답의 executionId를 받은 뒤 `/trace`를 조회해 관측 단계를 표시합니다.</p>
          </SectionCard>

          <SectionCard title={`${selectedPack.label} Runtime Focus`} description="선택된 실행 축에서 특히 확인해야 하는 Runtime 경계">
            <KeyValues items={selectedPack.runtimeFocus} />
            <BulletList items={selectedPack.executionSurfaces} />
          </SectionCard>

          <SectionCard title="실행 결과" description="BE의 policyAction, finalAction, digest, audit id만 표시합니다.">
          {execution.isError ? (
            <ErrorState description="Runtime Execution API 호출에 실패했습니다. 401/403/409/404 응답과 요청 계약을 확인해 주세요." />
          ) : execution.data ? (
            <div className="result-stack">
              <div className="result-summary">
                <div>
                  <span>Policy Action</span>
                  <StatusBadge tone={actionTone[execution.data.created.policyAction]}>{execution.data.created.policyAction}</StatusBadge>
                </div>
                <div>
                  <span>Final Action</span>
                  <StatusBadge tone={actionTone[execution.data.created.finalAction]}>{execution.data.created.finalAction}</StatusBadge>
                </div>
                <div><span>실행 상태</span><strong>{execution.data.created.status}</strong></div>
              </div>

              <KeyValues
                items={[
                  ['Execution ID', execution.data.created.executionId],
                  ['Decision ID', execution.data.created.decisionId],
                  ['Trace ID', execution.data.trace.traceId],
                  ['Runtime Context Digest', execution.data.created.runtimeContextDigest],
                  ['Policy Version', execution.data.created.policyVersion ?? '—'],
                  ['Connector Status', execution.data.created.connectorStatus ?? '—'],
                  ['Audit ID', execution.data.created.auditId ?? '—'],
                  ['Snapshot Digest', execution.data.created.snapshotDigest ?? '—'],
                ]}
              />
            </div>
          ) : (
            <EmptyState
              icon={TerminalSquare}
              title="Auth Integration 전 실행 비활성"
              description="API Key를 브라우저 환경변수로 노출하지 않습니다. Admin 인증 또는 Local BFF에서 서버 측 credential을 붙인 뒤 실행을 활성화합니다."
              endpoint="POST /v1/runtime/executions"
            />
          )}
          </SectionCard>
        </div>
      </div>
    </section>
  );
}
