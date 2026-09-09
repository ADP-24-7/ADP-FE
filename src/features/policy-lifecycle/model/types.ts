export type ExecutionPackType = 'COMMON' | 'AI' | 'DIGITAL_ASSET';
export type PolicyLayer = 'REGULATORY' | 'INSTITUTION' | 'WORKLOAD' | 'DESTINATION';
export type PolicyLifecycleStage = 'PROJECT_PROVISIONAL' | 'DRAFT' | 'VALIDATED' | 'CANDIDATE' | 'REPLAY' | 'SHADOW' | 'APPROVED' | 'ACTIVE' | 'SUPERSEDED' | 'REVIEW' | 'ROLLED_BACK';

export type PolicyLifecycleRecord = {
  artifactId: string;
  artifactVersion: string;
  artifactDigest: string;
  institutionId: string;
  policyLayer: PolicyLayer;
  executionPack: ExecutionPackType;
  workloadId: string;
  purposeCode: string;
  lifecycleStage: PolicyLifecycleStage;
  createdBy: string;
  revision: number;
  createdAt: string;
  updatedAt: string;
};

export type CreatePolicyLifecycleRequest = Pick<PolicyLifecycleRecord, 'artifactId' | 'artifactVersion' | 'artifactDigest' | 'policyLayer' | 'executionPack' | 'workloadId' | 'purposeCode'>;

export type TransitionPolicyLifecycleRequest = {
  targetStage: PolicyLifecycleStage;
  reasonCode: string;
};

export type RunPolicyShadowEvaluationRequest = {
  evaluationCaseId: string;
};

export type ApprovePolicyLifecycleRequest = {
  shadowEvaluationId: string;
};

export type ActivatePolicyRequest = {
  expectedArtifactRevision: number;
  expectedSelectionRevision: number;
};

export type RollbackPolicyRequest = {
  expectedTargetRevision: number;
  expectedSelectionRevision: number;
};

export type PolicyCurrentSelectionParams = {
  executionPack: ExecutionPackType;
  workloadId: string;
  purposeCode: string;
};

export type PolicyCurrentSelection = {
  institutionId: string;
  policyLayer: PolicyLayer;
  executionPack: ExecutionPackType;
  workloadId: string;
  purposeCode: string;
  artifactId: string;
  artifactVersion: string;
  artifactDigest: string;
  artifactRevision: number;
  selectionRevision: number;
  selectedBy: string;
  selectedAt: string;
};

export type PolicyShadowDiffField =
  | 'FINAL_ACTION'
  | 'REASON_CODES'
  | 'REQUIRED_CONTROLS'
  | 'TRANSFORM_STRATEGY'
  | 'DESTINATION_PROFILE';

export type PolicyShadowEvidence = {
  shadowEvaluationId: string;
  institutionId: string;
  workloadId: string;
  purposeCode: string;
  baselineArtifactId: string;
  baselineArtifactVersion: string;
  baselineArtifactDigest: string;
  candidateArtifactId: string;
  candidateArtifactVersion: string;
  candidateArtifactDigest: string;
  candidateRevision: number;
  evaluationCaseId: string;
  evaluationCaseVersion: string;
  inputDigest: string;
  baselineOutcomeDigest: string;
  candidateOutcomeDigest: string;
  diffFields: PolicyShadowDiffField[];
  result: 'MATCH' | 'DIFF';
  evaluatedBy: string;
  evaluatedAt: string;
};
