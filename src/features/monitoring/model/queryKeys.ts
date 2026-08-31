export const monitoringQueryKeys = {
  all: ['monitoring'] as const,
  dashboardSummary: () => [...monitoringQueryKeys.all, 'dashboard-summary'] as const,
};
