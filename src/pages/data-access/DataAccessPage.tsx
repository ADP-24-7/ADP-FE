import { Boxes, LockKeyhole, Play, Search } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { useContextPreview } from '../../features/workloads';
import { normalizeApiError } from '../../shared/api/apiError';
import { BulletList, EmptyState, ErrorState, KeyValues, LoadingPanel, PackContextSummary, PageHeader, SectionCard, StatusBadge } from '../../shared/components';
import { useExecutionPack } from '../../shared/prototype';

export function DataAccessPage() {
  const { selectedPack } = useExecutionPack();
  const [workloadId, setWorkloadId] = useState('');
  const [purpose, setPurpose] = useState('');
  const [subject, setSubject] = useState('');
  const preview = useContextPreview();

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    preview.mutate({ workloadId, purpose, subject });
  }

  return (
    <section className="page-section">
      <PageHeader
        eyebrow="DATA MINIMIZATION BOUNDARY"
        title="Workload · Data Access"
        description={`${selectedPack.label} 흐름이 DB에 직접 접근하지 않도록 Workload별 허용 범위와 사전 정의 Query Adapter를 검증합니다.`}
        actions={<StatusBadge tone="warning">DEFAULT DENY</StatusBadge>}
      />

      <PackContextSummary label={selectedPack.label} scope={selectedPack.scope} descriptor={selectedPack.descriptor} objective={selectedPack.objective} />

      <div className="content-grid content-grid-two">
        <SectionCard title="Runtime Context Preview" description="로컬 검증용 API로 권한·최소조회·탐지 결과를 확인합니다." actions={<Search size={16} />}>
          <form className="form-grid compact-form-grid" onSubmit={submit}>
            <label className="field"><span>Workload ID</span><input value={workloadId} onChange={(event) => setWorkloadId(event.target.value)} required /></label>
            <label className="field"><span>Purpose</span><input value={purpose} onChange={(event) => setPurpose(event.target.value)} required /></label>
            <label className="field field-full"><span>Subject</span><input value={subject} onChange={(event) => setSubject(event.target.value)} placeholder="subjectType:subjectId" required /></label>
            <button className="button button-primary" type="submit" disabled={preview.isPending}><Play size={15} />{preview.isPending ? '검증 중...' : 'Context 검증'}</button>
          </form>
        </SectionCard>

        <SectionCard title="Retrieval Profile" description="자유 SQL 대신 허용된 조회 계약만 실행" actions={<StatusBadge tone={preview.data ? 'success' : 'neutral'}>{preview.data ? 'VERIFIED' : 'NOT LOADED'}</StatusBadge>}>
          {preview.isPending ? <LoadingPanel /> : preview.isError ? (
            <ErrorState description={normalizeApiError(preview.error).message} onRetry={() => preview.mutate({ workloadId, purpose, subject })} />
          ) : preview.data ? (
            <KeyValues items={[
              ['Profile / Data Access', preview.data.dataAccessId],
              ['Subject Type', preview.data.subjectType],
              ['Selected Fields', String(preview.data.fields.length)],
              ['Sensitive Findings', String(preview.data.detection.findings.length)],
              ['Detector Version', preview.data.detection.detectorVersion],
              ['Context Digest', preview.data.contextDigest],
            ]} />
          ) : (
            <EmptyState compact title="검증 입력 대기" description="응답의 원문 Record는 표시하지 않고 Field metadata와 digest만 사용합니다." endpoint="POST /api/runtime/context/preview" />
          )}
        </SectionCard>
      </div>

      <div className="content-grid content-grid-two">
        <SectionCard title={`${selectedPack.label} Field Treatment`} description="외부 실행 전 필드별 처리 정책">
          <KeyValues items={selectedPack.fieldTreatments} />
        </SectionCard>
        <SectionCard title="기존 통제 입력" description="FPG가 대체하지 않고 재사용하는 승인·보안 근거">
          <p className="plain-copy">{selectedPack.baseline}</p>
          <BulletList items={selectedPack.evidenceChecks.map(([title, description]) => `${title}: ${description}`)} />
        </SectionCard>
      </div>

      <SectionCard title="Workload Registry" description="현재 BE는 목록 API 없이 인증 Principal의 Workload Scope와 Runtime 검증만 제공합니다." actions={<button className="button button-secondary" type="button" disabled><Boxes size={15} />Workload 등록</button>}>
        <EmptyState title="API 연결 대기" description="관리자용 Workload Registry Read Model이 구현되면 목록을 표시합니다." endpoint="Workload Registry API 미구현" />
      </SectionCard>

      <div className="notice notice-info">
        <LockKeyhole size={17} />
        <p><b>DB Credential 및 자유 SQL 금지</b><span>Gateway는 권한이 제한된 Adapter만 호출하며, FE는 원문 Record 대신 Field metadata와 Digest만 표시합니다.</span></p>
      </div>
    </section>
  );
}
