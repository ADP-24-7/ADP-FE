import { http, HttpResponse } from 'msw';
import type { DashboardSummary } from '../../features/monitoring';

const dashboardSummary: DashboardSummary = {
  requestCount: 1284,
  reviewCount: 37,
  blockCount: 18,
};

export const handlers = [
  http.get('/api/admin/dashboard/summary', () => HttpResponse.json(dashboardSummary)),
];
