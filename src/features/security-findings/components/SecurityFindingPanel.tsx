import { Eye, RefreshCw, Search, ShieldAlert } from 'lucide-react';
import { useEffect, useState } from 'react';
import { normalizeApiError } from '../../../shared/api/apiError';
import { EmptyState, ErrorState, KeyValues, LoadingPanel, SectionCard, StatusBadge } from '../../../shared/components';
import { useSecurityFindingDetail, useSecurityFindings } from '../hooks/useSecurityFindings';
import type { SecurityFindingExecutionPack } from '../model/types';

const findingLabels: Record<string, string> = {
  PHONE_NUMBER: '전화번호',
  EMAIL: '이메일',
  ACCOUNT_NUMBER: '계좌번호',
  RESIDENT_REGISTRATION_NUMBER: '주민등록번호',
  NAME: '이름',
};

type SecurityFindingPanelProps = {
  executionPack: SecurityFindingExecutionPack;
  onOpenTrace: (executionId: string) => void;
};

export function SecurityFindingPanel({ executionPack, onOpenTrace }: SecurityFindingPanelProps) {
  const [page, setPage] = useState(0);
  const [selectedFindingId, setSelectedFindingId] = useState<number | null>(null);
  const findings = useSecurityFindings({ executionPack, page, size: 20 });
  const detail = useSecurityFindingDetail(selectedFindingId);
  const totalPages = findings.data ? Math.ceil(findings.data.totalElements / findings.data.size) : 0;

  useEffect(() => {
    setPage(0);
    setSelectedFindingId(null);
  }, [executionPack]);

  return (
    <div className="security-finding-stack">
      <SectionCard
        title="Security Findings"
        description="Provider 응답에서 차단된 민감정보 Finding을 원문 없이 탐색합니다."
        actions={(
          <div className="section-action-group">
            <button className="button button-secondary" type="button" onClick={() => findings.refetch()} disabled={findings.isFetching} title="Security Finding 새로고침">
              <RefreshCw size={14} />새로고침
            </button>
          </div>
        )}
      >
        <div className="table-shell security-findings-table-shell" aria-busy={findings.isFetching}>
          <div className="table-head table-security-findings">
            <span>DETECTED</span><span>EXECUTION</span><span>WORKLOAD</span><span>TYPE</span><span>LOCATION</span><span>DETECTOR</span>
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
              <span>{new Date(item.createdAt).toLocaleString('ko-KR')}</span>
              <span><code>{item.executionId}</code><small>{item.executionPack}</small></span>
              <span>{item.workloadId}<small>{item.purposeCode}</small></span>
              <StatusBadge tone="danger">{findingLabels[item.findingType] ?? item.findingType}</StatusBadge>
              <span><code>{item.location}</code></span>
              <span>{item.detectorVersion}</span>
            </button>
          )) : (
            <EmptyState icon={Search} title="탐지된 민감정보가 없습니다" description={`현재 선택한 ${executionPack === 'DIGITAL_ASSET' ? 'Digital Asset' : 'AI · Agent'} 영역에서 확인할 보안 탐지 항목이 없습니다.`} endpoint="GET /api/admin/security-findings" />
          )}
        </div>
        <div className="pagination-row">
          <span>{findings.data ? `${findings.data.totalElements}건 · ${findings.data.page + 1}/${Math.max(totalPages, 1)} 페이지` : '조회 대기'}</span>
          <div>
            <button className="button button-secondary" type="button" disabled={page === 0 || findings.isFetching} onClick={() => { setPage(Math.max(0, page - 1)); setSelectedFindingId(null); }}>이전</button>
            <button className="button button-secondary" type="button" disabled={!totalPages || page + 1 >= totalPages || findings.isFetching} onClick={() => { setPage(page + 1); setSelectedFindingId(null); }}>다음</button>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Finding Detail" description="원문 대신 위치, 오프셋, 검출기 버전과 Evidence Digest를 확인합니다.">
        {selectedFindingId == null ? (
          <EmptyState icon={ShieldAlert} title="Finding 선택 대기" description="위 목록에서 Finding을 선택하세요." />
        ) : detail.isLoading ? <LoadingPanel label="Finding 상세를 불러오는 중입니다" /> : detail.isError ? (
          <ErrorState description={normalizeApiError(detail.error).message} onRetry={() => detail.refetch()} />
        ) : detail.data ? (
          <div className="recovery-detail-stack">
            <KeyValues items={[
              ['Execution ID', detail.data.executionId],
              ['Trace ID', detail.data.traceId],
              ['Pack / Workload', `${detail.data.executionPack} · ${detail.data.workloadId}`],
              ['Finding Type', findingLabels[detail.data.findingType] ?? detail.data.findingType],
              ['Location / Offset', `${detail.data.location} · ${detail.data.startOffset}-${detail.data.endOffset}`],
              ['Detector Version', detail.data.detectorVersion],
              ['Evidence Digest', detail.data.evidenceDigest],
              ['Runtime / Connector', `${detail.data.runtimeStatus} · ${detail.data.connectorStatus}`],
              ['Response Guard', detail.data.responseGuardStatus],
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
