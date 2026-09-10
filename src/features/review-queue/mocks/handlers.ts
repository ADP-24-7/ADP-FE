import { http, HttpResponse } from 'msw';

const item = {
  executionId: 'exec-review-contract',
  requestId: 'req-review-contract',
  traceId: 'trace-review-contract',
  institutionId: 'institution_local',
  executionPack: 'AI',
  workloadId: 'customer_summary',
  purposeCode: 'CUSTOMER_SUPPORT',
  runtimeStatus: 'REVIEW_REQUIRED',
  finalAction: 'REVIEW',
  reviewSource: 'POLICY',
  nextAction: 'INSPECT_TRACE',
  reasonCodes: ['SENSITIVE_INPUT_REVIEW_REQUIRED'],
  recoveryId: null,
  recoveryStatus: null,
  createdAt: '2026-09-10T00:00:00Z',
  updatedAt: '2026-09-10T00:01:00Z',
};

export const reviewQueueHandlers = [
  http.get('/api/admin/review-queue', ({ request }) => {
    const params = new URL(request.url).searchParams;
    const items = !params.get('executionPack') || params.get('executionPack') === item.executionPack ? [item] : [];
    return HttpResponse.json({
      items,
      page: Number(params.get('page') ?? 0),
      size: Number(params.get('size') ?? 20),
      totalElements: items.length,
    });
  }),
  http.get('/api/admin/review-queue/:executionId', ({ params }) => HttpResponse.json({
    ...item,
    executionId: params.executionId,
    policyProfileId: null,
    policyProfileVersion: null,
    policyProfileDigest: null,
    connectorStatus: null,
    responseGuardStatus: null,
    controlledDeliveryStatus: 'WITHHELD',
    retryDisposition: null,
    recoveryErrorCode: null,
    postExecutionEvidenceStatus: null,
    mismatchedFields: [],
    tracePath: `/v1/runtime/executions/${params.executionId}/trace`,
    evidencePath: `/api/admin/audit/executions/${params.executionId}/evidence`,
  })),
];
