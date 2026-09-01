import type { FinalAction, PolicyAction } from '../../../shared/types/runtime';

export type RuntimeExecutionStage =
  | 'RECEIVED'
  | 'AUTHORIZATION'
  | 'RETRIEVAL'
  | 'CANONICAL_CONTEXT'
  | 'DECISION'
  | 'TRANSFORM'
  | 'OUTBOUND_GUARD'
  | 'CONNECTOR'
  | 'RESPONSE_GUARD'
  | 'RUNTIME_EXECUTION';

export type RuntimeExecutionStatus =
  | 'RECEIVED'
  | 'AUTHORIZED'
  | 'RETRIEVED'
  | 'DECIDED'
  | 'TRANSFORMED'
  | 'EGRESSING'
  | 'REVIEW_REQUIRED'
  | 'COMPLETED'
  | 'DENIED'
  | 'BLOCKED'
  | 'FAILED';

export type RuntimeExecutionInput = Record<string, unknown>;

export type RuntimeExecutionRequest = {
  workloadId: string;
  purposeCode: string;
  subjectScope: string;
  destinationProfileId: string;
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
  destinationProfileId: string;
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
