import { httpClient } from '../../../shared/api/httpClient';
import type { SecurityFindingDetail, SecurityFindingPage, SecurityFindingSearchParams } from '../model/types';

export async function getSecurityFindings(params: SecurityFindingSearchParams = {}) {
  const response = await httpClient.get<SecurityFindingPage>('/api/admin/security-findings', { params });
  return response.data;
}

export async function getSecurityFindingDetail(findingId: number) {
  const response = await httpClient.get<SecurityFindingDetail>(`/api/admin/security-findings/${findingId}`);
  return response.data;
}
