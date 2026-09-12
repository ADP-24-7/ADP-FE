import { http, HttpResponse } from 'msw';

export const referenceEvidenceFixture = {
  evidenceId: 'evidence-policy-guide', evidenceVersion: '1.0.0', bundleId: 'bundle-reference', bundleVersion: '1.0.0', evidenceType: 'POLICY_GUIDE', authority: 'FPG Governance', title: 'AI 상담 개인정보 처리 기준', sourceRef: 'source-policy-guide', sourceUrl: null, sourceDate: '2026-09-01', effectiveFrom: '2026-09-01', effectiveTo: null, claimScope: 'AI customer summary', claimSummary: '민감정보 원문을 외부 응답으로 전달하지 않는다.', sourceLocator: 'policy-guide/section-4', analysisRef: 'analysis-policy-guide', analysisLocator: 'analysis/claim-1', analysisVersion: '1.0.0', status: 'REFERENCE_ONLY', workloadRefs: ['customer_summary'], contentDigest: 'a'.repeat(64), createdAt: '2026-09-10T00:00:00Z',
};

export const regulatoryEvidenceLineageFixture = {
  regulatoryEvidenceId: 'REF-REG-PIPA-2026-09-11',
  sourceVersion: '21445-2026-09-11',
  sourceDigest: 'sha256:b724fb30e599c3a3548375101feed37dbb60f10c810c313d25ae6de43da4dfe6',
  lawName: '개인정보 보호법',
  authority: '개인정보보호위원회',
  officialSource: '국가법령정보센터',
  sourceUrl: 'https://www.law.go.kr/LSW/lsInfoP.do?lsiSeq=283839',
  applicableArticles: '제15조; 제16조; 제28조의8; 제29조',
  effectiveDate: '2026-09-11',
  policyArtifactId: 'candidate-policy-contract',
  policyVersion: '2.0.0',
  lifecycleState: 'ACTIVE',
  executionPack: 'AI',
  workloadId: 'customer_summary',
  purposeCode: 'CUSTOMER_SUPPORT',
  reviewStatus: 'CONNECTED',
  requirementRefs: ['PIPA-LAWFUL-PURPOSE', 'PIPA-MINIMIZATION'],
  controlRefs: ['PURPOSE_BINDING_POLICY', 'MINIMUM_FIELD_CONTRACT'],
  boundAt: '2026-09-12T00:00:00Z',
};

export const referenceEvidenceHandlers = [
  http.get('/api/admin/reference-evidence', () => HttpResponse.json({ items: [referenceEvidenceFixture], total: 1, limit: 20, offset: 0 })),
  http.get('/api/admin/reference-evidence/:evidenceId/versions/:evidenceVersion', ({ params }) => HttpResponse.json({ ...referenceEvidenceFixture, evidenceId: params.evidenceId, evidenceVersion: params.evidenceVersion })),
  http.get('/api/admin/reference-evidence/policy-artifacts/:artifactId/versions/:artifactVersion', ({ params }) => HttpResponse.json([{
    ...regulatoryEvidenceLineageFixture,
    policyArtifactId: params.artifactId,
    policyVersion: params.artifactVersion,
  }])),
];

