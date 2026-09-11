import { http, HttpResponse } from 'msw';

export const authHandlers = [
  http.get('/api/auth/csrf', () => HttpResponse.json({ headerName: 'X-XSRF-TOKEN', token: 'test-csrf' })),
  http.get('/api/auth/me', () => HttpResponse.json({
    principalId: 'privileged-operator-local',
    principalType: 'USER',
    displayName: 'Local Privileged Operator',
    institutionId: 'institution_local',
    roles: ['PRIVILEGED_OPERATOR'],
    workloadIds: ['*'],
    subjectAuthorizationRequired: false,
  })),
  http.post('/api/auth/login', async ({ request }) => {
    const body = await request.json() as { principalId?: string };
    const accounts = {
      'auditor-local': { displayName: 'Local Audit User', roles: ['AUDITOR'] },
      'operator-local': { displayName: 'Local Operations User', roles: ['OPERATOR'] },
      'privileged-operator-local': { displayName: 'Local Privileged Operator', roles: ['PRIVILEGED_OPERATOR'] },
    } as const;
    const principalId = body.principalId && body.principalId in accounts
      ? body.principalId as keyof typeof accounts
      : 'privileged-operator-local';
    return HttpResponse.json({
      principalId,
      principalType: 'USER',
      ...accounts[principalId],
      institutionId: 'institution_local',
      workloadIds: ['*'],
      subjectAuthorizationRequired: false,
    });
  }),
  http.post('/api/auth/logout', () => new HttpResponse(null, { status: 204 })),
];
