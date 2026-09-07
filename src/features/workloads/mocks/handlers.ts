import { http, HttpResponse } from 'msw';

export const workloadHandlers = [
  http.post('/api/runtime/context/preview', () => HttpResponse.json({
    schemaVersion: 'canonical-context/v1',
    contextId: 'context-contract',
    dataAccessId: 'data-access-contract',
    workloadId: 'customer_summary',
    purpose: 'CUSTOMER_SUPPORT',
    subjectType: 'customer',
    subjectRefDigest: 'subject-digest',
    contextDigest: 'context-digest',
    fields: [],
    detection: { detectorVersion: 'regex/v1', findings: [] },
  })),
];
