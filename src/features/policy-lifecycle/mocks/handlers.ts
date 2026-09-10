import { http, HttpResponse } from 'msw';

export const policyLifecycleHandlers = [
  http.get('/api/admin/policy-lifecycle', ({ request }) => {
    const url = new URL(request.url);
    const executionPack = url.searchParams.get('executionPack') ?? 'AI';
    return HttpResponse.json({
      items: [{
        artifactId: 'active-policy-contract',
        artifactVersion: '1.0.0',
        artifactDigest: '1'.repeat(64),
        policyLayer: 'WORKLOAD',
        executionPack,
        workloadId: 'customer_summary',
        purposeCode: 'CUSTOMER_SUPPORT',
        lifecycleStage: 'ACTIVE',
        createdBy: 'maker-local',
        revision: 7,
        createdAt: '2026-09-09T00:00:00Z',
        updatedAt: '2026-09-09T00:00:01Z',
        currentSelection: true,
        actionable: false,
        nextAction: null,
      }],
      total: 1,
      limit: Number(url.searchParams.get('limit') ?? 10),
      offset: Number(url.searchParams.get('offset') ?? 0),
    });
  }),
  http.get('/api/admin/policy-lifecycle/:artifactId/versions/:artifactVersion/history', ({ params }) => HttpResponse.json({
    artifact: {
      artifactId: params.artifactId,
      artifactVersion: params.artifactVersion,
      artifactDigest: '1'.repeat(64),
      institutionId: 'institution_local',
      policyLayer: 'WORKLOAD',
      executionPack: 'AI',
      workloadId: 'customer_summary',
      purposeCode: 'CUSTOMER_SUPPORT',
      lifecycleStage: 'ACTIVE',
      createdBy: 'maker-local',
      revision: 7,
      createdAt: '2026-09-09T00:00:00Z',
      updatedAt: '2026-09-09T00:00:01Z',
    },
    currentSelection: true,
    transitions: [{
      transitionId: 1,
      fromStage: 'APPROVED',
      toStage: 'ACTIVE',
      actorId: 'checker-local',
      reasonCode: 'ACTIVATION_APPROVED',
      artifactDigest: '1'.repeat(64),
      approvalGateVersion: 'NOT_APPLICABLE',
      shadowEvaluationId: null,
      occurredAt: '2026-09-09T00:00:01Z',
    }],
    transitionTotal: 1,
    transitionHasMore: false,
    shadowEvaluations: [],
    shadowTotal: 0,
    shadowHasMore: false,
  })),
  http.post('/api/admin/policy-lifecycle', async ({ request }) => {
    const body = await request.json() as Record<string, string>;
    return HttpResponse.json({
      ...body,
      institutionId: 'institution_local',
      lifecycleStage: 'DRAFT',
      createdBy: 'maker-local',
      revision: 0,
      createdAt: '2026-09-09T00:00:00Z',
      updatedAt: '2026-09-09T00:00:00Z',
    }, { status: 201 });
  }),
  http.get('/api/admin/policy-lifecycle/current-selection', ({ request }) => {
    const url = new URL(request.url);
    return HttpResponse.json({
      institutionId: 'institution_local',
      policyLayer: 'WORKLOAD',
      executionPack: url.searchParams.get('executionPack'),
      workloadId: url.searchParams.get('workloadId'),
      purposeCode: url.searchParams.get('purposeCode'),
      artifactId: 'active-policy-contract',
      artifactVersion: '1.0.0',
      artifactDigest: '1'.repeat(64),
      artifactRevision: 7,
      selectionRevision: 3,
      selectedBy: 'checker-local',
      selectedAt: '2026-09-09T00:00:00Z',
    });
  }),
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
    const isMatch = body.evaluationCaseId === 'GOLDEN_ALLOW';
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
      diffFields: isMatch ? [] : ['FINAL_ACTION'],
      result: isMatch ? 'MATCH' : 'DIFF',
      evaluatedBy: 'operator-local',
      evaluatedAt: '2026-09-09T00:00:00Z',
    }, { status: 201 });
  }),
  http.post('/api/admin/policy-lifecycle/:artifactId/versions/:artifactVersion/transitions', async ({ params, request }) => {
    const body = await request.json() as { targetStage: string };
    if (!['VALIDATED', 'CANDIDATE', 'REPLAY', 'SHADOW'].includes(body.targetStage)) {
      return HttpResponse.json({
        reasonCode: 'POLICY_LIFECYCLE_TRANSITION_INVALID',
        message: 'Policy lifecycle operation rejected',
      }, { status: 422 });
    }
    return HttpResponse.json({
      artifactId: params.artifactId,
      artifactVersion: params.artifactVersion,
      artifactDigest: 'f'.repeat(64),
      institutionId: 'institution_local',
      policyLayer: 'WORKLOAD',
      executionPack: 'AI',
      workloadId: 'customer_summary',
      purposeCode: 'CUSTOMER_SUPPORT',
      lifecycleStage: body.targetStage,
      createdBy: 'maker-local',
      revision: 5,
      createdAt: '2026-09-09T00:00:00Z',
      updatedAt: '2026-09-09T00:00:01Z',
    });
  }),
  http.post('/api/admin/policy-lifecycle/:artifactId/versions/:artifactVersion/approvals', async ({ params, request }) => {
    const body = await request.json() as { shadowEvaluationId: string };
    if (body.shadowEvaluationId !== 'shadow-contract') {
      return HttpResponse.json({
        reasonCode: body.shadowEvaluationId === 'shadow-diff'
          ? 'POLICY_SHADOW_DIFF_NOT_APPROVABLE'
          : 'POLICY_SHADOW_APPROVAL_EVIDENCE_NOT_FOUND',
        message: 'Policy lifecycle operation rejected',
      }, { status: body.shadowEvaluationId === 'shadow-diff' ? 422 : 404 });
    }
    return HttpResponse.json({
    artifactId: params.artifactId,
    artifactVersion: params.artifactVersion,
    artifactDigest: 'f'.repeat(64),
    institutionId: 'institution_local',
    policyLayer: 'WORKLOAD',
    executionPack: 'AI',
    workloadId: 'customer_summary',
    purposeCode: 'CUSTOMER_SUPPORT',
    lifecycleStage: 'APPROVED',
    createdBy: 'maker-local',
    revision: 6,
    createdAt: '2026-09-09T00:00:00Z',
    updatedAt: '2026-09-09T00:00:02Z',
    });
  }),
  http.post('/api/admin/policy-lifecycle/:artifactId/versions/:artifactVersion/activations', async ({ params, request }) => {
    const body = await request.json() as { expectedArtifactRevision: number; expectedSelectionRevision: number };
    if (body.expectedArtifactRevision !== 6 || body.expectedSelectionRevision !== 3) {
      return HttpResponse.json({
        reasonCode: 'POLICY_CURRENT_SELECTION_STALE',
        message: 'Policy lifecycle operation rejected',
      }, { status: 409 });
    }
    return HttpResponse.json({
    institutionId: 'institution_local',
    policyLayer: 'WORKLOAD',
    executionPack: 'AI',
    workloadId: 'customer_summary',
    purposeCode: 'CUSTOMER_SUPPORT',
    artifactId: params.artifactId,
    artifactVersion: params.artifactVersion,
    artifactDigest: 'f'.repeat(64),
    artifactRevision: 7,
    selectionRevision: 4,
    selectedBy: 'checker-local',
    selectedAt: '2026-09-09T00:00:03Z',
    });
  }),
  http.post('/api/admin/policy-lifecycle/:artifactId/versions/:artifactVersion/rollbacks', async ({ params, request }) => {
    const body = await request.json() as { expectedTargetRevision: number; expectedSelectionRevision: number };
    if (body.expectedTargetRevision !== 8 || body.expectedSelectionRevision !== 4) {
      return HttpResponse.json({
        reasonCode: 'POLICY_CURRENT_SELECTION_STALE',
        message: 'Policy lifecycle operation rejected',
      }, { status: 409 });
    }
    return HttpResponse.json({
    institutionId: 'institution_local',
    policyLayer: 'WORKLOAD',
    executionPack: 'AI',
    workloadId: 'customer_summary',
    purposeCode: 'CUSTOMER_SUPPORT',
    artifactId: params.artifactId,
    artifactVersion: params.artifactVersion,
    artifactDigest: '1'.repeat(64),
    artifactRevision: 9,
    selectionRevision: 5,
    selectedBy: 'checker-local',
    selectedAt: '2026-09-09T00:00:04Z',
    });
  }),
];
