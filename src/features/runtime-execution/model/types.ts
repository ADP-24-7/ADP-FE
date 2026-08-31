import type { FinalAction, PolicyAction } from '../../../shared/types/runtime';

export type RuntimeExecutionStage =
  | 'RECEIVED'
  | 'AUTHORIZATION'
  | 'RETRIEVAL'
  | 'CANONICAL_CONTEXT'
  | 'DECISION'
  | 'RUNTIME_EXECUTION';

export type RuntimeExecutionStatus =
  | 'RECEIVED'
  | 'DECIDED'
  | 'COMPLETED'
  | 'DENIED'
  | 'BLOCKED'
  | 'FAILED';

export type RuntimeExecutionInput = Record<string, unknown>;

export type RuntimeExecutionRequest = {
  workloadId: string;
  purposeCode: string;
  subjectScope: string;
  providerProfileId: string;
  input: RuntimeExecutionInput;
  idempotencyKey: string;
  processingContexts: string[];
};

export type RuntimeExecution = {
  executionId: string;
  status: RuntimeExecutionStatus;
  decisionId: string;
  policyAction: PolicyAction;
  finalAction: FinalAction;
  authorizationResult: 'ALLOWED' | 'DENIED';
  applicabilityResult: 'APPLICABLE' | 'NOT_APPLICABLE' | 'INCOMPLETE';
  runtimeContextDigest: string;
  policyVersion?: string;
  snapshotDigest?: string;
  sourceArtifactId?: string;
  sourceArtifactVersion?: string;
  sourceArtifactDigestAlgorithm?: string;
  sourceArtifactDigestValue?: string;
  connectorStatus?: string;
  auditId?: string;
};

export type RuntimeExecutionTraceStage = {
  stage: RuntimeExecutionStage;
  status: RuntimeExecutionStatus;
  observedAt?: string;
};

export type RuntimeExecutionTrace = {
  executionId: string;
  traceId: string;
  status: RuntimeExecutionStatus;
  stages: RuntimeExecutionTraceStage[];
};

export type RuntimeExecutionDetail = {
  executionId: string;
  requestId: string;
  traceId: string;
  idempotencyKey: string;
  workloadId: string;
  purposeCode: string;
  subjectRefDigest: string;
  providerProfileId: string;
  inputDigest: string;
  canonicalContextDigest?: string;
  runtimeContextDigest?: string;
  policyVersion?: string;
  snapshotDigest?: string;
  decisionId?: string;
  finalAction?: FinalAction;
  status: RuntimeExecutionStatus;
  createdAt: string;
  updatedAt: string;
};
