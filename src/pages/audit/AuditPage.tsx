import { useState, type FormEvent } from 'react';
import { FileCheck2, KeyRound, LockKeyhole, Search } from 'lucide-react';
import { EmptyState, KeyValues, PageHeader, SectionCard, StatusBadge } from '../../shared/components';

export function AuditPage() {
  const [traceId, setTraceId] = useState('');
  const [submittedTraceId, setSubmittedTraceId] = useState('');
  const timeline = ['Request', 'Workload', 'Data Access', 'Context', 'Detection', 'Decision', 'Transform', 'Egress', 'Provider', 'Response Guard', 'Delivery', 'Audit'];

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmittedTraceId(traceId.trim());
  }

  return (
    <section className="page-section">
      <PageHeader
        eyebrow="END-TO-END TRACEABILITY"
        title="Decision Trace · Audit"
        description="원문 없이 누가, 왜, 어떤 데이터와 정책 버전으로 무엇을 결정했는지 전체 흐름을 재현합니다."
        actions={<button className="button button-secondary" type="button" disabled><FileCheck2 size={15} />Evidence Packet</button>}
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
        <SectionCard title="Decision Evidence" description="Reason Code, Detection, Policy, Approval 근거">
          <KeyValues
            items={[
              ['Final Decision', '—'],
              ['Reason Codes', '—'],
              ['Policy Version', '—'],
              ['Analysis Artifact', '—'],
              ['Dataset Snapshot', '—'],
              ['Response Guard', '—'],
            ]}
          />
        </SectionCard>
        <SectionCard title="Security Findings" description="권한 초과, 원문 유출, 재식별, 감사 누락">
          <EmptyState compact icon={KeyRound} title="API 연결 대기" description="실제 Audit 이벤트만 표시합니다." endpoint="GET /v1/audit-events" />
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
          items={['Application', 'Policy', 'Artifact', 'Dataset', 'Detector', 'Transform', 'Provider'].map((item) => [`${item} Version`, '—'] as const)}
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
