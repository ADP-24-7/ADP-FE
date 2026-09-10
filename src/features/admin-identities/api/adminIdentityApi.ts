import { httpClient } from '../../../shared/api/httpClient';
import type { AdminIdentityDetail, AdminIdentityPage, AdminIdentitySearchParams } from '../model/types';

export async function getAdminIdentities(params: AdminIdentitySearchParams = {}) {
  const response = await httpClient.get<AdminIdentityPage>('/api/admin/identities', { params });
  return response.data;
}

export async function getAdminIdentityDetail(principalId: string) {
  const response = await httpClient.get<AdminIdentityDetail>(`/api/admin/identities/${encodeURIComponent(principalId)}`);
  return response.data;
}
