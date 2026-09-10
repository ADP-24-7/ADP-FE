import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { operationsMonitoringKeys } from '../../operations-monitoring';
import { getRecoveryIncident, getRecoveryIncidents, runRecoveryCommand } from '../api/recoveryOperationsApi';
import type { RecoveryOperationType, RecoverySearchParams } from '../model/types';
import type { ExecutionPackApiValue } from '../../../shared/prototype';

export const recoveryOperationsKeys = {
  all: ['recovery-operations'] as const,
  lists: () => [...recoveryOperationsKeys.all, 'list'] as const,
  list: (params: RecoverySearchParams) => [...recoveryOperationsKeys.lists(), params] as const,
  details: () => [...recoveryOperationsKeys.all, 'detail'] as const,
  detail: (recoveryId: string, executionPack?: ExecutionPackApiValue) =>
    [...recoveryOperationsKeys.details(), recoveryId, executionPack ?? 'ALL'] as const,
};

export function useRecoveryIncidents(params: RecoverySearchParams) {
  return useQuery({
    queryKey: recoveryOperationsKeys.list(params),
    queryFn: () => getRecoveryIncidents(params),
    placeholderData: (previous) => previous,
    retry: false,
  });
}

export function useRecoveryIncident(recoveryId: string, executionPack?: ExecutionPackApiValue) {
  return useQuery({
    queryKey: recoveryOperationsKeys.detail(recoveryId, executionPack),
    queryFn: () => getRecoveryIncident(recoveryId, executionPack),
    enabled: recoveryId.length > 0,
    retry: false,
  });
}

export function useRecoveryCommand() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ recoveryId, operationType, operationId, executionPack }: {
      recoveryId: string;
      operationType: RecoveryOperationType;
      operationId: string;
      executionPack?: ExecutionPackApiValue;
    }) => runRecoveryCommand(recoveryId, operationType, operationId, executionPack),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: recoveryOperationsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: recoveryOperationsKeys.details() });
      queryClient.invalidateQueries({ queryKey: operationsMonitoringKeys.all });
    },
  });
}
