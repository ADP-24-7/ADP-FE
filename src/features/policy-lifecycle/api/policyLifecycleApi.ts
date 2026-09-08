import { httpClient } from '../../../shared/api/httpClient';
import type { CreatePolicyLifecycleRequest, PolicyLifecycleRecord, PolicyShadowEvidence, RunPolicyShadowEvaluationRequest, TransitionPolicyLifecycleRequest } from '../model/types';

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
