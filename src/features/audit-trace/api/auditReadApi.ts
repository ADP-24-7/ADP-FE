import { httpClient } from '../../../shared/api/httpClient';
import type { AuditExecutionPage, AuditSearchParams, ExecutionEvidencePack } from '../model/types';

export async function searchAuditExecutions(params: AuditSearchParams = {}) {
  const response = await httpClient.get<AuditExecutionPage>('/api/admin/audit/executions', { params });
  return response.data;
}

export async function getExecutionEvidence(executionId: string) {
  const response = await httpClient.get<ExecutionEvidencePack>(`/api/admin/audit/executions/${encodeURIComponent(executionId)}/evidence`);
  return response.data;
}
