import type { RuntimeExecution, RuntimeExecutionDetail, RuntimeExecutionRequest, RuntimeExecutionTrace } from '../model/types';

export const runtimeExecutionRequestFixture: RuntimeExecutionRequest = {
  institutionId: 'institution_local',
  approvalReference: 'approval_ai_customer_support_v1',
  workloadId: 'customer_summary',
  purposeCode: 'CUSTOMER_SUPPORT',
  subjectScope: 'customer:customer-100',
  destinationProfileId: 'dest_internal_provider_project_provisional',
  idempotencyKey: 'idem_v1_contract',
  processingContexts: ['AI_USE'],
  input: { prompt: 'Summarize approved context' },
};

export const runtimeExecutionFixture: RuntimeExecution = {
  executionId: 'exec_v1_contract',
  status: 'COMPLETED',
  decisionId: 'decision_v1_contract',
  policyAction: 'TRANSFORM',
  finalAction: 'TRANSFORM',
  authorizationResult: 'ALLOWED',
  applicabilityResult: 'APPLICABLE',
  runtimeContextDigest: 'runtime-context-digest-v1',
  policyVersion: 'be-runtime-policy/0.0.0',
  snapshotDigest: 'be-snapshot-local-fixture:customer-summary:customer-support:internal-provider',
  sourceArtifactId: 'PROJECT_PROVISIONAL_POLICY_EVALUATION',
  sourceArtifactVersion: '0.0.0',
  sourceArtifactDigestAlgorithm: 'sha256',
  sourceArtifactDigestValue: 'local-fixture-policy-evaluation',
  connectorStatus: 'ACKNOWLEDGED',
  auditId: 'audit_v1_contract',
  replayed: false,
};

const runtimeExecutionEvidenceFixture = {
  institutionId: runtimeExecutionRequestFixture.institutionId,
  approvalReference: runtimeExecutionRequestFixture.approvalReference,
  approvalReasonCodes: [],
  policyLayers: ['WORKLOAD'],
  destinationProfileId: runtimeExecutionRequestFixture.destinationProfileId,
  requested: { fields: [], count: 0 },
  retrieved: { fields: [], count: 0 },
  transformed: { fields: [], count: 0 },
  released: { fields: [], count: 0 },
  responseGuardReasonCodes: [],
};

export const runtimeExecutionDetailFixture: RuntimeExecutionDetail = {
  executionId: runtimeExecutionFixture.executionId,
  requestId: 'req_v1_contract',
  traceId: 'trace_v1_contract',
  idempotencyKey: runtimeExecutionRequestFixture.idempotencyKey,
  workloadId: runtimeExecutionRequestFixture.workloadId,
  purposeCode: runtimeExecutionRequestFixture.purposeCode,
  subjectRefDigest: 'subject-ref-digest-v1',
  destinationProfileId: runtimeExecutionRequestFixture.destinationProfileId,
  inputDigest: 'input-digest-v1',
  canonicalContextDigest: 'canonical-context-digest-v1',
  runtimeContextDigest: runtimeExecutionFixture.runtimeContextDigest,
  policyVersion: runtimeExecutionFixture.policyVersion,
  snapshotDigest: runtimeExecutionFixture.snapshotDigest,
  decisionId: runtimeExecutionFixture.decisionId,
  finalAction: runtimeExecutionFixture.finalAction,
  status: runtimeExecutionFixture.status,
  createdAt: '2026-08-31T00:00:00Z',
  updatedAt: '2026-08-31T00:00:01Z',
  evidence: runtimeExecutionEvidenceFixture,
};

export const runtimeExecutionTraceFixture: RuntimeExecutionTrace = {
  executionId: runtimeExecutionFixture.executionId,
  traceId: runtimeExecutionDetailFixture.traceId,
  status: 'COMPLETED',
  stages: [
    { stage: 'RECEIVED', status: 'COMPLETED', observedAt: '2026-08-31T00:00:00Z' },
    { stage: 'AUTHORIZATION', status: 'COMPLETED', observedAt: '2026-08-31T00:00:01Z' },
    { stage: 'RETRIEVAL', status: 'COMPLETED', observedAt: '2026-08-31T00:00:01Z' },
    { stage: 'CANONICAL_CONTEXT', status: 'COMPLETED', observedAt: '2026-08-31T00:00:01Z' },
    { stage: 'DECISION', status: 'COMPLETED', observedAt: '2026-08-31T00:00:01Z' },
    { stage: 'TRANSFORM', status: 'COMPLETED', observedAt: '2026-08-31T00:00:01Z' },
    { stage: 'POLICY_HARNESS', status: 'TRANSFORM_REQUIRED', observedAt: '2026-08-31T00:00:01Z' },
    { stage: 'OUTBOUND_GUARD', status: 'COMPLETED', observedAt: '2026-08-31T00:00:01Z' },
    { stage: 'PROVIDER_REQUEST', status: 'COMPLETED', observedAt: '2026-08-31T00:00:01Z' },
    { stage: 'CONNECTOR', status: 'COMPLETED', observedAt: '2026-08-31T00:00:01Z' },
    { stage: 'RESPONSE_GUARD', status: 'COMPLETED', observedAt: '2026-08-31T00:00:01Z' },
    { stage: 'CONTROLLED_DELIVERY', status: 'DELIVERED', observedAt: '2026-08-31T00:00:01Z' },
  ],
  evidence: runtimeExecutionEvidenceFixture,
};
