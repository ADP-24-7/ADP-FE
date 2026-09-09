import { http, HttpResponse } from 'msw';

export const operationsMonitoringHandlers = [
  http.get('/api/admin/operations/summary', ({ request }) => {
    const windowMinutes = Number(new URL(request.url).searchParams.get('windowMinutes') ?? 60);
    return HttpResponse.json({
      schemaVersion: 'adp-operations-summary/v1',
      windowMinutes,
      generatedAt: '2026-09-09T00:00:00Z',
      runtime: { total: 12, completed: 8, failed: 1, blocked: 2, reviewRequired: 1 },
      recovery: {
        backlog: 2,
        oldestBacklogAgeSeconds: 480,
        manualReview: 1,
        exhausted: 0,
        completedOperations: 4,
        averageOperationLatencyMillis: 125,
        staleOperations: 1,
        oldestStaleOperationAgeSeconds: 360,
      },
      policy: { currentSelections: 2, driftedSelections: 0, activations: 3, rollbacks: 1 },
      security: { deniedAttempts: 2, institutionScopeMismatch: 1, authorizationPolicyDenied: 1 },
    });
  }),
  http.get('/api/admin/operations/policy-events', ({ request }) => {
    const params = new URL(request.url).searchParams;
    const category = params.get('category') ?? 'CURRENT_SELECTION';
    return HttpResponse.json({
      items: [{
        eventId: 'policy-event-contract',
        category,
        eventType: category === 'CURRENT_SELECTION' ? 'ACTIVATED' : 'APPROVED',
        executionPack: 'AI',
        workloadId: params.get('workloadId') ?? 'customer_summary',
        purposeCode: 'CUSTOMER_SUPPORT',
        artifactId: 'policy-contract',
        artifactVersion: '1.0.0',
        artifactDigest: 'a'.repeat(64),
        previousArtifactId: null,
        previousArtifactVersion: null,
        previousArtifactDigest: null,
        artifactRevision: 3,
        selectionRevision: category === 'CURRENT_SELECTION' ? 1 : null,
        actorId: 'checker-local',
        reasonCode: 'ACTIVATION_APPROVED',
        occurredAt: '2026-09-09T00:00:00Z',
      }],
      page: Number(params.get('page') ?? 0),
      size: Number(params.get('size') ?? 20),
      total: 1,
    });
  }),
];
