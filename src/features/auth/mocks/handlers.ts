import { http, HttpResponse } from 'msw';

export const authHandlers = [
  http.get('/api/admin/auth/context', () => HttpResponse.json({
    principalId: 'operator-local',
    principalType: 'USER',
    displayName: 'Local Operator',
    institutionId: 'institution_local',
    roles: ['OPERATOR', 'PRIVILEGED_OPERATOR'],
    workloadIds: ['*'],
    subjectAuthorizationRequired: false,
  })),
];
