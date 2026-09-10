import { http, HttpResponse } from 'msw';

export const authHandlers = [
  http.get('/api/auth/csrf', () => HttpResponse.json({ headerName: 'X-XSRF-TOKEN', token: 'test-csrf' })),
  http.get('/api/auth/me', () => HttpResponse.json({
    principalId: 'operator-local',
    principalType: 'USER',
    displayName: 'Local Operator',
    institutionId: 'institution_local',
    roles: ['OPERATOR', 'PRIVILEGED_OPERATOR'],
    workloadIds: ['*'],
    subjectAuthorizationRequired: false,
  })),
  http.post('/api/auth/login', () => HttpResponse.json({
    principalId: 'operator-local',
    principalType: 'USER',
    displayName: 'Local Operator',
    institutionId: 'institution_local',
    roles: ['OPERATOR', 'PRIVILEGED_OPERATOR'],
    workloadIds: ['*'],
    subjectAuthorizationRequired: false,
  })),
  http.post('/api/auth/logout', () => new HttpResponse(null, { status: 204 })),
];
