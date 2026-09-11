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
  | 'PRE_EXECUTION_GUARD'
  | 'PROVIDER_REQUEST'
  | 'CONNECTOR'
  | 'RESPONSE_GUARD'
  | 'POST_EXECUTION_REBINDING'
  | 'CONTROLLED_DELIVERY'
  | 'RUNTIME_EXECUTION';

export type RuntimeExecutionStatus =
  | 'RECEIVED'
  | 'AUTHORIZED'
  | 'RETRIEVED'
  | 'DECIDED'
  | 'TRANSFORMED'
  | 'EGRESSING'
  | 'EXTERNALLY_RECONCILED'
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
  evaluationRunId?: string;
  evalCaseId?: string;
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
  responseFindingTypes: string[];
  controlledDeliveryStatus?: string | null;
  controlledDeliveryResponseDigest?: string | null;
  controlledDeliveryReasonCode?: string | null;
  controlledDeliveredAt?: string | null;
  aiModel?: AiModelExecutionEvidence | null;
};

export type AiModelExecutionEvidence = {
  profileId: string;
  providerModelId: string;
  providerModelVersion: string;
  evaluationRunId: string;
  evalCaseId: string;
  evaluationContractDigest: string;
  expectedInputDigest: string;
  actualInputDigest: string;
  datasetId: string;
  datasetVersion: string;
  datasetDigest: string;
  policySnapshotDigest: string;
  fullResponseLatencyMillis?: number | null;
  attemptElapsedMillis?: number | null;
  inputTokens?: number | null;
  outputTokens?: number | null;
  totalTokens?: number | null;
  tokenUsageStatus: string;
  providerStatus: string;
  errorCategory?: string | null;
  providerHttpStatus?: number | null;
  evidenceStatus: string;
};

export type RuntimeExecutionTraceStage = {
  stage: RuntimeExecutionStage;
  status: string;
  observedAt?: string;
};

export type RuntimeStageTiming = {
  stage: 'AUTHORIZATION' | 'RETRIEVAL' | 'POLICY' | 'TRANSFORM' | 'OUTBOUND_GUARD' | 'PROVIDER' | 'RESPONSE_GUARD' | 'DELIVERY';
  startedAt: string;
  endedAt: string;
  durationMillis: number;
};

export type RuntimeExecutionTrace = {
  executionId: string;
  traceId: string;
  status: RuntimeExecutionStatus;
  workloadId: string;
  purposeCode: string;
  subjectRefDigest?: string | null;
  authorizationDecision: 'ALLOWED' | 'DENIED';
  authorizationReason: string;
  policyVersion?: string | null;
  policyDecision?: PolicyAction | null;
  policyReasonCodes: string[];
  finalAction?: FinalAction | null;
  regulatoryRequirementRefs: string[];
  regulatoryEvidenceRefs: string[];
  createdAt: string;
  updatedAt: string;
  stages: RuntimeExecutionTraceStage[];
  stageTimings: RuntimeStageTiming[];
  digitalAssetRuntimeSnapshot?: DigitalAssetRuntimeSnapshot | null;
  digitalAssetPreExecutionGuard?: DigitalAssetPreExecutionGuard | null;
  digitalAssetPostExecutionEvidence?: DigitalAssetPostExecutionEvidence | null;
  evidence: RuntimeExecutionEvidence;
};

export type DigitalAssetArtifactControl =
  | 'APPROVED_VS_REQUESTED_MATCH'
  | 'REQUIRED_OUTBOUND_FIELD_PRESENCE'
  | 'REQUIRED_EXACT_PRESERVATION'
  | 'TRANSFORM_FIELD_SEPARATION'
  | 'DESTINATION_SPECIFIC_PAYLOAD'
  | 'TRACE_BINDING';

export type DigitalAssetPreExecutionGuard = {
  snapshotId: string;
  status: 'PASSED' | 'BLOCKED' | 'REVIEW_REQUIRED' | string;
  controlResults: Record<DigitalAssetArtifactControl, string>;
  reasonCodes: string[];
  outboundPayloadDigest: string;
  providerPayloadDigest: string;
  evaluatedAt: string;
};

export type DigitalAssetPostExecutionStatus =
  | 'VERIFIED'
  | 'PENDING'
  | 'SENT_UNKNOWN'
  | 'REVIEW_REQUIRED'
  | 'FAILED';

export type DigitalAssetPostExecutionEvidence = {
  status: DigitalAssetPostExecutionStatus;
  evidenceSourceType: 'PROVIDER_RESPONSE' | 'INDEPENDENT_EXTERNAL';
  externalStatus: string;
  providerStatus: string;
  receiptStatus: string;
  finalityStatus: string;
  amountSource: string;
  transactionDetailDigest: string;
  receiptFinalityDigest: string;
  transferEvidenceDigest: string;
  internalTraceEvidenceDigest: string;
  exactAmountDigest: string;
  expectedProjectionDigest: string;
  actualProjectionDigest: string;
  mismatchedFields: string[];
  providerResponseDigest?: string | null;
  observedAt: string;
};

export type DigitalAssetRuntimeSnapshot = {
  snapshotId: string;
  snapshotDigest: string;
  artifactId: string;
  artifactVersion: string;
  artifactDigest: string;
  approvedPolicySnapshotId: string;
  approvedPolicyVersion: string;
  approvedPolicyDigest: string;
  destinationProfileId: string;
  destinationProfileVersion: string;
  destinationProfileDigest: string;
  runtimeControlVersion: string;
  runtimeControlDigest: string;
  crosswalkVersion: string;
  crosswalkDigest: string;
  selectedAt: string;
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
  digitalAssetRuntimeSnapshot?: DigitalAssetRuntimeSnapshot | null;
  digitalAssetPreExecutionGuard?: DigitalAssetPreExecutionGuard | null;
  digitalAssetPostExecutionEvidence?: DigitalAssetPostExecutionEvidence | null;
  evidence: RuntimeExecutionEvidence;
};
