import type { RuntimeExecution, RuntimeExecutionDetail, RuntimeExecutionRequest, RuntimeExecutionTrace } from '../model/types';

export const runtimeExecutionRequestFixture: RuntimeExecutionRequest = {
  workloadId: 'customer_summary',
  purposeCode: 'CUSTOMER_SUPPORT',
  subjectScope: 'customer:customer-100',
  providerProfileId: 'internal-provider',
  idempotencyKey: 'idem_v1_contract',
  processingContexts: ['AI_USE'],
  input: { ticketId: 'ticket-100' },
};

export const runtimeExecutionFixture: RuntimeExecution = {
  executionId: 'exec_v1_contract',
  status: 'DECIDED',
  decisionId: 'decision_v1_contract',
  policyAction: 'ALLOW',
  finalAction: 'ALLOW',
  authorizationResult: 'ALLOWED',
  applicabilityResult: 'APPLICABLE',
  runtimeContextDigest: 'runtime-context-digest-v1',
  policyVersion: 'be-runtime-policy/0.0.0',
  snapshotDigest: 'be-snapshot-local-fixture:customer-summary:customer-support:internal-provider',
  sourceArtifactId: 'PROJECT_PROVISIONAL_POLICY_EVALUATION',
  sourceArtifactVersion: '0.0.0',
  sourceArtifactDigestAlgorithm: 'sha256',
  sourceArtifactDigestValue: 'local-fixture-policy-evaluation',
  connectorStatus: 'EXECUTED',
  auditId: 'audit_v1_contract',
};

export const runtimeExecutionDetailFixture: RuntimeExecutionDetail = {
  executionId: runtimeExecutionFixture.executionId,
  requestId: 'req_v1_contract',
  traceId: 'trace_v1_contract',
  idempotencyKey: runtimeExecutionRequestFixture.idempotencyKey,
  workloadId: runtimeExecutionRequestFixture.workloadId,
  purposeCode: runtimeExecutionRequestFixture.purposeCode,
  subjectRefDigest: 'subject-ref-digest-v1',
  providerProfileId: runtimeExecutionRequestFixture.providerProfileId,
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
};

export const runtimeExecutionTraceFixture: RuntimeExecutionTrace = {
  executionId: runtimeExecutionFixture.executionId,
  traceId: runtimeExecutionDetailFixture.traceId,
  status: 'DECIDED',
  stages: [
    { stage: 'RECEIVED', status: 'COMPLETED', observedAt: '2026-08-31T00:00:00Z' },
    { stage: 'AUTHORIZATION', status: 'COMPLETED', observedAt: '2026-08-31T00:00:01Z' },
    { stage: 'RETRIEVAL', status: 'COMPLETED', observedAt: '2026-08-31T00:00:01Z' },
    { stage: 'CANONICAL_CONTEXT', status: 'COMPLETED', observedAt: '2026-08-31T00:00:01Z' },
    { stage: 'DECISION', status: 'COMPLETED', observedAt: '2026-08-31T00:00:01Z' },
  ],
};
