import { httpClient } from '../../../shared/api/httpClient';
import type { ReferenceEvidence, ReferenceEvidencePage, ReferenceEvidenceSearch } from '../model/types';

export async function getReferenceEvidence(params: ReferenceEvidenceSearch) {
  const response = await httpClient.get<ReferenceEvidencePage>('/api/admin/reference-evidence', { params });
  return response.data;
}

export async function getReferenceEvidenceDetail(evidenceId: string, evidenceVersion: string) {
  const response = await httpClient.get<ReferenceEvidence>(
    `/api/admin/reference-evidence/${encodeURIComponent(evidenceId)}/versions/${encodeURIComponent(evidenceVersion)}`,
  );
  return response.data;
}

