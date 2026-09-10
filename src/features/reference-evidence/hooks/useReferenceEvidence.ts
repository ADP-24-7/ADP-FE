import { useQuery } from '@tanstack/react-query';
import { getReferenceEvidence, getReferenceEvidenceDetail } from '../api/referenceEvidenceApi';
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
