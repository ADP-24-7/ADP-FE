export type AiEvaluationReadinessStatus =
  | 'NOT_STARTED'
  | 'INCOMPLETE'
  | 'PROVENANCE_MISMATCH'
  | 'MODEL_MISMATCH'
  | 'READY';

export type AiEvaluationCaseModelEvidence = {
  evalCaseId: string;
  profileId: string;
  executionId?: string | null;
  runtimeStatus?: string | null;
  providerStatus?: string | null;
  evidenceStatus?: string | null;
};

export type AiEvaluationRunReadiness = {
  evaluationRunId: string;
  evaluationRunVersion: string;
  status: AiEvaluationReadinessStatus;
  bundleAvailable: boolean;
  expectedExecutionCount: number;
  storedExecutionCount: number;
  observedExecutionCount: number;
  completeEvidenceCount: number;
  missingExecutionCount: number;
  unexpectedExecutionCount: number;
  caseModels: AiEvaluationCaseModelEvidence[];
};

export type AiEvaluationBundle = {
  manifest: {
    schemaVersion: string;
    bundleId: string;
    bundleVersion: string;
    contentDigest: string;
    evaluationRunId: string;
    evaluationRunVersion: string;
    executionCount: number;
    caseCount: number;
    modelCount: number;
    generatedAt: string;
    executionFrom: string;
    executionCutoffAt: string;
  };
  executionConfig: {
    evaluationRunId: string;
    evaluationRunVersion: string;
    evaluationContractDigest: string;
    datasetId: string;
    datasetVersion: string;
    datasetDigest: string;
    policySnapshotDigest: string;
    models: Array<{
      profileId: string;
      profileVersion: string;
      profileDigest: string;
      providerModelId: string;
      providerModelVersion: string;
      connectionProfileId: string;
      maxTokens: number;
      temperature: number;
      samplingProfileVersion: string;
      destinationProfileDigest: string;
    }>;
  };
  caseResults: Array<{
    executionId: string;
    evalCaseId: string;
    modelProfileId: string;
    runtimeStatus: string;
    finalAction: string;
    responseGuardStatus: string;
    controlledDeliveryStatus: string;
    providerStatus: string;
    errorCategory?: string | null;
    evidenceStatus: string;
    expectedInputDigest: string;
    actualInputDigest: string;
  }>;
  runtimeMetrics: Array<{
    executionId: string;
    evalCaseId: string;
    modelProfileId: string;
    measurementType: string;
    fullResponseLatencyMillis?: number | null;
    attemptElapsedMillis?: number | null;
    initialRuntimeLatencyMillis?: number | null;
    inputTokens?: number | null;
    outputTokens?: number | null;
    totalTokens?: number | null;
    tokenUsageStatus: string;
    providerHttpStatus?: number | null;
    providerStatus: string;
    errorCategory?: string | null;
  }>;
  failureSummary: {
    evaluatedExecutionCount: number;
    failed: number;
    sentUnknown: number;
    notAttempted: number;
    byErrorCategory: Record<string, number>;
  };
  traceIndex: Array<{
    executionId: string;
    decisionId: string;
    connectorExecutionId: string;
    providerRequestDigest: string;
    providerResponseDigest: string;
    createdAt: string;
    updatedAt: string;
  }>;
};

export type AiTransformGovernanceFieldControl = {
  fieldName: string;
  classification: string;
  businessNeed: string;
  fieldRequirement: string;
  transformIntents: string[];
  utilityRequirements: string[];
  candidateTransformMethods: string[];
  prohibitedTransformMethods: string[];
  currentRuntimeMethod: string;
  requiredTransformMethod: string;
  validatedMethod: string;
  privacyResult: string;
  utilityResult: string;
  relationResult: string;
  exactResult: string;
  runtimeCompatibility: string;
  destinationCompatibility: string;
  methodEvidenceIds: string[];
  currentRuntimeRequirementMatch: boolean;
  externalReleaseAllowed: boolean;
  applicability: string;
  requirementStatus: string;
  evidenceRef: string;
};

export type AiTransformGovernanceProfile = {
  evaluationRunId: string;
  workloadId: string;
  workloadName: string;
  businessDomain: string;
  purposeCode: string;
  purposeDescription: string;
  subjectScope: string;
  actionType: string;
  requesterRole: string;
  e2HandoffDigest: string;
  requirementVersion: string;
  e3ProfileVersion: string;
  e3ProfileDigest: string;
  e3ValidationStatus: string;
  activationStatus: string;
  e2ValidationStatus: string;
  providerGovernanceStatus: string;
  externalExecutionStatus: string;
  providerCallAuthorized: boolean;
  providerGovernance: {
    providerConnectionProfileId: string;
    modelProfileIds: string[];
    allowedRegions: string[];
    requestedRegion: string;
    resolvedRegion: string;
    regionDecision: string;
    regionReasonCode?: string | null;
    approvedRetentionMode: string;
    maximumRetentionDays?: number | null;
    providerConfiguredRetentionMode: string;
    providerRetentionDays?: number | null;
    retentionVerificationStatus: string;
    retentionDecision: string;
    retentionReasonCode?: string | null;
    allowedReusePurposes: string[];
    providerReusePurposes: string[];
    reuseDecision: string;
    reuseReasonCode?: string | null;
    governanceDecision: string;
    reasonCodes: string[];
    contractVersion: string;
    contractDigest: string;
    activationStatus: string;
  };
  fieldControls: AiTransformGovernanceFieldControl[];
  requirementEnforcementGaps: Array<{
    fieldName: string;
    currentRuntimeMethod: string;
    requiredTransformMethod: string;
    reason: string;
    requiredAction: string;
  }>;
};

export type AiCalibrationFindingGroup = {
  findingType: string;
  sourceDataClass?: string | null;
  transformStrategy?: string | null;
  fieldTreatment?: string | null;
  count: number;
};

export type AiCalibrationEvidence = {
  manifest: {
    schemaVersion: 'adp-ai-calibration-evidence/v1';
    contentDigest: string;
    evaluationRunId: string;
    evaluationRunVersion: string;
    executionCount: number;
    generatedAt: string;
    executionFrom: string;
    executionCutoffAt: string;
  };
  calibrationReady: boolean;
  readinessReasonCodes: string[];
  executions: Array<{
    executionId: string;
    evalCaseId: string;
    modelProfileId: string;
    responseGuardStatus: 'PASSED' | 'REJECTED' | 'NOT_EVALUATED';
    controlledDeliveryStatus: 'DELIVERED' | 'WITHHELD';
    reasonCodes: string[];
    detectorVersion?: string | null;
    findingCount: number;
    observedFindingCount: number;
    missingReflectionMetadataCount: number;
    findingGroups: AiCalibrationFindingGroup[];
  }>;
};
