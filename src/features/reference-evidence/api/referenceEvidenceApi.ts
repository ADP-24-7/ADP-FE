import { httpClient } from '../../../shared/api/httpClient';
import type { ReferenceEvidence, ReferenceEvidencePage, ReferenceEvidencePolicyLineage, ReferenceEvidenceSearch } from '../model/types';

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

export async function getPolicyRegulatoryEvidence(artifactId: string, artifactVersion: string) {
  const response = await httpClient.get<ReferenceEvidencePolicyLineage[]>(
    `/api/admin/reference-evidence/policy-artifacts/${encodeURIComponent(artifactId)}/versions/${encodeURIComponent(artifactVersion)}`,
  );
  return response.data;
}

