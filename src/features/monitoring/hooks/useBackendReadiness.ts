import { useQuery } from '@tanstack/react-query';
import { getBackendReadiness } from '../api/getBackendReadiness';

export function useBackendReadiness() {
  return useQuery({
    queryKey: ['backend-readiness'],
    queryFn: getBackendReadiness,
    retry: false,
    refetchInterval: 30_000,
  });
}
