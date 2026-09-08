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
