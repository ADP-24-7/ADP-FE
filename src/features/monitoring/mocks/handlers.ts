import { http, HttpResponse } from 'msw';
import type { DashboardSummary } from '../model/types';

const provisionalDashboardSummary: DashboardSummary = {
  requestCount: 1284,
  reviewCount: 37,
  blockCount: 18,
};

export const monitoringHandlers = [
  http.get('/v1/monitoring/overview', () => HttpResponse.json(provisionalDashboardSummary)),
];
