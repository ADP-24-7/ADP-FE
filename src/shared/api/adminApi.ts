import { env } from '../config/env';
import { mockAdminApi } from '../mocks/adminMock';
import { httpClient } from './httpClient';

export type DashboardSummary = {
  requestCount: number;
  reviewCount: number;
  blockCount: number;
};

export async function getDashboardSummary(): Promise<DashboardSummary> {
  if (env.apiMode === 'mock') {
    return mockAdminApi.getDashboardSummary();
  }

  const response = await httpClient.get<DashboardSummary>('/api/admin/dashboard/summary');
  return response.data;
}
