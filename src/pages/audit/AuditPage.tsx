import { useState, type FormEvent } from 'react';
import { EmptyState, PageHeader, SectionCard } from '../../shared/components';

export function AuditPage() {
  const [traceId, setTraceId] = useState('');
  const [submittedTraceId, setSubmittedTraceId] = useState('');

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmittedTraceId(traceId.trim());
  }

  return (
    <section className="page-section">
      <PageHeader
        eyebrow="Audit"
        title="감사 추적"
        description="원문이나 토큰 맵 없이 Trace ID, 결정, 정책 버전, 단계별 상태만 조회합니다."
      />

      <SectionCard title="Trace 검색" description="정확한 Trace ID로 실행 이력을 조회합니다.">
        <form className="search-row" onSubmit={submit}>
          <label className="field field-grow">
            <span>Trace ID</span>
            <input value={traceId} onChange={(event) => setTraceId(event.target.value)} placeholder="조회할 trace ID" required />
          </label>
          <button className="button button-primary" type="submit">검색</button>
        </form>
      </SectionCard>

      <SectionCard title="Decision Trace" description="Request부터 Audit까지 단계별로 확인합니다.">
        <EmptyState
          title={submittedTraceId ? 'API 연결 대기' : '조회할 Trace를 입력해 주세요'}
          description={submittedTraceId
            ? `입력한 Trace ID(${submittedTraceId})를 화면에만 보관했습니다. 조회 API 구현 후 서버 결과를 연결하세요.`
            : '검색 후에도 서버에서 반환한 privacy-safe 필드만 표시해야 합니다.'}
          endpoint={submittedTraceId ? `GET /v1/traces/${submittedTraceId}` : 'GET /v1/traces/{traceId}'}
        />
      </SectionCard>

      <SectionCard title="감사 이벤트" description="역할에 허용된 필드만 최신순으로 표시합니다.">
        <div className="empty-table">
          <div className="table-head table-audit">
            <span>발생 시각</span><span>Trace ID</span><span>Workload</span><span>Final Action</span><span>Policy</span>
          </div>
          <EmptyState title="API 연결 대기" description="조회 조건에 해당하는 서버 데이터가 없으면 데이터 없음 상태로 표시합니다." endpoint="GET /v1/audit-events" />
        </div>
      </SectionCard>
    </section>
  );
}
