import { KeyRound, RefreshCw, Search, ShieldCheck, UserRound } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { normalizeApiError } from '../../../shared/api/apiError';
import { EmptyState, ErrorState, KeyValues, LoadingPanel, SectionCard, StatusBadge } from '../../../shared/components';
import { DEFAULT_TABLE_PAGE_SIZE } from '../../../shared/config/pagination';
import { workloadDisplayName } from '../../../shared/config/adminLabels';
import { useAdminIdentities, useAdminIdentityDetail } from '../hooks/useAdminIdentities';
import type { AdminIdentitySearchParams, AdminPrincipalType } from '../model/types';

const registryStatus = {
  ENABLED: { label: '사용 가능', tone: 'success' },
  DISABLED: { label: '업무 중지', tone: 'warning' },
  UNRESOLVED: { label: '등록 확인 필요', tone: 'danger' },
} as const;

const roleLabels: Record<string, string> = {
  OPERATOR: '운영 담당자', PRIVILEGED_OPERATOR: '승인 담당자', AUDITOR: '감사 담당자',
  BUSINESS_OWNER: '업무 책임자', SECURITY_REVIEWER: '보안 검토자', PRIVACY_REVIEWER: '개인정보 검토자',
  RUNTIME_EXECUTOR: '실행 서비스', METRICS_SCRAPER: '지표 수집 서비스',
};

const actionLabels: Record<string, string> = {
  READ: '조회', ANALYZE: '분석', DRAFT: '초안 작성', VERIFY: '검증', SUBMIT: '외부 실행', RECONCILE: '상태 조정',
};

function readableRoles(roles: string[]) {
  return roles.map((role) => roleLabels[role] ?? role).join(', ') || '권한 없음';
}

