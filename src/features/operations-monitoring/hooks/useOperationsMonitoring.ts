import { useQuery } from '@tanstack/react-query';
import { getOperationsSummary, getPolicyOperationEvents } from '../api/operationsMonitoringApi';
import type { PolicyOperationEventParams } from '../model/types';
import type { ExecutionPackApiValue } from '../../../shared/prototype';

export const operationsMonitoringKeys = {
  all: ['operations-monitoring'] as const,
  summary: (windowMinutes: number, executionPack?: ExecutionPackApiValue) =>
    [...operationsMonitoringKeys.all, 'summary', windowMinutes, executionPack ?? 'ALL'] as const,
  policyEvents: (params: PolicyOperationEventParams) => [...operationsMonitoringKeys.all, 'policy-events', params] as const,
};

export function useOperationsSummary(windowMinutes = 60, executionPack?: ExecutionPackApiValue) {
  return useQuery({
    queryKey: operationsMonitoringKeys.summary(windowMinutes, executionPack),
    queryFn: () => getOperationsSummary(windowMinutes, executionPack),
    retry: false,
    refetchInterval: 30_000,
  });
}

export function usePolicyOperationEvents(params: PolicyOperationEventParams) {
  return useQuery({
    queryKey: operationsMonitoringKeys.policyEvents(params),
    queryFn: () => getPolicyOperationEvents(params),
    placeholderData: (previous) => previous,
    retry: false,
  });
}
