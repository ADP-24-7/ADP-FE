import { useMutation } from '@tanstack/react-query';
import { BriefcaseBusiness, LockKeyhole, Play, RotateCcw, ShieldCheck, TerminalSquare } from 'lucide-react';
import { useEffect, useState, type FormEvent } from 'react';
import { createRuntimeExecution, getRuntimeExecutionTrace, runtimeExecutionCapabilities } from '../../features/runtime-execution';
import type { RuntimeExecutionRequest, RuntimeExecutionStatus } from '../../features/runtime-execution';
import { normalizeApiError } from '../../shared/api/apiError';
import { BulletList, EmptyState, ErrorState, KeyValues, PackContextSummary, PageHeader, SectionCard, StatusBadge } from '../../shared/components';
import { useExecutionPack } from '../../shared/prototype';
import type { ExecutionPack } from '../../shared/prototype';

const actionTone = {
  ALLOW: 'success',
  TRANSFORM: 'info',
  REVIEW: 'warning',
  BLOCK: 'danger',
} as const;

function createTargetPipeline(pack: ExecutionPack) {
  const [primarySurface = 'External Payload', secondarySurface = 'Runtime Context', outboundSurface = 'Provider Request', inboundSurface = 'External Response'] = pack.executionSurfaces;

  return [
    ['01', 'Request & Authorization', `${pack.label} 주체, Workload, 목적, 승인 범위를 확인`],
    ['02', 'Data Access & Context', `${secondarySurface}에 필요한 Dataset, Field, Subject 범위만 조회`],
    ['03', 'Input Detection & Decision', `${primarySurface}의 민감정보 탐지와 정책 판정, Review 분기`],
    ['04', 'Transform & Outbound Guard', `${outboundSurface} 전송 전 Field Treatment와 raw-value residual 검사`],
    ['05', 'Destination & Response Guard', `${inboundSurface}의 재식별, 상태 오염, 정책 위반을 재검증`],
    ['06', 'Controlled Delivery & Audit', '안전한 결과만 전달하고 전 단계 Evidence를 하나의 Trace로 기록'],
  ] as const;
}

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
      ['연결 API', 'GET /api/admin/audit/executions/{executionId}/evidence'],
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

function getStatusTone(status: string) {
  if (status in statusTone) {
    return statusTone[status as RuntimeExecutionStatus];
  }
  if (['COMPLETED', 'PASSED', 'APPLIED', 'ACKNOWLEDGED', 'DELIVERED', 'REUSE_ALLOWED'].includes(status)) {
    return 'success';
  }
  if (['FAILED', 'DENIED', 'BLOCKED', 'WITHHELD'].includes(status)) {
    return 'danger';
  }
  return 'neutral';
}

function createIdempotencyKey() {
  return crypto.randomUUID();
}