export function AdminIdentityPanel() {
  const [query, setQuery] = useState('');
  const [principalType, setPrincipalType] = useState<AdminPrincipalType | ''>('');
  const [role, setRole] = useState('');
  const [workloadId, setWorkloadId] = useState('');
  const [enabled, setEnabled] = useState<'all' | 'true' | 'false'>('all');
  const [params, setParams] = useState<AdminIdentitySearchParams>({ page: 0, size: DEFAULT_TABLE_PAGE_SIZE });
  const [selectedPrincipalId, setSelectedPrincipalId] = useState('');
  const identities = useAdminIdentities(params);
  const detail = useAdminIdentityDetail(selectedPrincipalId);
  const totalPages = identities.data ? Math.ceil(identities.data.totalElements / identities.data.size) : 0;

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSelectedPrincipalId('');
    setParams({
      query: query.trim() || undefined,
      principalType: principalType || undefined,
      role: role.trim() || undefined,
      workloadId: workloadId.trim() || undefined,
      enabled: enabled === 'all' ? undefined : enabled === 'true',
      page: 0,
      size: DEFAULT_TABLE_PAGE_SIZE,
    });
  }

  function reset() {
    setQuery('');
    setPrincipalType('');
    setRole('');
    setWorkloadId('');
    setEnabled('all');
    setSelectedPrincipalId('');
    setParams({ page: 0, size: DEFAULT_TABLE_PAGE_SIZE });
  }

  return (
    <div className="identity-permission-stack">
      <SectionCard
        title="사용자 및 서비스 권한"
        description="현재 기관에서 접근 가능한 사용자와 실행 서비스의 권한 상태를 확인합니다."
      >
        <form className="identity-filter-grid" onSubmit={submit}>
          <label className="field"><span>사용자·서비스</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="이름 또는 계정 ID" /></label>
          <label className="field"><span>유형</span><select value={principalType} onChange={(event) => setPrincipalType(event.target.value as AdminPrincipalType | '')}><option value="">전체</option><option value="USER">사용자</option><option value="SERVICE">실행 서비스</option></select></label>
          <label className="field"><span>역할</span><input value={role} onChange={(event) => setRole(event.target.value)} placeholder="예: 운영 담당자" /></label>
          <label className="field"><span>접근 업무</span><input value={workloadId} onChange={(event) => setWorkloadId(event.target.value)} placeholder="업무 ID" /></label>
          <label className="field"><span>계정 상태</span><select value={enabled} onChange={(event) => setEnabled(event.target.value as 'all' | 'true' | 'false')}><option value="all">전체</option><option value="true">활성</option><option value="false">비활성</option></select></label>
          <div className="search-filter-actions">
            <button className="button button-primary" type="submit" disabled={identities.isFetching}><Search size={14} />검색</button>
            <button className="button button-secondary" type="button" disabled={identities.isFetching} onClick={reset} title="검색 조건 초기화"><RefreshCw size={14} /></button>
          </div>
        </form>

        <div className={`table-shell identity-table-shell${identities.isFetching && !identities.isLoading ? ' is-refreshing' : ''}`} aria-busy={identities.isFetching}>
          <div className="table-head table-identities">
            <span>사용자·서비스</span><span>유형</span><span>역할</span><span>접근 업무</span><span>API 키</span><span>계정 상태</span>
          </div>
          {identities.isLoading ? <LoadingPanel label="Identity 목록을 불러오는 중입니다" /> : identities.isError ? (
            normalizeApiError(identities.error).status === 403
              ? <EmptyState icon={ShieldCheck} title="Identity 조회 권한이 없습니다" description="현재 Principal에는 Identity Registry 조회 권한이 없습니다." />
              : <ErrorState description={normalizeApiError(identities.error).message} onRetry={() => identities.refetch()} />
          ) : identities.data?.items.length ? identities.data.items.map((item) => (
            <button
              className={`table-row table-identities${selectedPrincipalId === item.principalId ? ' active' : ''}`}
              type="button"
              key={item.principalId}
              disabled={identities.isFetching}
              onClick={() => setSelectedPrincipalId(item.principalId)}
            >
              <span><strong>{item.displayName}</strong><code>{item.principalId}</code></span>
              <StatusBadge tone={item.principalType === 'SERVICE' ? 'purple' : 'info'}>{item.principalType === 'SERVICE' ? '실행 서비스' : '사용자'}</StatusBadge>
              <span>{readableRoles(item.roles)}</span>
              <span>{item.workloadIds.map(workloadDisplayName).join(', ') || '접근 업무 없음'}</span>
              <span>{item.enabledApiKeyCount} / {item.totalApiKeyCount}</span>
              <StatusBadge tone={item.enabled ? 'success' : 'neutral'}>{item.enabled ? '활성' : '비활성'}</StatusBadge>
            </button>
          )) : <EmptyState icon={UserRound} title="조회 가능한 Identity가 없습니다" description="현재 Institution과 검색 조건에 해당하는 Principal이 없습니다." endpoint="GET /api/admin/identities" />}
        </div>
        <div className="pagination-row">
          <span>{identities.data ? `${identities.data.totalElements}건 · ${identities.data.page + 1}/${Math.max(totalPages, 1)} 페이지` : '조회 대기'}</span>
          <div>
            <button className="button button-secondary" type="button" disabled={(params.page ?? 0) === 0 || identities.isFetching} onClick={() => setParams((value) => ({ ...value, page: Math.max(0, (value.page ?? 0) - 1) }))}>이전</button>
            <button className="button button-secondary" type="button" disabled={!totalPages || (params.page ?? 0) + 1 >= totalPages || identities.isFetching} onClick={() => setParams((value) => ({ ...value, page: (value.page ?? 0) + 1 }))}>다음</button>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="권한 상세" description="선택한 계정의 역할과 업무별 허용 범위를 확인합니다.">
        {!selectedPrincipalId ? <EmptyState icon={KeyRound} title="Identity 선택 대기" description="위 목록에서 확인할 사용자 또는 서비스 Principal을 선택하세요." /> : detail.isLoading ? (
          <LoadingPanel label="Identity 권한을 불러오는 중입니다" />
        ) : detail.isError ? (
          <ErrorState description={normalizeApiError(detail.error).message} onRetry={() => detail.refetch()} />
        ) : detail.data ? (
          <div className="identity-detail-stack">
            <KeyValues items={[
              ['계정', `${detail.data.identity.displayName} · ${detail.data.identity.principalId}`],
              ['기관', detail.data.identity.institutionId],
              ['유형·상태', `${detail.data.identity.principalType === 'SERVICE' ? '실행 서비스' : '사용자'} · ${detail.data.identity.enabled ? '활성' : '비활성'}`],
              ['역할', readableRoles(detail.data.identity.roles)],
              ['접근 가능 업무', detail.data.identity.workloadIds.map(workloadDisplayName).join(', ') || '없음'],
              ['대상별 추가 승인', detail.data.identity.subjectAuthorizationRequired ? '필요' : '불필요'],
              ['활성 API 키', `${detail.data.identity.enabledApiKeyCount} / ${detail.data.identity.totalApiKeyCount}`],
            ]} />
            <div className="permission-table-shell table-shell">
              <div className="table-head table-permissions"><span>업무</span><span>허용 작업</span><span>사용 목적</span><span>대상 범위</span><span>적용 상태</span></div>
              {detail.data.permissions.length ? detail.data.permissions.map((permission) => (
                <div className="table-row table-permissions" key={`${permission.workloadId}:${permission.actionName}:${permission.purpose}:${permission.subjectType}`}>
                  <span><strong>{permission.workloadName}</strong><code>{permission.workloadId}</code></span>
                  <span>{actionLabels[permission.actionName] ?? permission.actionName}<small>{permission.actionName}</small></span>
                  <span>{permission.purpose}</span>
                  <span>{permission.subjectType}<small>대상 승인 {permission.subjectGrantCount}건</small></span>
                  <StatusBadge tone={registryStatus[permission.workloadRegistryStatus].tone}>{registryStatus[permission.workloadRegistryStatus].label}</StatusBadge>
                </div>
              )) : <EmptyState compact title="사용 목적 권한이 없습니다" description="역할과 업무는 연결되어 있지만 대상별 사용 목적 승인이 없습니다." />}
            </div>
          </div>
        ) : null}
      </SectionCard>
    </div>
  );
}
