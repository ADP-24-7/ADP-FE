import { useQuery } from '@tanstack/react-query';
import { getDashboardSummary } from '../api/getDashboardSummary';
import { monitoringQueryKeys } from '../model/queryKeys';

export function useDashboardSummary() {
  return useQuery({
    queryKey: monitoringQueryKeys.dashboardSummary(),
    queryFn: getDashboardSummary,
  });
}
