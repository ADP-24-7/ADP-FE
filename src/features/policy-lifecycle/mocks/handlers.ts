import { http, HttpResponse } from 'msw';

export const policyLifecycleHandlers = [
  http.get('/api/admin/policy-lifecycle/:artifactId/versions/:artifactVersion', ({ params }) => HttpResponse.json({
    artifactId: params.artifactId,
    artifactVersion: params.artifactVersion,
    artifactDigest: 'a'.repeat(64),
    institutionId: 'institution_local',
    policyLayer: 'WORKLOAD',
    executionPack: 'AI',
    workloadId: 'customer_summary',
    purposeCode: 'CUSTOMER_SUPPORT',
    lifecycleStage: 'ACTIVE',
    createdBy: 'maker-local',
    revision: 6,
    createdAt: '2026-09-07T00:00:00Z',
    updatedAt: '2026-09-07T00:00:01Z',
  })),
];
