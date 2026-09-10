import { http, HttpResponse } from 'msw';

export const auditTraceHandlers = [
  http.get('/api/admin/audit/executions', ({ request }) => {
    const params = new URL(request.url).searchParams;
    const workloadId = params.get('workloadId');
    const status = params.get('status');
    const executionPack = params.get('executionPack') ?? 'AI';
    return HttpResponse.json({
      items: workloadId || status ? [{
        executionId: 'exec-search-contract',
        requestId: 'req-search-contract',
        traceId: 'trace-search-contract',
        institutionId: 'institution_local',
        executionPack,
        workloadId: workloadId ?? 'customer_summary',
        purposeCode: 'CUSTOMER_SUPPORT',
        status: status ?? 'COMPLETED',
        finalAction: 'TRANSFORM',
        createdAt: '2026-09-09T00:00:00Z',
        updatedAt: '2026-09-09T00:00:01Z',
      }] : [],
      page: Number(params.get('page') ?? 0),
      size: Number(params.get('size') ?? 20),
      totalElements: workloadId || status ? 1 : 0,
    });
  }),
  http.get('/api/admin/audit/executions/:executionId/evidence', ({ params }) => HttpResponse.json({
    schemaVersion: 'adp-execution-evidence/v1',
    exportContentDigest: 'a'.repeat(64),
    executionId: params.executionId,
    requestId: 'req-contract',
    traceId: 'trace-contract',
    institutionId: 'institution_local',
    workloadId: 'customer_summary',
    purposeCode: 'CUSTOMER_SUPPORT',
    runtimeStatus: 'COMPLETED',
    authorizationStatus: 'PASSED',
    policy: { finalAction: 'TRANSFORM' },
    data: { inputDigest: 'input-digest' },
    egress: {
      destinationProfileId: 'ai-provider-local',
      outboundGuardStatus: 'PASSED',
      connectorStatus: 'ACKNOWLEDGED',
      providerRequestDigest: 'provider-request-digest',
      providerResponseDigest: 'provider-response-digest',
      responseGuardStatus: 'PASSED',
      controlledDeliveryStatus: 'DELIVERED',
      controlledDeliveryResponseDigest: 'delivered-response-digest',
    },
    recovery: { recoveryStatus: null, statusQueryEvidenceDigest: null },
    audit: { auditId: 'audit-contract', evidenceRefs: [] },
    createdAt: '2026-09-07T00:00:00Z',
    updatedAt: '2026-09-07T00:00:01Z',
  })),
];
