import { http, HttpResponse } from 'msw';
import { digitalAssetRuntimeTraceFixture, runtimeExecutionDetailFixture, runtimeExecutionFixture, runtimeExecutionTraceFixture } from './fixtures';

export const runtimeExecutionHandlers = [
  http.post('/v1/runtime/executions', () => HttpResponse.json(runtimeExecutionFixture)),
  http.get('/v1/runtime/executions/:executionId', ({ params }) => {
    if (params.executionId !== runtimeExecutionFixture.executionId) {
      return HttpResponse.json({ errorCode: 'RUNTIME_EXECUTION_NOT_FOUND', message: 'Execution not found' }, { status: 404 });
    }

    return HttpResponse.json(runtimeExecutionDetailFixture);
  }),
  http.get('/v1/runtime/executions/:executionId/trace', ({ params }) => {
    const aiExecution = aiExecutions[String(params.executionId)];
    if (aiExecution) return HttpResponse.json(aiExecution);
    if (params.executionId === digitalAssetRuntimeTraceFixture.executionId) {
      return HttpResponse.json(digitalAssetRuntimeTraceFixture);
    }
    if (params.executionId !== runtimeExecutionFixture.executionId) {
      return HttpResponse.json({ errorCode: 'RUNTIME_EXECUTION_NOT_FOUND', message: 'Execution trace not found' }, { status: 404 });
    }

    return HttpResponse.json(runtimeExecutionTraceFixture);
  }),
];

const aiExecutions: Record<string, object> = Object.fromEntries([
  ['exec_05a60a08-f3ff-44b6-8db0-248dbd264ff7', 'nvidia/nemotron-3.5-lightning-30b-a3b', 17227, 994],
  ['exec_d567d9b6-1502-4427-820f-ec6f4063445e', 'meta/muse-glimmer-30b', 27778, 938],
  ['exec_1b42d562-762e-4a8c-b47e-8a42a0c30ed2', 'google/gemma-4-31b-it', 57573, 687],
].map(([executionId, modelId, latency, tokens]) => [executionId, {
  executionId,
  traceId: `trace_${executionId}`,
  status: 'BLOCKED',
  workloadId: 'customer_summary',
  purposeCode: 'CUSTOMER_SUPPORT',
  subjectRefDigest: 'subject-ref-digest',
  authorizationDecision: 'ALLOWED',
  authorizationReason: 'AUTHORIZATION_POLICY_ALLOWED',
  policyVersion: 'be-runtime-policy/0.0.0',
  policyDecision: 'TRANSFORM',
  policyReasonCodes: [],
  finalAction: 'TRANSFORM',
  regulatoryRequirementRefs: ['APPROVED_SCOPE_ONLY', 'PERSONAL_CREDIT_INFO_PROTECTION'],
  regulatoryEvidenceRefs: ['FSC-AI-GUIDELINE-2026-06', 'FSI-AI-SECURITY-2026-06'],
  createdAt: '2026-09-10T01:00:00Z',
  updatedAt: '2026-09-10T01:01:00Z',
  stages: [
    'RECEIVED', 'AUTHORIZATION', 'RETRIEVAL', 'CANONICAL_CONTEXT', 'DECISION', 'TRANSFORM',
    'POLICY_HARNESS', 'OUTBOUND_GUARD', 'PROVIDER_REQUEST', 'CONNECTOR',
  ].map((stage) => ({ stage, status: stage === 'POLICY_HARNESS' ? 'TRANSFORM_REQUIRED' : 'COMPLETED', observedAt: '2026-09-10T01:00:00Z' })).concat([
    { stage: 'RESPONSE_GUARD', status: 'REJECTED', observedAt: '2026-09-10T01:01:00Z' },
    { stage: 'CONTROLLED_DELIVERY', status: 'WITHHELD', observedAt: '2026-09-10T01:01:00Z' },
  ]),
  stageTimings: [],
  evidence: {
    institutionId: 'institution_local', approvalReference: 'approval_ai_eval', approvalReasonCodes: [],
    policyLayers: ['WORKLOAD', 'PURPOSE', 'DESTINATION'], policyLayersDigest: 'policy-layers-digest',
    destinationProfileId: `dest_${String(modelId).replace(/\//g, '-')}`,
    requested: { fields: [], count: 10 }, retrieved: { fields: [], count: 10 },
    transformed: { fields: [], count: 10, digest: 'transform-digest' },
    released: { fields: [], count: 10, digest: 'released-digest' },
    providerResponseDigest: 'provider-response-digest', responseGuardStatus: 'REJECTED',
    responseGuardReasonCodes: ['RESPONSE_SENSITIVE_DATA_DETECTED'], responseFindingTypes: ['RAW_VALUE_REFLECTION'],
    controlledDeliveryStatus: 'WITHHELD', controlledDeliveryResponseDigest: 'provider-response-digest',
    aiModel: {
      profileId: String(modelId).replace('/', '-'), providerModelId: modelId, providerModelVersion: 'v1',
      evaluationRunId: 'ai-eval-da-provenance-2026-09-10-r2', evalCaseId: 'customer-summary-da-10832-001',
      evaluationContractDigest: 'sha256:05d144018ca85f9b9c62000ceced9078c1771a2d9e3e703e9d07974e2f613050',
      expectedInputDigest: 'input-digest', actualInputDigest: 'input-digest', datasetId: 'financial_synthetic',
      datasetVersion: 'financial_synthetic_processed_v1', datasetDigest: 'dataset-digest',
      policySnapshotDigest: 'policy-digest', fullResponseLatencyMillis: latency, totalTokens: tokens,
      tokenUsageStatus: 'PROVIDED', providerStatus: 'ACKNOWLEDGED', errorCategory: 'NONE',
      providerHttpStatus: 200, evidenceStatus: 'COMPLETE',
    },
  },
}]));
