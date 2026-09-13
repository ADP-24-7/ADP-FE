import { useQuery } from '@tanstack/react-query';
import { getDigitalAssetOperationsOverview } from '../api/digitalAssetOperationsApi';

export function useDigitalAssetOperationsOverview(
  from: string,
  to: string,
  executionQuery = '',
  executionStatus = '',
  executionPage = 0,
) {
  return useQuery({
    queryKey: ['digital-asset-operations-overview', from, to, executionQuery, executionStatus, executionPage],
    queryFn: () => getDigitalAssetOperationsOverview(from, to, executionQuery, executionStatus, executionPage),
    placeholderData: (previous) => previous,
    retry: false,
    refetchInterval: 30_000,
  });
}
