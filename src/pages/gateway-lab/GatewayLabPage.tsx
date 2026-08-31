import { useMutation } from '@tanstack/react-query';
import { useState, type FormEvent } from 'react';
import { createRuntimeExecution } from '../../features/runtime-execution';
import type { RuntimeExecutionRequest } from '../../features/runtime-execution';
import { EmptyState, ErrorState, PageHeader, SectionCard, StatusBadge } from '../../shared/components';

const actionTone = {
  ALLOW: 'success',
  TRANSFORM: 'info',
  REVIEW: 'warning',
  BLOCK: 'danger',
} as const;

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
        eyebrow="Gateway Lab"
        title="탐지 및 런타임 결정 검증"
        description="사용자가 입력한 요청을 단일 Runtime Execution API로 전송하고 서버가 반환한 결정만 표시합니다."
      />

      <div className="notice notice-security">
        원문 입력은 화면 상태에만 유지합니다. 브라우저 로그, 분석 도구, Local Storage에 저장하지 마세요.
      </div>

      <div className="lab-grid">
        <SectionCard title="실행 요청" description="필수 컨텍스트를 입력한 뒤 게이트웨이를 실행합니다.">
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
              <span>검증 입력</span>
              <textarea value={content} onChange={(event) => setContent(event.target.value)} placeholder="검증할 내용을 직접 입력하세요" rows={8} required />
            </label>
            <button className="button button-primary" type="submit" disabled={execution.isPending}>
              {execution.isPending ? '실행 중…' : '게이트웨이 실행'}
            </button>
          </form>
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
              title="아직 실행 결과가 없습니다"
              description="왼쪽에서 값을 입력하고 실행하면 서버 응답과 Trace 단계가 이 영역에 표시됩니다."
              endpoint="POST /v1/runtime/executions"
            />
          )}
        </SectionCard>
      </div>
    </section>
  );
}
