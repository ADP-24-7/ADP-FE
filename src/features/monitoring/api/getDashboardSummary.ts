import { httpClient } from '../../../shared/api/httpClient';
import type { DashboardSummary } from '../model/types';

export async function getDashboardSummary(): Promise<DashboardSummary> {
  const response = await httpClient.get<DashboardSummary>('/api/admin/dashboard/summary');
  return response.data;
}
