import { httpClient } from '../../../shared/api/httpClient';
import type { DashboardSummary } from '../model/types';

export async function getDashboardSummary(): Promise<DashboardSummary> {
  const response = await httpClient.get<DashboardSummary>('/v1/monitoring/overview');
  return response.data;
}
