import { httpClient } from '../../../shared/api/httpClient';
import type { RuntimeExecution, RuntimeExecutionRequest, RuntimeExecutionTrace } from '../model/types';

export async function createRuntimeExecution(request: RuntimeExecutionRequest): Promise<RuntimeExecution> {
  const response = await httpClient.post<RuntimeExecution>('/v1/runtime/executions', request);
  return response.data;
}

export async function getRuntimeExecution(executionId: string): Promise<RuntimeExecution> {
  const response = await httpClient.get<RuntimeExecution>(`/v1/runtime/executions/${executionId}`);
  return response.data;
}

export async function getRuntimeExecutionTrace(executionId: string): Promise<RuntimeExecutionTrace> {
  const response = await httpClient.get<RuntimeExecutionTrace>(`/v1/runtime/executions/${executionId}/trace`);
  return response.data;
}
