export type ReferenceEvidenceType = 'REGULATION' | 'REGULATORY_SANDBOX' | 'POLICY_GUIDE' | 'BANK_TREND' | 'DIGITAL_ASSET_INFRA';

export type ReferenceEvidence = {
  evidenceId: string;
  evidenceVersion: string;
  bundleId: string;
  bundleVersion: string;
  evidenceType: ReferenceEvidenceType;
  authority: string;
  title: string;
  sourceRef: string;
  sourceUrl: string | null;
  sourceDate: string | null;
  effectiveFrom: string | null;
  effectiveTo: string | null;
  claimScope: string;
  claimSummary: string;
  sourceLocator: string;
  analysisRef: string;
  analysisLocator: string;
  analysisVersion: string;
  status: 'REFERENCE_ONLY';
  workloadRefs: string[];
  contentDigest: string;
  createdAt: string;
};

export type ReferenceEvidencePage = {
  items: ReferenceEvidence[];
  total: number;
  limit: number;
  offset: number;
};

export type ReferenceEvidenceSearch = {
  evidenceType?: ReferenceEvidenceType;
  workloadId?: string;
  query?: string;
  limit?: number;
  offset?: number;
};

export type ReferenceEvidencePolicyLineage = {
  regulatoryEvidenceId: string;
  sourceVersion: string;
  sourceDigest: string;
  lawName: string;
  authority: string;
  officialSource: string;
  sourceUrl: string | null;
  applicableArticles: string;
  effectiveDate: string | null;
  policyArtifactId: string;
  policyVersion: string;
  lifecycleState: string;
  executionPack: 'COMMON' | 'AI' | 'DIGITAL_ASSET';
  workloadId: string;
  purposeCode: string;
  reviewStatus: 'CONNECTED' | 'PENDING_REVIEW' | 'MISSING';
  requirementRefs: string[];
  controlRefs: string[];
  boundAt: string;
};

