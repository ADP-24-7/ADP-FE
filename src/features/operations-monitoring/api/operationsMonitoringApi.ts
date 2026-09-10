import { httpClient } from '../../../shared/api/httpClient';
import type { OperationsSummary, PolicyOperationEventPage, PolicyOperationEventParams } from '../model/types';

export async function getOperationsSummary(windowMinutes = 60, executionPack?: string) {
  const response = await httpClient.get<OperationsSummary>('/api/admin/operations/summary', {
    params: { windowMinutes, executionPack },
  });
  return response.data;
}

export async function getPolicyOperationEvents(params: PolicyOperationEventParams = {}) {
  const response = await httpClient.get<PolicyOperationEventPage>('/api/admin/operations/policy-events', {
    params,
  });
  return response.data;
}
