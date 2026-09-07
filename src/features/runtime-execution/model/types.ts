import type { FinalAction, PolicyAction } from '../../../shared/types/runtime';

export type RuntimeExecutionStage =
  | 'RECEIVED'
  | 'AUTHORIZATION'
  | 'RETRIEVAL'
  | 'CANONICAL_CONTEXT'
  | 'DECISION'
  | 'TRANSFORM'
  | 'POLICY_HARNESS'
  | 'OUTBOUND_GUARD'
  | 'PROVIDER_REQUEST'
  | 'CONNECTOR'
  | 'RESPONSE_GUARD'
  | 'CONTROLLED_DELIVERY'
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
  institutionId: string;
  approvalReference: string;
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
  privacySafeOutput?: PrivacySafeOutput;
  outboundCandidateDigest?: string;
  outboundGuardStatus?: string;
  connectorStatus?: string;
  responseGuardStatus?: string;
  output?: ControlledDelivery;
  auditId?: string;
  replayed: boolean;
};

export type PrivacySafeOutput = {
  transformExecutionId: string;
  status: string;
  outputDigest: string;
  fieldCount: number;
  fields: Array<{ path: string; dataClass: string; strategy: string }>;
};

export type ControlledDelivery = {
  deliveryStatus: string;
  content?: string | null;
  responseDigest: string;
};

export type FieldSetEvidence = {
  fields: string[];
  digest?: string | null;
  count?: number | null;
};

export type RuntimeExecutionEvidence = {
  institutionId: string;
  approvalReference: string;
  approvalVersion?: string | null;
  approvalScopeDigest?: string | null;
  approvalReuseStatus?: string | null;
  approvalReasonCodes: string[];
  policyLayers: string[];
  policyLayersDigest?: string | null;
  destinationProfileId: string;
  destinationProfileVersion?: string | null;
  destinationProfileDigest?: string | null;
  destinationTenantId?: string | null;
  destinationRegion?: string | null;
  destinationRetentionPolicy?: string | null;
  destinationTrainingUseAllowed?: boolean | null;
  requested: FieldSetEvidence;
  retrieved: FieldSetEvidence;
  transformed: FieldSetEvidence;
  released: FieldSetEvidence;
  providerRequestId?: string | null;
  providerRequestDigest?: string | null;
  providerResponseDigest?: string | null;
  responseGuardStatus?: string | null;
  responseGuardReasonCodes: string[];
  controlledDeliveryStatus?: string | null;
  controlledDeliveryResponseDigest?: string | null;
  controlledDeliveryReasonCode?: string | null;
  controlledDeliveredAt?: string | null;
  aiModel?: Record<string, unknown> | null;
};

export type RuntimeExecutionTraceStage = {
  stage: RuntimeExecutionStage;
  status: string;
  observedAt?: string;
};

export type RuntimeExecutionTrace = {
  executionId: string;
  traceId: string;
  status: RuntimeExecutionStatus;
  stages: RuntimeExecutionTraceStage[];
  evidence: RuntimeExecutionEvidence;
};

export type RuntimeExecutionDetail = {
  executionId: string;
  requestId: string;
  traceId: string;
  idempotencyKey: string;
  workloadId: string;
  purposeCode: string;
  subjectRefDigest: string;
  providerProfileId?: string | null;
  destinationProfileId: string;
  destinationProfileVersion?: string | null;
  destinationProfileDigest?: string | null;
  inputDigest: string;
  canonicalContextDigest?: string;
  runtimeContextDigest?: string;
  policyVersion?: string;
  snapshotDigest?: string;
  decisionId?: string;
  finalAction?: FinalAction;
  transformExecutionId?: string | null;
  transformStatus?: string | null;
  transformOutputDigest?: string | null;
  outboundPayloadId?: string | null;
  outboundCandidateDigest?: string | null;
  outboundGuardStatus?: string | null;
  connectorExecutionId?: string | null;
  connectorStatus?: string | null;
  responseGuardStatus?: string | null;
  status: RuntimeExecutionStatus;
  createdAt: string;
  updatedAt: string;
  evidence: RuntimeExecutionEvidence;
};
