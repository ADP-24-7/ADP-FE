import type { DashboardSummary } from '../api/adminApi';

export const mockAdminApi = {
  async getDashboardSummary(): Promise<DashboardSummary> {
    return {
      requestCount: 1284,
      reviewCount: 37,
      blockCount: 18,
    };
  },
};
