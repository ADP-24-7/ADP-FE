import { http, HttpResponse } from 'msw';

const identity = {
  principalId: 'svc_local_runtime',
  principalType: 'SERVICE',
  displayName: 'Local Runtime Harness',
  institutionId: 'institution_local',
  enabled: true,
  subjectAuthorizationRequired: true,
  roles: ['OPERATOR', 'RUNTIME_EXECUTOR'],
  workloadIds: ['customer_summary', 'tokenized_asset_purchase'],
  enabledApiKeyCount: 1,
  totalApiKeyCount: 1,
  createdAt: '2026-09-10T00:00:00Z',
};

export const adminIdentityHandlers = [
  http.get('/api/admin/identities', () => HttpResponse.json({
    items: [identity],
    page: 0,
    size: 20,
    totalElements: 1,
  })),
  http.get('/api/admin/identities/:principalId', () => HttpResponse.json({
    identity,
    permissions: [{
      workloadId: 'customer_summary',
      workloadName: 'Customer Support Summary',
      workloadEnabled: true,
      actionName: 'RUNTIME_EXECUTE',
      purpose: 'CUSTOMER_SUPPORT',
      subjectType: 'customer',
      subjectGrantCount: 2,
    }],
  })),
];
