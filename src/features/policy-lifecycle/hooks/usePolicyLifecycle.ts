import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  activatePolicyLifecycle,
  approvePolicyLifecycle,
  createPolicyLifecycle,
  getPolicyCurrentSelection,
  getPolicyLifecycle,
  rollbackPolicyLifecycle,
  runPolicyShadowEvaluation,
  transitionPolicyLifecycle,
} from '../api/policyLifecycleApi';
import type { ActivatePolicyRequest, CreatePolicyLifecycleRequest, PolicyCurrentSelectionParams, PolicyLifecycleStage, RollbackPolicyRequest } from '../model/types';

export function usePolicyLifecycle(artifactId: string, artifactVersion: string) {
  return useQuery({
    queryKey: ['policy-lifecycle', artifactId, artifactVersion],
    queryFn: () => getPolicyLifecycle(artifactId, artifactVersion),
    enabled: artifactId.length > 0 && artifactVersion.length > 0,
    retry: false,
  });
}

export function useCreatePolicyLifecycle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: CreatePolicyLifecycleRequest) => createPolicyLifecycle(request),
    onSuccess: (record) => queryClient.setQueryData(
      ['policy-lifecycle', record.artifactId, record.artifactVersion],
      record,
    ),
  });
}

export function useRunPolicyShadowEvaluation() {
  return useMutation({
    mutationFn: ({ artifactId, artifactVersion, evaluationCaseId }: { artifactId: string; artifactVersion: string; evaluationCaseId: string }) => (
      runPolicyShadowEvaluation(artifactId, artifactVersion, { evaluationCaseId })
    ),
  });
}

export function usePolicyCurrentSelection(params: PolicyCurrentSelectionParams | null) {
  return useQuery({
    queryKey: ['policy-current-selection', params],
    queryFn: () => getPolicyCurrentSelection(params!),
    enabled: params != null,
    retry: false,
  });
}

export function useTransitionPolicyLifecycle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ artifactId, artifactVersion, targetStage, reasonCode }: {
      artifactId: string;
      artifactVersion: string;
      targetStage: PolicyLifecycleStage;
      reasonCode: string;
    }) => transitionPolicyLifecycle(artifactId, artifactVersion, { targetStage, reasonCode }),
    onSuccess: (record) => queryClient.setQueryData(
      ['policy-lifecycle', record.artifactId, record.artifactVersion],
      record,
    ),
  });
}

export function useApprovePolicyLifecycle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ artifactId, artifactVersion, shadowEvaluationId }: {
      artifactId: string;
      artifactVersion: string;
      shadowEvaluationId: string;
    }) => approvePolicyLifecycle(artifactId, artifactVersion, { shadowEvaluationId }),
    onSuccess: (record) => queryClient.setQueryData(
      ['policy-lifecycle', record.artifactId, record.artifactVersion],
      record,
    ),
  });
}

function useSelectionMutation<TRequest extends ActivatePolicyRequest | RollbackPolicyRequest>(
  mutationFn: (artifactId: string, artifactVersion: string, request: TRequest) => ReturnType<typeof activatePolicyLifecycle>,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ artifactId, artifactVersion, request }: {
      artifactId: string;
      artifactVersion: string;
      request: TRequest;
    }) => mutationFn(artifactId, artifactVersion, request),
    onSuccess: (selection) => {
      queryClient.setQueryData(['policy-current-selection', {
        executionPack: selection.executionPack,
        workloadId: selection.workloadId,
        purposeCode: selection.purposeCode,
      }], selection);
      queryClient.invalidateQueries({ queryKey: ['policy-lifecycle'] });
    },
  });
}

export function useActivatePolicyLifecycle() {
  return useSelectionMutation(activatePolicyLifecycle);
}

export function useRollbackPolicyLifecycle() {
  return useSelectionMutation(rollbackPolicyLifecycle);
}
