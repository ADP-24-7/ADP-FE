import { httpClient } from '../../../shared/api/httpClient';
import type {
  RecoveryCommandResult,
  RecoveryIncidentDetail,
  RecoveryIncidentPage,
  RecoveryOperationType,
  RecoverySearchParams,
} from '../model/types';

const commandPaths: Record<RecoveryOperationType, string> = {
  RECONCILE: 'reconcile',
  RETRY: 'retry',
  MARK_REVIEW: 'review',
};

export async function getRecoveryIncidents(params: RecoverySearchParams = {}) {
  const response = await httpClient.get<RecoveryIncidentPage>('/api/admin/recovery/incidents', { params });
  return response.data;
}

export async function getRecoveryIncident(recoveryId: string, executionPack?: string) {
  const response = await httpClient.get<RecoveryIncidentDetail>(
    `/api/admin/recovery/incidents/${encodeURIComponent(recoveryId)}`,
    { params: { executionPack } },
  );
  return response.data;
}

export async function runRecoveryCommand(
  recoveryId: string,
  operationType: RecoveryOperationType,
  operationId: string,
  executionPack?: string,
) {
  const response = await httpClient.post<RecoveryCommandResult>(
    `/api/admin/recovery/incidents/${encodeURIComponent(recoveryId)}/${commandPaths[operationType]}`,
    { operationId },
    { params: { executionPack } },
  );
  return response.data;
}
