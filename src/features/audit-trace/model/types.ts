export type AuditExecutionSummary = {
  executionId: string;
  requestId: string;
  traceId: string;
  institutionId: string;
  executionPack: 'AI' | 'DIGITAL_ASSET' | 'COMMON' | 'SAAS';
  workloadId: string;
  purposeCode: string;
  status: string;
  finalAction: string;
  policyVersion?: string | null;
  snapshotDigest?: string | null;
  destinationProfileId?: string | null;
  destinationProfileVersion?: string | null;
  connectorStatus?: string | null;
  recoveryStatus?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AuditExecutionPage = {
  items: AuditExecutionSummary[];
  page: number;
  size: number;
  totalElements: number;
};

export type AuditSearchParams = {
  executionPack?: 'AI' | 'DIGITAL_ASSET' | 'COMMON' | 'SAAS';
  workloadId?: string;
  status?: string;
  from?: string;
  to?: string;
  page?: number;
  size?: number;
};

export type ExecutionEvidencePack = {
  schemaVersion: string;
  exportContentDigest: string;
  executionId: string;
  requestId: string;
  traceId: string;
  institutionId: string;
  workloadId: string;
  purposeCode: string;
  runtimeStatus: string;
  authorizationStatus: string;
  idempotency?: {
    existingExecutionReused: boolean;
    replayCount: number;
    additionalExternalEffectCount: number;
  };
  policy: {
    approvalReference?: string | null;
    approvalVersion?: string | null;
    approvalScopeDigest?: string | null;
    policyVersion?: string | null;
    snapshotDigest?: string | null;
    decisionId?: string | null;
    finalAction?: string | null;
  };
  data: {
    subjectRefDigest?: string | null;
    inputDigest?: string | null;
    canonicalContextDigest?: string | null;
    runtimeContextDigest?: string | null;
    requestedFieldCount?: number | null;
    requestedFieldsDigest?: string | null;
    retrievedFieldCount?: number | null;
    retrievedFieldsDigest?: string | null;
    transformedFieldCount?: number | null;
    transformedFieldsDigest?: string | null;
    releasedFieldCount?: number | null;
    releasedFieldsDigest?: string | null;
  };
  egress: {
    destinationProfileId?: string | null;
    destinationProfileVersion?: string | null;
    destinationProfileDigest?: string | null;
    outboundCandidateDigest?: string | null;
    outboundGuardStatus?: string | null;
    connectorExecutionId?: string | null;
    connectorStatus?: string | null;
    providerRequestDigest?: string | null;
    providerResponseDigest?: string | null;
    responseGuardStatus?: string | null;
    controlledDeliveryStatus?: string | null;
    controlledDeliveryResponseDigest?: string | null;
  };
  recovery: Record<string, string | number | null>;
  audit: { auditId: string; reasonCode?: string | null; evidenceRefs: string[] };
  createdAt: string;
  updatedAt: string;
};
