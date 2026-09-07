import { useState, type FormEvent } from 'react';
import { FileCheck2, LockKeyhole, Search } from 'lucide-react';
import { EmptyState, KeyValues, PackContextSummary, PageHeader, SectionCard, StatusBadge } from '../../shared/components';
import { useExecutionPack } from '../../shared/prototype';

export function AuditPage() {
  const { selectedPack } = useExecutionPack();
  const [traceId, setTraceId] = useState('');
  const [submittedTraceId, setSubmittedTraceId] = useState('');
  const timeline = selectedPack.key === 'digital-asset'
    ? ['Intent', 'Policy Binding', 'Disclosure', 'Submit', 'External State', 'Settlement', 'Reconcile', 'Audit']
    : ['Request', 'Authorization', 'Policy Binding', 'Data Access', 'Transform', 'Provider', 'Response Guard', 'Delivery'];

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmittedTraceId(traceId.trim());
  }

  return (
    <section className="page-section">
      <PageHeader
        eyebrow="REQUEST TO OUTCOME · RAW-FREE EVIDENCE"
        title="Decision Trace"
        description="승인부터 외부 실행, 결과 검증과 감사까지 하나의 실행 ID로 재현합니다."
        actions={<button className="button button-secondary" type="button" disabled><FileCheck2 size={15} />Evidence Packet</button>}
      />

      <PackContextSummary label={selectedPack.label} scope={selectedPack.scope} descriptor={selectedPack.descriptor} objective={selectedPack.objective} />

      <SectionCard title="Trace 검색" description="정확한 Trace ID로 실행 이력을 조회합니다.">
        <form className="search-row" onSubmit={submit}>
          <label className="field field-grow">
            <span>Trace ID</span>
            <input value={traceId} onChange={(event) => setTraceId(event.target.value)} placeholder="조회할 trace ID" required />
          </label>
          <button className="button button-primary" type="submit">검색</button>
        </form>
      </SectionCard>

      <SectionCard title={selectedPack.key === 'digital-asset' ? '거래 실행 Trace' : '고객상담 AI 안전 실행'} description={selectedPack.objective} actions={<StatusBadge>NO TRACE</StatusBadge>}>
        {submittedTraceId ? (
          <EmptyState
            icon={Search}
            title="API 연결 대기"
            description={`입력한 Trace ID(${submittedTraceId})를 화면에만 보관했습니다. 조회 API 구현 후 서버 결과를 연결하세요.`}
            endpoint={`GET /v1/audit-events?traceId=${submittedTraceId}`}
          />
        ) : (
          <div className="timeline-grid">
            {timeline.map((item, index) => (
              <div key={item}>
                <span>{String(index + 1).padStart(2, '0')}</span>
                <b>{item}</b>
                <small>—</small>
              </div>
            ))}
          </div>
        )}
      </SectionCard>

      <div className="content-grid content-grid-two">
        <SectionCard title="Decision Context" description="당시 적용된 승인·실행 조건">
          <KeyValues
            items={[
              ['Principal', 'API 연결 대기'],
              ['Workload', 'API 연결 대기'],
              ['Purpose', 'API 연결 대기'],
              ['Subject Scope', selectedPack.key === 'digital-asset' ? 'APPROVED_TRANSACTION' : 'CURRENT_CUSTOMER'],
              ['Approval', 'GET /v1/audit-events'],
              ['Policy Version', '—'],
            ]}
          />
        </SectionCard>
        <SectionCard title="Evidence & Integrity" description="원문 없이 실행을 검증하는 참조값">
          <KeyValues
            items={[
              ['Input Digest', 'API 연결 대기'],
              ['Destination', 'API 연결 대기'],
              ['Released Fields', 'GET /v1/runtime/executions/{id}/trace'],
              ['Raw Sensitive Egress', 'Prometheus egress counter'],
              ['Response Guard', 'GET /v1/security-findings'],
              ['Audit Outbox', 'Prometheus audit_outbox metrics'],
            ]}
          />
        </SectionCard>
      </div>

      <SectionCard title="감사 이벤트" description="역할에 허용된 필드만 최신순으로 표시합니다.">
        <div className="empty-table">
          <div className="table-head table-audit">
            <span>발생 시각</span><span>Trace ID</span><span>Workload</span><span>Final Action</span><span>Policy</span>
          </div>
          <EmptyState title="API 연결 대기" description="조회 조건에 해당하는 서버 데이터가 없으면 데이터 없음 상태로 표시합니다." endpoint="GET /v1/audit-events" />
        </div>
      </SectionCard>

      <SectionCard title="Execution Version Set" description="동일 결정을 재현하기 위해 Trace에 고정되는 전체 버전" actions={<StatusBadge>NO TRACE</StatusBadge>}>
        <KeyValues
          items={[
            ['Execution Pack', selectedPack.label],
            ['Implementation Priority', selectedPack.priority],
            ...['Application', 'Policy', 'Artifact', 'Dataset', 'Detector', 'Transform', 'Destination'].map((item) => [`${item} Version`, '—'] as const),
          ]}
        />
      </SectionCard>

      <div className="notice notice-info">
        <LockKeyhole size={17} />
        <p>
          <b>Privacy-safe Audit</b>
          <span>Raw Prompt, 고객·계좌 원문, Token Map은 저장하거나 표시하지 않습니다. Metadata, Type, Digest, Reason Code만 추적합니다.</span>
        </p>
      </div>
    </section>
  );
}
