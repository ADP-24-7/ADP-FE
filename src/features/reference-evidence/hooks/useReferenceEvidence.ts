import { useQuery } from '@tanstack/react-query';
import { getPolicyRegulatoryEvidence, getReferenceEvidence, getReferenceEvidenceDetail } from '../api/referenceEvidenceApi';
import type { ReferenceEvidenceSearch } from '../model/types';

export function useReferenceEvidence(params: ReferenceEvidenceSearch) {
  return useQuery({
    queryKey: ['reference-evidence', 'list', params],
    queryFn: () => getReferenceEvidence(params),
    placeholderData: (previous) => previous,
    retry: false,
  });
}

export function useReferenceEvidenceDetail(evidenceId: string, evidenceVersion: string) {
  return useQuery({
    queryKey: ['reference-evidence', 'detail', evidenceId, evidenceVersion],
    queryFn: () => getReferenceEvidenceDetail(evidenceId, evidenceVersion),
    enabled: Boolean(evidenceId && evidenceVersion),
    retry: false,
  });
}

export function usePolicyRegulatoryEvidence(artifactId: string, artifactVersion: string) {
  return useQuery({
    queryKey: ['reference-evidence', 'policy-lineage', artifactId, artifactVersion],
    queryFn: () => getPolicyRegulatoryEvidence(artifactId, artifactVersion),
    enabled: Boolean(artifactId && artifactVersion),
    retry: false,
  });
}
