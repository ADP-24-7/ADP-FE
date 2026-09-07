import { http, HttpResponse } from 'msw';

export const auditTraceHandlers = [
  http.get('/api/admin/audit/executions', () => HttpResponse.json({ items: [], page: 0, size: 20, totalElements: 0 })),
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
    egress: { connectorStatus: 'ACKNOWLEDGED' },
    recovery: { recoveryStatus: null },
    audit: { auditId: 'audit-contract', evidenceRefs: [] },
    createdAt: '2026-09-07T00:00:00Z',
    updatedAt: '2026-09-07T00:00:01Z',
  })),
];
