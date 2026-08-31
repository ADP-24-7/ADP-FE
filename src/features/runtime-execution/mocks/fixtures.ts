import type { RuntimeExecution, RuntimeExecutionRequest, RuntimeExecutionTrace } from '../model/types';

export const runtimeExecutionRequestFixture: RuntimeExecutionRequest = {
  workloadId: 'demo-financial-workspace',
  purposeCode: 'CUSTOMER_SUPPORT_REVIEW',
  subjectScope: 'customer:masked',
  providerProfileId: 'provider-profile-openai-low-risk',
  input: {
    promptRef: 'prompt-ref-provisional',
    customerSegment: 'retail',
  },
  idempotencyKey: 'idem-runtime-execution-001',
};

export const runtimeExecutionFixture: RuntimeExecution = {
  executionId: 'exec_001',
  traceId: 'trace_001',
  status: 'COMPLETED',
  finalAction: 'TRANSFORM',
  reasonCodes: ['PII_DETECTED', 'TRANSFORM_APPLIED'],
  policyVersion: 'policy-v1',
  artifactVersion: 'artifact-v1',
  stages: [
    { stage: 'AUTHORIZATION', status: 'AUTHORIZED' },
    { stage: 'RETRIEVAL', status: 'RETRIEVED' },
    { stage: 'DETECTION', status: 'DECIDED', reasonCodes: ['PII_DETECTED'] },
    { stage: 'DECISION', status: 'DECIDED' },
    { stage: 'TRANSFORM', status: 'TRANSFORMED' },
    { stage: 'OUTBOUND_GUARD', status: 'EGRESSING' },
    { stage: 'PROVIDER', status: 'COMPLETED' },
    { stage: 'RESPONSE_GUARD', status: 'COMPLETED' },
    { stage: 'AUDIT', status: 'COMPLETED' },
  ],
  output: {
    displayText: 'Privacy-safe provisional response',
    redactionApplied: true,
    metadata: {
      source: 'PROJECT_PROVISIONAL',
    },
  },
};

export const runtimeExecutionTraceFixture: RuntimeExecutionTrace = {
  executionId: runtimeExecutionFixture.executionId,
  traceId: runtimeExecutionFixture.traceId,
  stages: runtimeExecutionFixture.stages,
};
