import { http, HttpResponse } from 'msw';

export const monitoringHandlers = [
  http.get('/actuator/health/readiness', () => HttpResponse.json({ status: 'UP' })),
];
