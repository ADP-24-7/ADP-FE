import { useMutation } from '@tanstack/react-query';
import { Play, TerminalSquare } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { createRuntimeExecution } from '../../features/runtime-execution';
import type { RuntimeExecutionRequest } from '../../features/runtime-execution';
import { EmptyState, ErrorState, KeyValues, PageHeader, SectionCard, StatusBadge } from '../../shared/components';

const actionTone = {
  ALLOW: 'success',
  TRANSFORM: 'info',
  REVIEW: 'warning',
  BLOCK: 'danger',
} as const;

const checkpoints = [
  ['01', 'Request & Authorization', '인증 주체, Workload, 목적, 동의 범위를 확인'],
  ['02', 'Data Access & Context', '허용된 Dataset, Field, Subject, 기간, 행 수만 조회'],
  ['03', 'Input Detection & Decision', '민감정보 탐지와 정책 판정, Human Review 분기'],
  ['04', 'Transform & Outbound Guard', '토큰화 후 외부 전송 Payload를 최종 검사'],
  ['05', 'Provider & Response Guard', 'LLM 응답의 재식별, 유출, 정책 위반을 재검증'],
  ['06', 'Controlled Delivery & Audit', '안전한 결과만 전달하고 전 단계 근거를 기록'],
] as const;

const checkpointDetails = [
  ['Input', 'principal, workloadId, purposeCode, consentRef'],
  ['검증 항목', '인증, 권한, 목적 제한, 동의 범위'],
  ['Output', 'authorizationDecision'],
  ['연결 API', 'POST /v1/runtime/executions'],
] as const;

export function GatewayLabPage() {
  const [workloadId, setWorkloadId] = useState('');
  const [purposeCode, setPurposeCode] = useState('');
  const [subjectScope, setSubjectScope] = useState('');
  const [providerProfileId, setProviderProfileId] = useState('');
  const [content, setContent] = useState('');

  const execution = useMutation({ mutationFn: createRuntimeExecution });

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const request: RuntimeExecutionRequest = {
      workloadId,
      purposeCode,
      subjectScope,
      providerProfileId,
      input: { content },
      idempotencyKey: crypto.randomUUID(),
    };
    execution.mutate(request);
  }

  return (
    <section className="page-section">
      <PageHeader
        eyebrow="END-TO-END CONTRACT LAB"
        title="탐지 및 런타임 결정 검증"
        description="입력 탐지뿐 아니라 DB 조회 경계, 외부 전송, LLM 응답 검증과 통제된 전달까지 한 흐름으로 확인합니다."
        actions={<StatusBadge tone="purple">NO MOCK RESULT</StatusBadge>}
      />

      <div className="notice notice-security">
        원문 입력은 화면 상태에만 유지합니다. 브라우저 로그, 분석 도구, Local Storage에 저장하지 마세요.
      </div>

      <div className="lab-grid">
        <SectionCard title="Gateway 요청 구성" description="실제 API 계약에 필요한 최소 식별자만 입력합니다." className="sticky-card">
          <form className="form-grid" onSubmit={submit}>
            <label className="field">
              <span>Workload ID</span>
              <input value={workloadId} onChange={(event) => setWorkloadId(event.target.value)} placeholder="BE에 등록된 workload ID" required />
            </label>
            <label className="field">
              <span>Purpose Code</span>
              <input value={purposeCode} onChange={(event) => setPurposeCode(event.target.value)} placeholder="승인된 purpose code" required />
            </label>
            <label className="field">
              <span>Subject Scope</span>
              <input value={subjectScope} onChange={(event) => setSubjectScope(event.target.value)} placeholder="마스킹된 subject scope" required />
            </label>
            <label className="field">
              <span>Provider Profile ID</span>
              <input value={providerProfileId} onChange={(event) => setProviderProfileId(event.target.value)} placeholder="BE에 등록된 provider profile" required />
            </label>
            <label className="field field-full">
              <span>사용자 질문</span>
              <textarea value={content} onChange={(event) => setContent(event.target.value)} placeholder="민감한 실제 고객정보 대신 테스트용 입력을 사용하세요." rows={8} required />
            </label>
            <div className="input-meta field-full">
              <span>{content.length} chars</span>
              <span>Raw Prompt · Token Map 저장 금지</span>
            </div>
            <button className="button button-primary" type="submit" disabled={execution.isPending}>
              <Play size={16} fill="currentColor" />
              {execution.isPending ? '실행 중...' : 'E2E Gateway 실행'}
            </button>
          </form>
        </SectionCard>

        <div className="result-stack">
          <SectionCard title="전체 검증 Pipeline" description="서버가 반환한 stage만 실제 결과로 표시합니다." actions={<StatusBadge tone={execution.data ? 'success' : execution.isPending ? 'warning' : 'neutral'}>{execution.data ? 'RESULT' : execution.isPending ? 'RUNNING' : 'NOT STARTED'}</StatusBadge>}>
            <div className="checkpoint-list">
              {checkpoints.map(([number, title, description]) => (
                <div key={number}>
                  <span>{number}</span>
                  <p><b>{title}</b><small>{description}</small></p>
                  <StatusBadge>대기</StatusBadge>
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard title="Checkpoint Detail" description="단계별 입력, 검증, 출력, 연결 API">
            <KeyValues items={checkpointDetails} />
            <p className="helper-text">실제 응답이 없으므로 PASS, BLOCK, TRANSFORM 값을 임의로 만들지 않습니다.</p>
          </SectionCard>

          <SectionCard title="실행 결과" description="BE의 finalAction과 privacy-safe 응답만 표시합니다.">
          {execution.isError ? (
            <ErrorState description="Runtime Execution API 호출에 실패했습니다. API 주소, CORS, 인증 및 요청 계약을 확인해 주세요." />
          ) : execution.data ? (
            <div className="result-stack">
              <div className="result-summary">
                <div>
                  <span>최종 결정</span>
                  {execution.data.finalAction ? (
                    <StatusBadge tone={actionTone[execution.data.finalAction]}>{execution.data.finalAction}</StatusBadge>
                  ) : <strong>—</strong>}
                </div>
                <div><span>실행 상태</span><strong>{execution.data.status}</strong></div>
                <div><span>Trace ID</span><code>{execution.data.traceId}</code></div>
              </div>

              <div className="output-panel">
                <span>Privacy-safe output</span>
                <p>{execution.data.output?.displayText || '서버가 표시 가능한 응답을 반환하지 않았습니다.'}</p>
              </div>

              <ol className="trace-list">
                {execution.data.stages.map((stage, index) => (
                  <li key={`${stage.stage}-${index}`}>
                    <span className="trace-index">{index + 1}</span>
                    <div><strong>{stage.stage}</strong><span>{stage.status}</span></div>
                  </li>
                ))}
              </ol>
            </div>
          ) : (
            <EmptyState
              icon={TerminalSquare}
              title="아직 실행 결과가 없습니다"
              description="왼쪽에서 값을 입력하고 실행하면 Authorization부터 Audit까지 서버 응답과 Trace 단계가 이 영역에 표시됩니다."
              endpoint="POST /v1/runtime/executions"
            />
          )}
          </SectionCard>
        </div>
      </div>
    </section>
  );
}
