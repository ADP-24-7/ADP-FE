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
  http.post('/api/admin/policy-lifecycle/:artifactId/versions/:artifactVersion/shadow-evaluations', async ({ params, request }) => {
    const body = await request.json() as { evaluationCaseId: string };
    return HttpResponse.json({
      shadowEvaluationId: 'shadow-contract',
      institutionId: 'institution_local',
      workloadId: 'customer_summary',
      purposeCode: 'CUSTOMER_SUPPORT',
      baselineArtifactId: 'active-policy-contract',
      baselineArtifactVersion: '1.0.0',
      baselineArtifactDigest: '1'.repeat(64),
      candidateArtifactId: params.artifactId,
      candidateArtifactVersion: params.artifactVersion,
      candidateArtifactDigest: 'f'.repeat(64),
      candidateRevision: 4,
      evaluationCaseId: body.evaluationCaseId,
      evaluationCaseVersion: '1.0.0',
      inputDigest: '2'.repeat(64),
      baselineOutcomeDigest: '3'.repeat(64),
      candidateOutcomeDigest: '4'.repeat(64),
      diffFields: ['FINAL_ACTION'],
      result: 'DIFF',
      evaluatedBy: 'operator-local',
      evaluatedAt: '2026-09-09T00:00:00Z',
    }, { status: 201 });
  }),
];
