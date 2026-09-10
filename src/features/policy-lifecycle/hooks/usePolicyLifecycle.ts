import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { normalizeApiError } from '../../../shared/api/apiError';
import {
  activatePolicyLifecycle,
  approvePolicyLifecycle,
  createPolicyLifecycle,
  getPolicyCurrentSelection,
  getPolicyArtifactHistory,
  getPolicyLifecycle,
  rollbackPolicyLifecycle,
  runPolicyShadowEvaluation,
  searchPolicyArtifacts,
  transitionPolicyLifecycle,
} from '../api/policyLifecycleApi';
import type { ActivatePolicyRequest, CreatePolicyLifecycleRequest, PolicyArtifactSearchParams, PolicyCurrentSelectionParams, PolicyLifecycleStage, RollbackPolicyRequest } from '../model/types';

export const policyLifecycleKeys = {
  all: ['policy-lifecycle'] as const,
  lists: ['policy-lifecycle', 'list'] as const,
  histories: ['policy-lifecycle', 'history'] as const,
  detail: (artifactId: string, artifactVersion: string) => (
    [...policyLifecycleKeys.all, artifactId, artifactVersion] as const
  ),
  list: (params: PolicyArtifactSearchParams) => ([...policyLifecycleKeys.lists, params] as const),
  history: (artifactId: string, artifactVersion: string) => (
    [...policyLifecycleKeys.histories, artifactId, artifactVersion] as const
  ),
};

export function usePolicyArtifacts(params: PolicyArtifactSearchParams) {
  return useQuery({
    queryKey: policyLifecycleKeys.list(params),
    queryFn: () => searchPolicyArtifacts(params),
    placeholderData: (previous) => previous,
    retry: false,
  });
}

export function usePolicyArtifactHistory(artifactId: string, artifactVersion: string) {
  return useQuery({
    queryKey: policyLifecycleKeys.history(artifactId, artifactVersion),
    queryFn: () => getPolicyArtifactHistory(artifactId, artifactVersion),
    enabled: artifactId.length > 0 && artifactVersion.length > 0,
    retry: false,
  });
}

export const policySelectionKeys = {
  all: ['policy-current-selection'] as const,
  detail: (params: PolicyCurrentSelectionParams) => (
    [...policySelectionKeys.all, params] as const
  ),
};

const selectionConflictCodes = new Set([
  'POLICY_LIFECYCLE_CONCURRENT_MODIFICATION',
  'POLICY_CURRENT_SELECTION_AMBIGUOUS',
  'POLICY_CURRENT_SELECTION_STALE',
  'POLICY_CURRENT_SELECTION_APPROVAL_STALE',
]);

export function usePolicyLifecycle(artifactId: string, artifactVersion: string) {
  return useQuery({
    queryKey: policyLifecycleKeys.detail(artifactId, artifactVersion),
    queryFn: () => getPolicyLifecycle(artifactId, artifactVersion),
    enabled: artifactId.length > 0 && artifactVersion.length > 0,
    retry: false,
  });
}

export function useCreatePolicyLifecycle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: CreatePolicyLifecycleRequest) => createPolicyLifecycle(request),
    onSuccess: (record) => {
      queryClient.setQueryData(policyLifecycleKeys.detail(record.artifactId, record.artifactVersion), record);
      queryClient.invalidateQueries({ queryKey: policyLifecycleKeys.lists });
    },
  });
}

export function useRunPolicyShadowEvaluation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ artifactId, artifactVersion, evaluationCaseId }: { artifactId: string; artifactVersion: string; evaluationCaseId: string }) => (
      runPolicyShadowEvaluation(artifactId, artifactVersion, { evaluationCaseId })
    ),
    onSuccess: (evidence) => queryClient.invalidateQueries({
      queryKey: policyLifecycleKeys.history(evidence.candidateArtifactId, evidence.candidateArtifactVersion),
    }),
  });
}

export function usePolicyCurrentSelection(params: PolicyCurrentSelectionParams | null) {
  return useQuery({
    queryKey: params ? policySelectionKeys.detail(params) : policySelectionKeys.all,
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
    onSuccess: (record) => {
      queryClient.setQueryData(policyLifecycleKeys.detail(record.artifactId, record.artifactVersion), record);
      queryClient.invalidateQueries({ queryKey: policyLifecycleKeys.lists });
      queryClient.invalidateQueries({ queryKey: policyLifecycleKeys.history(record.artifactId, record.artifactVersion) });
    },
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
    onSuccess: (record) => {
      queryClient.setQueryData(policyLifecycleKeys.detail(record.artifactId, record.artifactVersion), record);
      queryClient.invalidateQueries({ queryKey: policyLifecycleKeys.lists });
      queryClient.invalidateQueries({ queryKey: policyLifecycleKeys.history(record.artifactId, record.artifactVersion) });
    },
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
      queryClient.setQueryData(policySelectionKeys.detail({
        executionPack: selection.executionPack,
        workloadId: selection.workloadId,
        purposeCode: selection.purposeCode,
      }), selection);
      queryClient.invalidateQueries({ queryKey: policyLifecycleKeys.all });
    },
    onError: (error) => {
      if (!selectionConflictCodes.has(normalizeApiError(error).errorCode)) return;
      queryClient.invalidateQueries({ queryKey: policySelectionKeys.all });
    },
  });
}

export function useActivatePolicyLifecycle() {
  return useSelectionMutation(activatePolicyLifecycle);
}

export function useRollbackPolicyLifecycle() {
  return useSelectionMutation(rollbackPolicyLifecycle);
}
