import { http, HttpResponse } from 'msw';

export const referenceEvidenceFixture = {
  evidenceId: 'evidence-policy-guide', evidenceVersion: '1.0.0', bundleId: 'bundle-reference', bundleVersion: '1.0.0', evidenceType: 'POLICY_GUIDE', authority: 'FPG Governance', title: 'AI 상담 개인정보 처리 기준', sourceRef: 'source-policy-guide', sourceUrl: null, sourceDate: '2026-09-01', effectiveFrom: '2026-09-01', effectiveTo: null, claimScope: 'AI customer summary', claimSummary: '민감정보 원문을 외부 응답으로 전달하지 않는다.', sourceLocator: 'policy-guide/section-4', analysisRef: 'analysis-policy-guide', analysisLocator: 'analysis/claim-1', analysisVersion: '1.0.0', status: 'REFERENCE_ONLY', workloadRefs: ['customer_summary'], contentDigest: 'a'.repeat(64), createdAt: '2026-09-10T00:00:00Z',
};

export const referenceEvidenceHandlers = [
  http.get('/api/admin/reference-evidence', () => HttpResponse.json({ items: [referenceEvidenceFixture], total: 1, limit: 20, offset: 0 })),
  http.get('/api/admin/reference-evidence/:evidenceId/versions/:evidenceVersion', ({ params }) => HttpResponse.json({ ...referenceEvidenceFixture, evidenceId: params.evidenceId, evidenceVersion: params.evidenceVersion })),
];

