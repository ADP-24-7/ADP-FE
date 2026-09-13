import { LockKeyhole, Play, Search } from 'lucide-react';
import { useEffect, useState, type FormEvent } from 'react';
import { useContextPreview } from '../../features/workloads';
import { normalizeApiError } from '../../shared/api/apiError';
import { BulletList, EmptyState, ErrorState, KeyValues, LoadingPanel, PackContextSummary, PageHeader, SearchAssistInput, SectionCard, StatusBadge } from '../../shared/components';
import { useExecutionPack } from '../../shared/prototype';

export function DataAccessPage() {
  const { selectedPack } = useExecutionPack();
  const [workloadId, setWorkloadId] = useState('');
  const [purpose, setPurpose] = useState('');
  const [subject, setSubject] = useState('');
  const preview = useContextPreview();
  const resetPreview = preview.reset;
  const isDigitalAsset = selectedPack.key === 'digital-asset';
  const workloadSuggestions = isDigitalAsset
    ? [{ value: 'tokenized_asset_purchase', label: '디지털 자산 구매', description: '승인된 자산 거래 조회 범위', source: 'local-example' as const }]
    : [{ value: 'customer_summary', label: 'AI 고객 요약', description: '상담 목적의 최소 조회 범위', source: 'local-example' as const }];
  const purposeSuggestions = isDigitalAsset
    ? [{ value: 'DIGITAL_ASSET_PURCHASE', label: '디지털 자산 구매', description: '승인된 거래 목적', source: 'local-example' as const }]
    : [{ value: 'CUSTOMER_SUPPORT', label: '고객 지원 목적', description: '고객 요약 업무에 허용된 목적', source: 'local-example' as const }];
  const subjectSuggestions = [{ value: 'customer:customer-100', label: 'Synthetic customer', description: '실제 고객정보가 아닌 검증용 Subject', source: 'local-example' as const }];
  const fieldClassCounts = preview.data?.fields.reduce<Record<string, number>>((counts, field) => {
    counts[field.dataClass] = (counts[field.dataClass] ?? 0) + 1;
    return counts;
  }, {}) ?? {};
  const maxFieldClassCount = Math.max(1, ...Object.values(fieldClassCounts));

  useEffect(() => {
    setWorkloadId('');
    setPurpose('');
    setSubject('');
    resetPreview();
  }, [resetPreview, selectedPack.key]);

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

      <div className="data-access-flow" aria-label="데이터 접근 통제 흐름">
        {(isDigitalAsset ? [
          ['01', '거래 목적 확인', '승인된 구매·이체 목적'], ['02', '대상 범위 제한', '거래 고객과 자산만 조회'], ['03', '필드 최소화', '식별자·금액별 처리'], ['04', '외부 전송 검증', '승인된 목적지만 허용'],
        ] : [
          ['01', '상담 목적 확인', '승인된 고객지원 목적'], ['02', '고객 범위 제한', '상담 대상 1명만 조회'], ['03', '필드 최소화', '식별자 마스킹·토큰화'], ['04', 'AI 전송 검증', '허용된 Provider만 전달'],
        ]).map(([number, title, description]) => <div key={number}><span>{number}</span><strong>{title}</strong><small>{description}</small></div>)}
      </div>

      <div className="content-grid content-grid-two">
        <SectionCard className="search-assist-card" title="데이터 접근 사전 검증" description={`${isDigitalAsset ? '거래' : 'AI 상담'} 업무에서 실제 조회 전에 권한과 최소 조회 범위를 확인합니다.`} actions={<Search size={16} />}>
          <form className="form-grid compact-form-grid" onSubmit={submit}>
            <label className="field"><span>업무</span><SearchAssistInput value={workloadId} onChange={setWorkloadId} suggestions={workloadSuggestions} placeholder="업무명 또는 ID 입력" ariaLabel="데이터 접근 업무" required /></label>
            <label className="field"><span>사용 목적</span><SearchAssistInput value={purpose} onChange={setPurpose} suggestions={purposeSuggestions} placeholder="사용 목적 입력" ariaLabel="데이터 사용 목적" required /></label>
            <label className="field field-full"><span>조회 대상</span><SearchAssistInput value={subject} onChange={setSubject} suggestions={subjectSuggestions} placeholder="고객 또는 대상 식별자 입력" ariaLabel="데이터 조회 대상" required /></label>
            <button className="button button-primary" type="submit" disabled={preview.isPending}><Play size={15} />{preview.isPending ? '검증 중...' : '접근 범위 검증'}</button>
          </form>
        </SectionCard>

        <SectionCard title="조회 범위 결과" description="자유 SQL 대신 승인된 조회 계약으로 선택된 필드만 표시합니다." actions={<StatusBadge tone={preview.data ? 'success' : 'neutral'}>{preview.data ? '검증 완료' : '검증 대기'}</StatusBadge>}>
          {preview.isPending ? <LoadingPanel /> : preview.isError ? (
            <ErrorState description={normalizeApiError(preview.error).message} onRetry={() => preview.mutate({ workloadId, purpose, subject })} />
          ) : preview.data ? (<>
            <KeyValues items={[
              ['조회 계약', preview.data.dataAccessId],
              ['조회 대상 유형', preview.data.subjectType],
              ['선택된 필드', `${preview.data.fields.length}개`],
              ['민감정보 탐지', `${preview.data.detection.findings.length}건`],
            ]} />
            <div className="data-class-distribution" aria-label="데이터 분류별 조회 필드">
              <h3>데이터 분류별 조회 범위</h3>
              {Object.entries(fieldClassCounts).map(([dataClass, count]) => <div key={dataClass}><span>{dataClass.replace(/_/g, ' ')}</span><i><b style={{ width: `${count / maxFieldClassCount * 100}%` }} /></i><strong>{count}개</strong></div>)}
            </div>
            <details className="technical-details"><summary>기술 증적</summary><KeyValues items={[
              ['Detector Version', preview.data.detection.detectorVersion],
              ['Context Digest', preview.data.contextDigest],
            ]} /></details>
          </>) : (
            <EmptyState compact title="검증 입력 대기" description="응답의 원문 Record는 표시하지 않고 Field metadata와 digest만 사용합니다." endpoint="POST /api/runtime/context/preview" />
          )}
        </SectionCard>
      </div>

      <div className="content-grid content-grid-two">
        <SectionCard title={`${selectedPack.label} 필드 처리 정책`} description="외부 실행 전 데이터 항목별 보호 방식">
          <KeyValues items={selectedPack.fieldTreatments} />
        </SectionCard>
        <SectionCard title="기존 통제 입력" description="FPG가 대체하지 않고 재사용하는 승인·보안 근거">
          <p className="plain-copy">{selectedPack.baseline}</p>
          <BulletList items={selectedPack.evidenceChecks.map(([title, description]) => `${title}: ${description}`)} />
        </SectionCard>
      </div>

      <div className="notice notice-info">
        <LockKeyhole size={17} />
        <p><b>DB Credential 및 자유 SQL 금지</b><span>Gateway는 권한이 제한된 Adapter만 호출하며, FE는 원문 Record 대신 Field metadata와 Digest만 표시합니다.</span></p>
      </div>
    </section>
  );
}
