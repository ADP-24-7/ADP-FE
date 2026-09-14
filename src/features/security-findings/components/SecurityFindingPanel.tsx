import { Eye, RefreshCw, Search, ShieldAlert } from 'lucide-react';
import { useEffect, useState } from 'react';
import { normalizeApiError } from '../../../shared/api/apiError';
import { EmptyState, ErrorState, KeyValues, LoadingPanel, SectionCard, StatusBadge } from '../../../shared/components';
import { DEFAULT_TABLE_PAGE_SIZE } from '../../../shared/config/pagination';
import { workloadDisplayName } from '../../../shared/config/adminLabels';
import { useSecurityFindingDetail, useSecurityFindings } from '../hooks/useSecurityFindings';
import type { SecurityFindingExecutionPack } from '../model/types';

const findingLabels: Record<string, string> = {
  PHONE_NUMBER: '전화번호',
  EMAIL: '이메일',
  ACCOUNT_NUMBER: '계좌번호',
  RESIDENT_REGISTRATION_NUMBER: '주민등록번호',
  NAME: '이름',
  RAW_VALUE_REFLECTION: '원문 값 재노출',
};

type SecurityFindingPanelProps = {
  executionPack: SecurityFindingExecutionPack;
  onOpenTrace: (executionId: string) => void;
};

export function SecurityFindingPanel({ executionPack, onOpenTrace }: SecurityFindingPanelProps) {
  const [page, setPage] = useState(0);
  const [selectedFindingId, setSelectedFindingId] = useState<number | null>(null);
  const findings = useSecurityFindings({ executionPack, page, size: DEFAULT_TABLE_PAGE_SIZE });
  const detail = useSecurityFindingDetail(selectedFindingId);
  const totalPages = findings.data ? Math.ceil(findings.data.totalElements / findings.data.size) : 0;
  const findingDistribution = Object.entries(findings.data?.items.reduce<Record<string, number>>((counts, finding) => {
    counts[finding.findingType] = (counts[finding.findingType] ?? 0) + 1;
    return counts;
  }, {}) ?? {}).sort((left, right) => right[1] - left[1]);
  const maxFindingCount = Math.max(1, ...findingDistribution.map(([, count]) => count));

  useEffect(() => {
    setPage(0);
    setSelectedFindingId(null);
  }, [executionPack]);

  return (
    <div className="security-finding-stack">
      <SectionCard
        title="민감정보 탐지 현황"
        description="외부 응답에서 차단된 민감정보를 원문 노출 없이 확인합니다."
        actions={(
          <div className="section-action-group">
            <button className="button button-secondary" type="button" onClick={() => findings.refetch()} disabled={findings.isFetching} title="Security Finding 새로고침">
              <RefreshCw size={14} />새로고침
            </button>
          </div>
        )}
      >
        {findingDistribution.length ? <div className="finding-distribution" aria-label="현재 페이지 민감정보 탐지 유형 분포">
          {findingDistribution.map(([type, count]) => <div key={type}><span>{findingLabels[type] ?? type}</span><i><b style={{ width: `${count / maxFindingCount * 100}%` }} /></i><strong>{count}건</strong></div>)}
        </div> : null}
        <div className={`table-shell security-findings-table-shell${findings.isFetching && !findings.isLoading ? ' is-refreshing' : ''}`} aria-busy={findings.isFetching}>
          <div className="table-head table-security-findings">
            <span>탐지 시각</span><span>업무·목적</span><span>탐지 정보</span><span>검출 기준</span>
          </div>
          {findings.isLoading ? <LoadingPanel label="Security Finding을 불러오는 중입니다" /> : findings.isError ? (
            <ErrorState description={normalizeApiError(findings.error).message} onRetry={() => findings.refetch()} />
          ) : findings.data?.items.length ? findings.data.items.map((item) => (
            <button
              className={`table-row table-security-findings${selectedFindingId === item.findingId ? ' active' : ''}`}
              type="button"
              disabled={findings.isFetching}
              key={item.findingId}
              onClick={() => setSelectedFindingId(item.findingId)}
            >
              <span>{new Date(item.createdAt).toLocaleString('ko-KR')}<small>{item.executionId}</small></span>
              <span>{workloadDisplayName(item.workloadId)}<small>{item.workloadId} · {item.purposeCode}</small></span>
              <StatusBadge tone="danger">{findingLabels[item.findingType] ?? item.findingType}</StatusBadge>
              <span>{item.detectorVersion}</span>
            </button>
          )) : (
            <EmptyState icon={Search} title="탐지된 민감정보가 없습니다" description={`현재 선택한 ${executionPack === 'DIGITAL_ASSET' ? 'Digital Asset' : 'AI · Agent'} 영역에서 확인할 보안 탐지 항목이 없습니다.`} endpoint="GET /api/admin/security-findings" />
          )}
        </div>
        <div className="pagination-row">
          <span>{findings.data ? `${findings.data.totalElements}건 · ${findings.data.page + 1}/${Math.max(totalPages, 1)} 페이지` : '조회 대기'}</span>
          <div>
            <button className="button button-secondary" type="button" disabled={page === 0 || findings.isFetching} onClick={() => setPage(Math.max(0, page - 1))}>이전</button>
            <button className="button button-secondary" type="button" disabled={!totalPages || page + 1 >= totalPages || findings.isFetching} onClick={() => setPage(page + 1)}>다음</button>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="탐지 상세" description="선택한 탐지의 처리 상태와 원문 없는 기술 증적을 확인합니다.">
        {selectedFindingId == null ? (
          <EmptyState icon={ShieldAlert} title="탐지 항목 선택 대기" description="왼쪽 목록에서 확인할 탐지 항목을 선택하세요." />
        ) : detail.isLoading ? <LoadingPanel label="Finding 상세를 불러오는 중입니다" /> : detail.isError ? (
          <ErrorState description={normalizeApiError(detail.error).message} onRetry={() => detail.refetch()} />
        ) : detail.data ? (
          <div className="recovery-detail-stack">
            <KeyValues items={[
              ['관련 실행', detail.data.executionId],
              ['업무 영역', `${workloadDisplayName(detail.data.workloadId)} · ${detail.data.executionPack}`],
              ['탐지 정보', findingLabels[detail.data.findingType] ?? detail.data.findingType],
              ['응답 보호 결과', detail.data.responseGuardStatus],
              ['실행·외부 상태', `${detail.data.runtimeStatus} · ${detail.data.connectorStatus}`],
              ['탐지 위치', `${detail.data.location} · ${detail.data.startOffset}-${detail.data.endOffset}`],
              ['검출 기준 버전', detail.data.detectorVersion],
              ['Trace ID', detail.data.traceId],
              ['증적 Digest', detail.data.evidenceDigest],
            ]} />
            <div className="section-action-group">
              <button className="button button-primary" type="button" onClick={() => onOpenTrace(detail.data.executionId)}>
                <Eye size={14} />Decision Trace
              </button>
            </div>
          </div>
        ) : null}
      </SectionCard>
    </div>
  );
}
