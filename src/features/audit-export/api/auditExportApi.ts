import { httpClient } from '../../../shared/api/httpClient';
import type { AuditExportDetail, AuditExportJob, CreateAuditExportRequest } from '../model/types';

export async function createAuditExport(request: CreateAuditExportRequest) {
  const response = await httpClient.post<AuditExportJob>('/api/v1/audit-exports', request);
  return response.data;
}

export async function getAuditExport(exportId: string) {
  const response = await httpClient.get<AuditExportDetail>(`/api/v1/audit-exports/${encodeURIComponent(exportId)}`);
  return response.data;
}

export async function decideAuditExport(exportId: string, action: 'APPROVE' | 'REJECT' | 'REVOKE', reason: string) {
  const response = await httpClient.post<AuditExportJob>(
    `/api/v1/audit-exports/${encodeURIComponent(exportId)}/approval`,
    { action, reason },
  );
  return response.data;
}

export async function downloadAuditExport(exportId: string) {
  const response = await httpClient.get<Blob>(
    `/api/v1/audit-exports/${encodeURIComponent(exportId)}/download`,
    { responseType: 'blob' },
  );
  const disposition = response.headers['content-disposition'] as string | undefined;
  const fileName = disposition?.match(/filename="?([^";]+)"?/i)?.[1] ?? `adp-evidence-${exportId}`;
  return { blob: response.data, fileName };
}
