import { useQuery } from '@tanstack/react-query';
import { getDigitalAssetOperationsOverview } from '../api/digitalAssetOperationsApi';

export function useDigitalAssetOperationsOverview(from: string, to: string) {
  return useQuery({
    queryKey: ['digital-asset-operations-overview', from, to],
    queryFn: () => getDigitalAssetOperationsOverview(from, to),
    retry: false,
    refetchInterval: 30_000,
  });
}
