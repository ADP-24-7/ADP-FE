import { http, HttpResponse } from 'msw';

const item = {
  findingId: 901,
  executionId: 'exec-security-finding-contract',
  requestId: 'req-security-finding-contract',
  traceId: 'trace-security-finding-contract',
  institutionId: 'institution_local',
  executionPack: 'AI',
  workloadId: 'customer_summary',
  purposeCode: 'CUSTOMER_SUPPORT',
  findingType: 'PHONE_NUMBER',
  location: '$.choices[0].message.content',
  detectorVersion: 'ai-response-regex-v2',
  evidenceDigest: 'a'.repeat(64),
  createdAt: '2026-09-10T00:02:00Z',
};

export const securityFindingHandlers = [
  http.get('/api/admin/security-findings', ({ request }) => {
    const params = new URL(request.url).searchParams;
    const items = !params.get('executionPack') || params.get('executionPack') === item.executionPack ? [item] : [];
    return HttpResponse.json({
      items,
      page: Number(params.get('page') ?? 0),
      size: Number(params.get('size') ?? 20),
      totalElements: items.length,
    });
  }),
  http.get('/api/admin/security-findings/:findingId', ({ params }) => HttpResponse.json({
    ...item,
    findingId: Number(params.findingId),
    runtimeStatus: 'BLOCKED',
    startOffset: 5,
    endOffset: 18,
    connectorExecutionId: 'connector-security-finding-contract',
    connectorStatus: 'ACKNOWLEDGED',
    responseGuardStatus: 'REJECTED',
    responseDigest: 'b'.repeat(64),
    tracePath: `/v1/runtime/executions/${item.executionId}/trace`,
    evidencePath: `/api/admin/audit/executions/${item.executionId}/evidence`,
  })),
];
