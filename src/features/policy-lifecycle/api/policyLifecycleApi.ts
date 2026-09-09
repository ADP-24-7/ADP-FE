import { httpClient } from '../../../shared/api/httpClient';
import type {
  ActivatePolicyRequest,
  ApprovePolicyLifecycleRequest,
  CreatePolicyLifecycleRequest,
  PolicyCurrentSelection,
  PolicyCurrentSelectionParams,
  PolicyArtifactHistory,
  PolicyArtifactPage,
  PolicyArtifactSearchParams,
  PolicyLifecycleRecord,
  PolicyShadowEvidence,
  RollbackPolicyRequest,
  RunPolicyShadowEvaluationRequest,
  TransitionPolicyLifecycleRequest,
} from '../model/types';

export async function searchPolicyArtifacts(params: PolicyArtifactSearchParams) {
  const response = await httpClient.get<PolicyArtifactPage>('/api/admin/policy-lifecycle', { params });
  return response.data;
}

export async function getPolicyArtifactHistory(artifactId: string, artifactVersion: string) {
  const response = await httpClient.get<PolicyArtifactHistory>(
    `/api/admin/policy-lifecycle/${encodeURIComponent(artifactId)}/versions/${encodeURIComponent(artifactVersion)}/history`,
  );
  return response.data;
}

export async function getPolicyLifecycle(artifactId: string, artifactVersion: string) {
  const response = await httpClient.get<PolicyLifecycleRecord>(
    `/api/admin/policy-lifecycle/${encodeURIComponent(artifactId)}/versions/${encodeURIComponent(artifactVersion)}`,
  );
  return response.data;
}

export async function createPolicyLifecycle(request: CreatePolicyLifecycleRequest) {
  const response = await httpClient.post<PolicyLifecycleRecord>('/api/admin/policy-lifecycle', request);
  return response.data;
}

export async function transitionPolicyLifecycle(artifactId: string, artifactVersion: string, request: TransitionPolicyLifecycleRequest) {
  const response = await httpClient.post<PolicyLifecycleRecord>(
    `/api/admin/policy-lifecycle/${encodeURIComponent(artifactId)}/versions/${encodeURIComponent(artifactVersion)}/transitions`,
    request,
  );
  return response.data;
}

export async function runPolicyShadowEvaluation(artifactId: string, artifactVersion: string, request: RunPolicyShadowEvaluationRequest) {
  const response = await httpClient.post<PolicyShadowEvidence>(
    `/api/admin/policy-lifecycle/${encodeURIComponent(artifactId)}/versions/${encodeURIComponent(artifactVersion)}/shadow-evaluations`,
    request,
  );
  return response.data;
}

export async function approvePolicyLifecycle(artifactId: string, artifactVersion: string, request: ApprovePolicyLifecycleRequest) {
  const response = await httpClient.post<PolicyLifecycleRecord>(
    `/api/admin/policy-lifecycle/${encodeURIComponent(artifactId)}/versions/${encodeURIComponent(artifactVersion)}/approvals`,
    request,
  );
  return response.data;
}

export async function getPolicyCurrentSelection(params: PolicyCurrentSelectionParams) {
  const response = await httpClient.get<PolicyCurrentSelection>('/api/admin/policy-lifecycle/current-selection', { params });
  return response.data;
}

export async function activatePolicyLifecycle(artifactId: string, artifactVersion: string, request: ActivatePolicyRequest) {
  const response = await httpClient.post<PolicyCurrentSelection>(
    `/api/admin/policy-lifecycle/${encodeURIComponent(artifactId)}/versions/${encodeURIComponent(artifactVersion)}/activations`,
    request,
  );
  return response.data;
}

export async function rollbackPolicyLifecycle(artifactId: string, artifactVersion: string, request: RollbackPolicyRequest) {
  const response = await httpClient.post<PolicyCurrentSelection>(
    `/api/admin/policy-lifecycle/${encodeURIComponent(artifactId)}/versions/${encodeURIComponent(artifactVersion)}/rollbacks`,
    request,
  );
  return response.data;
}
