import { httpClient } from '../../../shared/api/httpClient';

export type BackendReadiness = {
  status: string;
};

export async function getBackendReadiness() {
  const response = await httpClient.get<BackendReadiness>('/actuator/health/readiness');
  return response.data;
}
