import { useQuery } from '@tanstack/react-query';
import { getPolicyLifecycle } from '../api/policyLifecycleApi';

export function usePolicyLifecycle(artifactId: string, artifactVersion: string) {
  return useQuery({
    queryKey: ['policy-lifecycle', artifactId, artifactVersion],
    queryFn: () => getPolicyLifecycle(artifactId, artifactVersion),
    enabled: artifactId.length > 0 && artifactVersion.length > 0,
    retry: false,
  });
}
