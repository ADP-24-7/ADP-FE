import { useMutation, useQuery } from '@tanstack/react-query';
import { getPolicyLifecycle, runPolicyShadowEvaluation } from '../api/policyLifecycleApi';

export function usePolicyLifecycle(artifactId: string, artifactVersion: string) {
  return useQuery({
    queryKey: ['policy-lifecycle', artifactId, artifactVersion],
    queryFn: () => getPolicyLifecycle(artifactId, artifactVersion),
    enabled: artifactId.length > 0 && artifactVersion.length > 0,
    retry: false,
  });
}

export function useRunPolicyShadowEvaluation() {
  return useMutation({
    mutationFn: ({ artifactId, artifactVersion, evaluationCaseId }: { artifactId: string; artifactVersion: string; evaluationCaseId: string }) => (
      runPolicyShadowEvaluation(artifactId, artifactVersion, { evaluationCaseId })
    ),
  });
}
