import { http, HttpResponse } from 'msw';

const incident = {
  recoveryId: 'recovery-contract',
  executionId: 'execution-contract',
  institutionId: 'institution_local',
  executionPack: 'AI',
  workloadId: 'customer_summary',
  purposeCode: 'CUSTOMER_SUPPORT',
  connectorId: 'connector-local',
  observedStatus: 'SENT_UNKNOWN',
  lastObservedExternalStatus: null,
  recoveryStatus: 'PENDING',
  retryDisposition: 'RECONCILE_FIRST',
  attemptCount: 1,
  maxAttempts: 5,
  nextAttemptAt: '2026-09-09T00:05:00Z',
  lastErrorCode: null,
  createdAt: '2026-09-09T00:00:00Z',
  updatedAt: '2026-09-09T00:01:00Z',
};

export const recoveryOperationsHandlers = [
  http.get('/api/admin/recovery/incidents', ({ request }) => {
    const params = new URL(request.url).searchParams;
    const status = params.get('status');
    const executionPack = params.get('executionPack');
    const items = (!status || status === incident.recoveryStatus)
      && (!executionPack || executionPack === incident.executionPack) ? [incident] : [];
    return HttpResponse.json({
      items,
      page: Number(params.get('page') ?? 0),
      size: Number(params.get('size') ?? 20),
      totalElements: items.length,
    });
  }),
  http.get('/api/admin/recovery/incidents/:recoveryId', ({ params, request }) => {
    const executionPack = new URL(request.url).searchParams.get('executionPack');
    if (executionPack && executionPack !== incident.executionPack) return new HttpResponse(null, { status: 404 });
    return HttpResponse.json({
      ...incident,
      recoveryId: params.recoveryId,
      connectorExecutionId: 'connector-execution-contract',
      leaseUntil: null,
      lastStatusQueriedAt: null,
      statusQueryEvidenceDigest: null,
      operations: [],
    });
  }),
  http.post('/api/admin/recovery/incidents/:recoveryId/:command', async ({ params, request }) => {
    const executionPack = new URL(request.url).searchParams.get('executionPack');
    if (executionPack && executionPack !== incident.executionPack) return new HttpResponse(null, { status: 404 });
    const body = await request.json() as { operationId: string };
    const operationType = {
      reconcile: 'RECONCILE',
      retry: 'RETRY',
      review: 'MARK_REVIEW',
    }[String(params.command)];
    if (!operationType) return new HttpResponse(null, { status: 404 });
    return HttpResponse.json({
      recoveryId: params.recoveryId,
      operationId: body.operationId,
      operationType,
      outcome: 'SUCCEEDED',
      recoveryStatus: operationType === 'MARK_REVIEW' ? 'MANUAL_REVIEW' : 'RETRY_SCHEDULED',
      reasonCode: operationType === 'RETRY' ? 'STATUS_NOT_SENT_RETRY_ALLOWED' : 'STATUS_QUERY_UNAVAILABLE',
      replayed: false,
    });
  }),
];