export function GatewayLabPage() {
  const { selectedPack } = useExecutionPack();
  const [scenarioMode, setScenarioMode] = useState<'approved' | 'scope-change' | 'destination-risk' | 'response-risk'>('approved');
  const [requesterRole, setRequesterRole] = useState<'staff' | 'reviewer'>('staff');
  const [institutionId, setInstitutionId] = useState('');
  const [approvalReference, setApprovalReference] = useState('');
  const [workloadId, setWorkloadId] = useState('');
  const [purposeCode, setPurposeCode] = useState('');
  const [subjectScope, setSubjectScope] = useState('');
  const [destinationProfileId, setDestinationProfileId] = useState('');
  const [processingContextsText, setProcessingContextsText] = useState(selectedPack.defaultProcessingContexts.join(', '));
  const [content, setContent] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [accountId, setAccountId] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [assetId, setAssetId] = useState('');
  const [amount, setAmount] = useState('');
  const [idempotencyKey, setIdempotencyKey] = useState(createIdempotencyKey);
  const [selectedCheckpoint, setSelectedCheckpoint] = useState('01');

  const checkpoint = checkpointDetails.find((item) => item.number === selectedCheckpoint) ?? checkpointDetails[0];
  const canExecute = runtimeExecutionCapabilities.canExecute;
  const targetPipeline = createTargetPipeline(selectedPack);
  const isDigitalAsset = selectedPack.key === 'digital-asset';
  const isApprovedScenario = scenarioMode === 'approved';
  const scenarioOptions = isDigitalAsset
    ? [
      ['approved', '정상 결제'],
      ['scope-change', '금액 한도 초과'],
      ['destination-risk', 'SENT_UNKNOWN'],
      ['response-risk', '중복 요청'],
    ] as const
    : [
      ['approved', '승인 범위 일치'],
      ['scope-change', '권한 범위 초과'],
      ['destination-risk', '미승인 Provider'],
      ['response-risk', '응답 재식별 위험'],
    ] as const;
  const fieldTreatmentRows = selectedPack.fieldTreatments.map(([field, treatment]) => {
    const [primaryTreatment = treatment] = treatment.split(' · ');
    const obligation = treatment.includes('REVIEW') ? 'REVIEW_REQUIRED' : treatment.includes('KEEP_EXACT') ? 'EXACT_REQUIRED' : treatment.includes('TOKEN') ? 'PSEUDONYMIZABLE' : 'MINIMIZABLE';
    return {
      field,
      requested: isApprovedScenario ? '요청' : '검토 요청',
      retrieved: 'API 연결 대기',
      obligation,
      treatment: primaryTreatment,
    };
  });

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

    const input = isDigitalAsset
      ? { customerId, accountId, walletAddress, assetId, amount: Number(amount) }
      : { prompt: content };
    const request: RuntimeExecutionRequest = {
      institutionId,
      approvalReference,
      workloadId,
      purposeCode,
      subjectScope,
      destinationProfileId,
      input,
      idempotencyKey,
      processingContexts: processingContextsText.split(',').map((value) => value.trim()).filter(Boolean),
    };
    execution.mutate(request);
  }

  function markLogicalRequestChanged(update: () => void) {
    update();
    setIdempotencyKey(createIdempotencyKey());
  }

  useEffect(() => {
    setProcessingContextsText(selectedPack.defaultProcessingContexts.join(', '));
    setIdempotencyKey(createIdempotencyKey());
  }, [selectedPack.defaultProcessingContexts]);

  return (
    <section className="page-section">
      <PageHeader
        eyebrow={isDigitalAsset ? 'TRANSACTION INTENT → VERIFIED SETTLEMENT' : 'EMPLOYEE REQUEST → SAFE AI RESPONSE'}
        title="Gateway Lab"
        description={isDigitalAsset ? '거래 의도부터 정책 검증, 외부 상태 확인과 정산 복구까지 한 번에 검증합니다.' : '은행원의 요청부터 데이터 최소화, AI 응답 재검사와 최종 전달까지 한 번에 비교합니다.'}
        actions={<StatusBadge tone={canExecute ? 'success' : 'warning'}>{canExecute ? 'LOCAL BFF READY' : 'AUTH REQUIRED'}</StatusBadge>}
      />

      <PackContextSummary label={selectedPack.label} scope={selectedPack.scope} descriptor={selectedPack.descriptor} objective={selectedPack.objective} />

      <div className="notice notice-security">
        브라우저에는 `X-ADP-API-Key`를 주입하지 않습니다. {canExecute ? '로컬 Vite BFF가 서버 측 credential을 붙여 BE Runtime을 호출합니다.' : 'Admin 인증 또는 Local BFF가 붙기 전까지 실제 Execute는 비활성화합니다.'}
      </div>

      <div className="lab-toolbar" aria-label="Gateway Lab controls">
        <div>
          <span className="toolbar-label">시나리오</span>
          <div className="segmented-control" role="tablist" aria-label="Gateway scenario">
            {scenarioOptions.map(([key, label]) => (
              <button key={key} type="button" role="tab" aria-selected={scenarioMode === key} className={scenarioMode === key ? 'active' : ''} onClick={() => setScenarioMode(key)}>{label}</button>
            ))}
          </div>
        </div>
        <div className="segmented-control segmented-control-muted" role="tablist" aria-label="Requester role">
          <button type="button" role="tab" aria-selected={requesterRole === 'staff'} className={requesterRole === 'staff' ? 'active' : ''} onClick={() => setRequesterRole('staff')}>{isDigitalAsset ? '결제운영자' : '상담직원'}</button>
          <button type="button" role="tab" aria-selected={requesterRole === 'reviewer'} className={requesterRole === 'reviewer' ? 'active' : ''} onClick={() => setRequesterRole('reviewer')}>{isDigitalAsset ? '정산 담당자' : '여신심사 담당자'}</button>
        </div>
        <StatusBadge tone="purple">NO MOCK RESULT</StatusBadge>
      </div>

      <section className={isApprovedScenario ? 'policy-application-card policy-application-card-approved' : 'policy-application-card'}>
        <div className="policy-application-hero">
          <span className="policy-application-icon" aria-hidden="true"><ShieldCheck size={24} /></span>
          <div>
            <p>PRE-APPROVED POLICY APPLIED</p>
            <h2>{isApprovedScenario ? '사전 승인 정책 재사용 가능' : scenarioMode === 'scope-change' ? '승인 범위 변경 검토 필요' : scenarioMode === 'destination-risk' ? '외부 대상 상태 확인 필요' : '응답 재검증 필요'}</h2>
            <span>{isApprovedScenario ? 'Gateway가 임의로 허용하지 않고 기존 Approval Reference와 현재 요청을 비교합니다.' : isDigitalAsset ? 'FPG는 거래 적격성을 재판정하지 않고 승인된 거래 의도와 외부 상태/정산 결과를 검증합니다.' : '승인된 목적과 다른 전송 범위는 Review 경로로 분기되어야 합니다.'}</span>
          </div>
          <StatusBadge tone={isApprovedScenario ? 'success' : 'warning'}>{isApprovedScenario ? 'REUSE_ALLOWED' : 'REVIEW_REQUIRED'}</StatusBadge>
        </div>
        <KeyValues
          items={[
            ['Workload', workloadId || '입력 대기'],
            ['Policy', execution.data?.created.policyVersion ?? '실행 대기'],
            ['Approval', execution.data?.trace.evidence.approvalReference ?? (approvalReference || '입력 대기')],
            ['Valid Until', 'API 연결 대기'],
            ['Data Profile', selectedPack.scope],
            ['Destination', destinationProfileId || selectedPack.destinationProfile[0]?.[1] || '입력 대기'],
            ['Execution Pack', selectedPack.label],
            ['Scope Match', isApprovedScenario ? 'MATCH' : 'REVIEW'],
          ]}
        />
      </section>

      <div className="gateway-prototype-grid">
        <SectionCard title={isDigitalAsset ? '거래 요청' : '사용자 요청'} description="업무 목적과 실행 범위">
          <form className="form-grid compact-form-grid" onSubmit={submit}>
            <div className="requester-role-card field-full">
              <span aria-hidden="true"><BriefcaseBusiness size={20} /></span>
              <div>
                <small>ROLE</small>
                <strong>{requesterRole === 'staff' ? (isDigitalAsset ? '카드결제 운영자' : '상담직원') : (isDigitalAsset ? '정산 담당자' : '여신심사 담당자')}</strong>
              </div>
            </div>
            <label className="field">
              <span>Institution ID</span>
              <input value={institutionId} onChange={(event) => markLogicalRequestChanged(() => setInstitutionId(event.target.value))} placeholder="institution identifier" required />
            </label>
            <label className="field">
              <span>Approval Reference</span>
              <input value={approvalReference} onChange={(event) => markLogicalRequestChanged(() => setApprovalReference(event.target.value))} placeholder="approved policy reference" required />
            </label>
            <label className="field">
              <span>Workload ID</span>
              <input value={workloadId} onChange={(event) => markLogicalRequestChanged(() => setWorkloadId(event.target.value))} placeholder={selectedPack.gatewayRequest.workloadPlaceholder} required />
            </label>
            <label className="field">
              <span>Purpose Code</span>
              <input value={purposeCode} onChange={(event) => markLogicalRequestChanged(() => setPurposeCode(event.target.value))} placeholder={selectedPack.gatewayRequest.purposePlaceholder} required />
            </label>
            <label className="field">
              <span>Subject Scope</span>
              <input value={subjectScope} onChange={(event) => markLogicalRequestChanged(() => setSubjectScope(event.target.value))} placeholder={selectedPack.gatewayRequest.subjectPlaceholder} required />
            </label>
            <label className="field">
              <span>Destination Profile ID</span>
              <input value={destinationProfileId} onChange={(event) => markLogicalRequestChanged(() => setDestinationProfileId(event.target.value))} placeholder={selectedPack.gatewayRequest.destinationPlaceholder} required />
            </label>
            {isDigitalAsset ? (
              <>
                <label className="field"><span>Customer ID</span><input value={customerId} onChange={(event) => markLogicalRequestChanged(() => setCustomerId(event.target.value))} required /></label>
                <label className="field"><span>Account ID</span><input value={accountId} onChange={(event) => markLogicalRequestChanged(() => setAccountId(event.target.value))} required /></label>
                <label className="field"><span>Wallet Address</span><input value={walletAddress} onChange={(event) => markLogicalRequestChanged(() => setWalletAddress(event.target.value))} required /></label>
                <label className="field"><span>Asset ID</span><input value={assetId} onChange={(event) => markLogicalRequestChanged(() => setAssetId(event.target.value))} required /></label>
                <label className="field field-full"><span>Amount</span><input type="number" min="0" step="any" value={amount} onChange={(event) => markLogicalRequestChanged(() => setAmount(event.target.value))} required /></label>
              </>
            ) : (
              <label className="field field-full">
                <span>{selectedPack.gatewayRequest.inputLabel}</span>
                <textarea value={content} onChange={(event) => markLogicalRequestChanged(() => setContent(event.target.value))} placeholder={selectedPack.gatewayRequest.inputPlaceholder} rows={6} required />
              </label>
            )}
            <label className="field field-full">
              <span>Processing Contexts</span>
              <input value={processingContextsText} onChange={(event) => markLogicalRequestChanged(() => setProcessingContextsText(event.target.value))} placeholder={selectedPack.defaultProcessingContexts.join(', ')} required />
            </label>
            <KeyValues
              items={[
                ['Purpose', purposeCode || '입력 대기'],
                ['Subject Scope', subjectScope || '입력 대기'],
                ['Requested Change', isApprovedScenario ? '없음' : '있음'],
                ['Approval Reuse', isApprovedScenario ? '동일 조건' : 'Review 필요'],
              ]}
            />
            <div className="input-meta field-full">
              <span>{isDigitalAsset ? '5 contract fields' : `${content.length} chars`}</span>
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
              {execution.isPending ? '실행 중...' : canExecute ? '정책 검증 및 실행' : 'Auth 연결 후 실행'}
            </button>
          </form>
        </SectionCard>

        <SectionCard title={isDigitalAsset ? '실행 전 경계 검증' : '전송 전 데이터 미리보기'} description={isDigitalAsset ? '공개 정보와 가치사용 경계 표시' : '원본 대신 외부 전송값과 처리 근거 표시'}>
          <div className="field-treatment-table" role="table" aria-label="Field treatment preview">
            <div className="field-treatment-head" role="row">
              <span>FIELD</span>
              <span>요청</span>
              <span>조회 결과</span>
              <span>OBLIGATION</span>
              <span>TREATMENT</span>
            </div>
            {fieldTreatmentRows.map((row) => (
              <div className="field-treatment-row" role="row" key={row.field}>
                <strong>{row.field}</strong>
                <StatusBadge tone={row.requested === '검토 요청' ? 'warning' : 'info'}>{row.requested}</StatusBadge>
                <span>{row.retrieved}</span>
                <span>{row.obligation}</span>
                <StatusBadge tone={row.treatment.includes('BLOCK') || row.treatment.includes('DENY') ? 'danger' : row.treatment.includes('TOKEN') ? 'purple' : 'success'}>{row.treatment}</StatusBadge>
              </div>
            ))}
          </div>
          <div className="field-summary-grid">
            <div><span>Requested</span><strong>{execution.data ? `${execution.data.trace.evidence.requested.count ?? 0} Fields` : '실행 대기'}</strong></div>
            <div><span>Retrieved</span><strong>{execution.data ? `${execution.data.trace.evidence.retrieved.count ?? 0} Fields` : '실행 대기'}</strong></div>
            <div><span>Released</span><strong>{execution.data ? `${execution.data.trace.evidence.released.count ?? 0} Fields` : '실행 대기'}</strong></div>
            <div><span>Transformed</span><strong>{execution.data ? `${execution.data.trace.evidence.transformed.count ?? 0} Fields` : '실행 대기'}</strong></div>
            <div><span>Outbound Guard</span><strong>{execution.data?.created.outboundGuardStatus ?? '실행 대기'}</strong></div>
          </div>
        </SectionCard>

        <SectionCard title={isDigitalAsset ? '외부 결과 및 정산 검증' : 'AI 응답 및 검증 결과'} description="외부 결과를 그대로 전달하지 않고 다시 검사합니다.">
          {execution.data ? (
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
            </div>
          ) : (
            <EmptyState
              icon={LockKeyhole}
              title="실행 전입니다"
              description="정책 검증 후 안전한 경우에만 외부 실행과 응답 Guard 결과를 표시합니다."
              endpoint="POST /v1/runtime/executions"
            />
          )}
        </SectionCard>
      </div>

      <div className="gateway-lower-grid">
        <SectionCard title="Target Pipeline" description="선택된 Pack에 적용할 목표 Gateway 처리 단계" actions={<StatusBadge tone="purple">TARGET</StatusBadge>}>
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

        <div className="result-stack">
          <SectionCard title="Observed Runtime Stages" description="BE가 `/trace`에서 반환한 단계만 실제 관측 결과로 표시합니다." actions={<StatusBadge tone={execution.data ? 'success' : execution.isPending ? 'warning' : 'neutral'}>{execution.data ? 'TRACE' : execution.isPending ? 'RUNNING' : 'NOT STARTED'}</StatusBadge>}>
            {execution.data ? (
              <ol className="trace-list">
                {execution.data.trace.stages.map((stage, index) => (
                  <li key={`${stage.stage}-${index}`}>
                    <span className="trace-index">{index + 1}</span>
                    <div>
                      <strong>{stage.stage}</strong>
                      <StatusBadge tone={getStatusTone(stage.status)}>{stage.status}</StatusBadge>
                    </div>
                  </li>
                ))}
              </ol>
            ) : (
              <EmptyState compact title={canExecute ? '실행 대기' : 'Auth Integration 필요'} description={canExecute ? '요청을 실행하면 BE가 반환한 실제 Stage와 Evidence를 표시합니다.' : '현재 브라우저 FE는 Runtime Executor credential을 보유하지 않습니다.'} endpoint="GET /v1/runtime/executions/{executionId}/trace" />
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

          <div className="content-grid content-grid-two">
            <SectionCard title="Destination Profile" description="외부 대상별 Provider·Tenant·Region·Retention 조건">
              <KeyValues items={selectedPack.destinationProfile} />
            </SectionCard>
            <SectionCard title="Field Treatment" description="Outbound 전송 전 필드 처리 계약">
              <KeyValues items={selectedPack.fieldTreatments} />
            </SectionCard>
          </div>

          <SectionCard title="실행 결과" description="BE의 policyAction, finalAction, digest, audit id만 표시합니다.">
          {execution.isError ? (
            <ErrorState description={normalizeApiError(execution.error).message} onRetry={() => execution.reset()} />
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
                  ['Approval Reuse', execution.data.trace.evidence.approvalReuseStatus ?? '—'],
                  ['Released Fields', String(execution.data.trace.evidence.released.count ?? 0)],
                  ['Delivery Status', execution.data.created.output?.deliveryStatus ?? '—'],
                  ['Response Digest', execution.data.created.output?.responseDigest ?? '—'],
                ]}
              />
            </div>
          ) : (
            <EmptyState
              icon={TerminalSquare}
              title={canExecute ? '실행 결과 대기' : 'Auth Integration 전 실행 비활성'}
              description={canExecute ? '입력한 요청을 실행하면 정책·Trace·Digest 결과를 표시합니다.' : 'API Key를 브라우저 환경변수로 노출하지 않습니다. Admin 인증 또는 Local BFF에서 서버 측 credential을 붙인 뒤 실행을 활성화합니다.'}
              endpoint="POST /v1/runtime/executions"
            />
          )}
          </SectionCard>
        </div>
      </div>
    </section>
  );
}
