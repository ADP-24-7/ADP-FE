import { useQuery } from '@tanstack/react-query';
import { getExecutionEvidence, searchAuditExecutions } from '../api/auditReadApi';
import type { AuditSearchParams } from '../model/types';

export function useAuditExecutions(params: AuditSearchParams, enabled = true) {
  return useQuery({
    queryKey: ['audit-executions', params],
    queryFn: () => searchAuditExecutions(params),
    enabled,
    placeholderData: (previous) => previous,
  });
}

export function useExecutionEvidence(executionId: string) {
  return useQuery({
    queryKey: ['execution-evidence', executionId],
    queryFn: () => getExecutionEvidence(executionId),
    enabled: executionId.length > 0,
    retry: false,
  });
}
