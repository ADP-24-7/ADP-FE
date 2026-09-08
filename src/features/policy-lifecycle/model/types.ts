export type ExecutionPackType = 'AI' | 'DIGITAL_ASSET';
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
