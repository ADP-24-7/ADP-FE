import { KeyRound, RefreshCw, Search, ShieldCheck, UserRound } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { normalizeApiError } from '../../../shared/api/apiError';
import { EmptyState, ErrorState, KeyValues, LoadingPanel, SectionCard, StatusBadge } from '../../../shared/components';
import { useAdminIdentities, useAdminIdentityDetail } from '../hooks/useAdminIdentities';
import type { AdminIdentitySearchParams, AdminPrincipalType } from '../model/types';

const registryStatus = {
  ENABLED: { label: 'WORKLOAD ENABLED', tone: 'success' },
  DISABLED: { label: 'WORKLOAD DISABLED', tone: 'warning' },
  UNRESOLVED: { label: 'REGISTRY UNRESOLVED', tone: 'danger' },
} as const;

export function AdminIdentityPanel() {
  const [query, setQuery] = useState('');
  const [principalType, setPrincipalType] = useState<AdminPrincipalType | ''>('');
  const [role, setRole] = useState('');
  const [workloadId, setWorkloadId] = useState('');
  const [enabled, setEnabled] = useState<'all' | 'true' | 'false'>('all');
  const [params, setParams] = useState<AdminIdentitySearchParams>({ page: 0, size: 20 });
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
      size: 20,
    });
  }

  function reset() {
    setQuery('');
    setPrincipalType('');
    setRole('');
    setWorkloadId('');
    setEnabled('all');
    setSelectedPrincipalId('');
    setParams({ page: 0, size: 20 });
  }

  return (
    <div className="identity-permission-stack">
      <SectionCard
        title="Identity Registry"
        description="현재 권한 범위에서 조회 가능한 사용자와 서비스 Principal을 확인합니다."
        actions={<StatusBadge tone={identities.isSuccess ? 'success' : 'warning'}>{identities.isSuccess ? 'IDENTITY API CONNECTED' : 'IDENTITY API'}</StatusBadge>}
      >
        <form className="identity-filter-grid" onSubmit={submit}>
          <label className="field"><span>Identity</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="이름 또는 Principal ID" /></label>
          <label className="field"><span>Type</span><select value={principalType} onChange={(event) => setPrincipalType(event.target.value as AdminPrincipalType | '')}><option value="">전체</option><option value="USER">USER</option><option value="SERVICE">SERVICE</option></select></label>
          <label className="field"><span>Role</span><input value={role} onChange={(event) => setRole(event.target.value)} placeholder="OPERATOR" /></label>
          <label className="field"><span>Workload</span><input value={workloadId} onChange={(event) => setWorkloadId(event.target.value)} placeholder="customer_summary" /></label>
          <label className="field"><span>Status</span><select value={enabled} onChange={(event) => setEnabled(event.target.value as 'all' | 'true' | 'false')}><option value="all">전체</option><option value="true">활성</option><option value="false">비활성</option></select></label>
          <div className="search-filter-actions">
            <button className="button button-primary" type="submit" disabled={identities.isFetching}><Search size={14} />검색</button>
            <button className="button button-secondary" type="button" disabled={identities.isFetching} onClick={reset} title="검색 조건 초기화"><RefreshCw size={14} /></button>
          </div>
        </form>

        <div className="table-shell identity-table-shell" aria-busy={identities.isFetching}>
          <div className="table-head table-identities">
            <span>IDENTITY</span><span>TYPE</span><span>ROLES</span><span>WORKLOADS</span><span>API KEYS</span><span>STATUS</span>
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
              <StatusBadge tone={item.principalType === 'SERVICE' ? 'purple' : 'info'}>{item.principalType}</StatusBadge>
              <span>{item.roles.join(', ') || '—'}</span>
              <span>{item.workloadIds.join(', ') || '—'}</span>
              <span>{item.enabledApiKeyCount} / {item.totalApiKeyCount}</span>
              <StatusBadge tone={item.enabled ? 'success' : 'neutral'}>{item.enabled ? 'ENABLED' : 'DISABLED'}</StatusBadge>
            </button>
          )) : <EmptyState icon={UserRound} title="조회 가능한 Identity가 없습니다" description="현재 Institution과 검색 조건에 해당하는 Principal이 없습니다." endpoint="GET /api/admin/identities" />}
        </div>
        <div className="pagination-row">
          <span>{identities.data ? `${identities.data.totalElements}건 · ${identities.data.page + 1}/${Math.max(totalPages, 1)} 페이지` : '조회 대기'}</span>
          <div>
            <button className="button button-secondary" type="button" disabled={(params.page ?? 0) === 0 || identities.isFetching} onClick={() => { setSelectedPrincipalId(''); setParams((value) => ({ ...value, page: Math.max(0, (value.page ?? 0) - 1) })); }}>이전</button>
            <button className="button button-secondary" type="button" disabled={!totalPages || (params.page ?? 0) + 1 >= totalPages || identities.isFetching} onClick={() => { setSelectedPrincipalId(''); setParams((value) => ({ ...value, page: (value.page ?? 0) + 1 })); }}>다음</button>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Permission Detail" description="역할, Workload, Purpose와 Action 단위의 유효 권한을 확인합니다.">
        {!selectedPrincipalId ? <EmptyState icon={KeyRound} title="Identity 선택 대기" description="위 목록에서 확인할 사용자 또는 서비스 Principal을 선택하세요." /> : detail.isLoading ? (
          <LoadingPanel label="Identity 권한을 불러오는 중입니다" />
        ) : detail.isError ? (
          <ErrorState description={normalizeApiError(detail.error).message} onRetry={() => detail.refetch()} />
        ) : detail.data ? (
          <div className="identity-detail-stack">
            <KeyValues items={[
              ['Principal', `${detail.data.identity.displayName} · ${detail.data.identity.principalId}`],
              ['Institution', detail.data.identity.institutionId],
              ['Type / Status', `${detail.data.identity.principalType} · ${detail.data.identity.enabled ? 'ENABLED' : 'DISABLED'}`],
              ['Roles', detail.data.identity.roles.join(', ') || '—'],
              ['Visible Workloads', detail.data.identity.workloadIds.join(', ') || '—'],
              ['Subject Authorization', detail.data.identity.subjectAuthorizationRequired ? 'REQUIRED' : 'NOT REQUIRED'],
              ['Enabled API Keys', `${detail.data.identity.enabledApiKeyCount} / ${detail.data.identity.totalApiKeyCount}`],
            ]} />
            <div className="permission-table-shell table-shell">
              <div className="table-head table-permissions"><span>WORKLOAD</span><span>ACTION</span><span>PURPOSE</span><span>SUBJECT SCOPE</span><span>STATUS</span></div>
              {detail.data.permissions.length ? detail.data.permissions.map((permission) => (
                <div className="table-row table-permissions" key={`${permission.workloadId}:${permission.actionName}:${permission.purpose}:${permission.subjectType}`}>
                  <span><strong>{permission.workloadName}</strong><code>{permission.workloadId}</code></span>
                  <code>{permission.actionName}</code>
                  <span>{permission.purpose}</span>
                  <span>{permission.subjectType}<small>{permission.subjectGrantCount} scoped grant</small></span>
                  <StatusBadge tone={registryStatus[permission.workloadRegistryStatus].tone}>{registryStatus[permission.workloadRegistryStatus].label}</StatusBadge>
                </div>
              )) : <EmptyState compact title="Purpose 권한이 없습니다" description="Role과 Workload 매핑은 존재하지만 Subject/Purpose grant는 없습니다." />}
            </div>
          </div>
        ) : null}
      </SectionCard>
    </div>
  );
}
