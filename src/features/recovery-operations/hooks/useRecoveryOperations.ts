import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { operationsMonitoringKeys } from '../../operations-monitoring';
import { getRecoveryIncident, getRecoveryIncidents, runRecoveryCommand } from '../api/recoveryOperationsApi';
import type { RecoveryOperationType, RecoverySearchParams } from '../model/types';

export const recoveryOperationsKeys = {
  all: ['recovery-operations'] as const,
  lists: () => [...recoveryOperationsKeys.all, 'list'] as const,
  list: (params: RecoverySearchParams) => [...recoveryOperationsKeys.lists(), params] as const,
  details: () => [...recoveryOperationsKeys.all, 'detail'] as const,
  detail: (recoveryId: string) => [...recoveryOperationsKeys.details(), recoveryId] as const,
};

export function useRecoveryIncidents(params: RecoverySearchParams) {
  return useQuery({
    queryKey: recoveryOperationsKeys.list(params),
    queryFn: () => getRecoveryIncidents(params),
    retry: false,
    placeholderData: keepPreviousData,
  });
}

export function useRecoveryIncident(recoveryId: string) {
  return useQuery({
    queryKey: recoveryOperationsKeys.detail(recoveryId),
    queryFn: () => getRecoveryIncident(recoveryId),
    enabled: recoveryId.length > 0,
    retry: false,
  });
}

export function useRecoveryCommand() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ recoveryId, operationType, operationId }: {
      recoveryId: string;
      operationType: RecoveryOperationType;
      operationId: string;
    }) => runRecoveryCommand(recoveryId, operationType, operationId),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: recoveryOperationsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: recoveryOperationsKeys.detail(result.recoveryId) });
      queryClient.invalidateQueries({ queryKey: operationsMonitoringKeys.all });
    },
  });
}
