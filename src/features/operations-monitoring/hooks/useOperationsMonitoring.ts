import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { getOperationsSummary, getPolicyOperationEvents } from '../api/operationsMonitoringApi';
import type { PolicyOperationEventParams } from '../model/types';

export const operationsMonitoringKeys = {
  all: ['operations-monitoring'] as const,
  summary: (windowMinutes: number) => [...operationsMonitoringKeys.all, 'summary', windowMinutes] as const,
  policyEvents: (params: PolicyOperationEventParams) => [...operationsMonitoringKeys.all, 'policy-events', params] as const,
};

export function useOperationsSummary(windowMinutes = 60) {
  return useQuery({
    queryKey: operationsMonitoringKeys.summary(windowMinutes),
    queryFn: () => getOperationsSummary(windowMinutes),
    retry: false,
    refetchInterval: 30_000,
  });
}

export function usePolicyOperationEvents(params: PolicyOperationEventParams) {
  return useQuery({
    queryKey: operationsMonitoringKeys.policyEvents(params),
    queryFn: () => getPolicyOperationEvents(params),
    retry: false,
    placeholderData: keepPreviousData,
  });
}
