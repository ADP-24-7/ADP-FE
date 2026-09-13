export type OverviewMetric = {
  current: number;
  previous: number;
  changePercent: number | null;
};

export type OverviewRate = {
  current: number;
  previous: number;
  changePoint: number | null;
};

export type AiOperationsOverview = {
  schemaVersion: 'adp-ai-operations-overview/v1';
  generatedAt: string;
  from: string;
  to: string;
  metrics: {
    total: OverviewMetric;
    minimized: OverviewMetric;
    externalCalls: OverviewMetric;
    blocked: OverviewMetric;
    reviewRequired: OverviewMetric;
    responseRejected: OverviewMetric;
  };
  rates: {
    policyCoverage: OverviewRate;
    evidenceCoverage: OverviewRate;
    responseSafe: OverviewRate;
  };
  flow: Array<{ source: string; target: string; count: number }>;
  trend: Array<{
    date: string;
    total: number;
    minimized: number;
    externalCalls: number;
    completed: number;
    blocked: number;
    reviewRequired: number;
    responseRejected: number;
  }>;
  dataClassControls: Array<{
    dataClass: string;
    protectionRequired: boolean;
    transformedFields: number;
    retainedFields: number;
    responseFindings: number;
  }>;
  latency: Array<{ workloadId: string; p50Ms: number | null; p95Ms: number | null; observations: number }>;
  hourlyStatuses: Array<{ hour: number; status: string; count: number }>;
  policyCoverage: Array<{
    workloadId: string;
    total: number;
    normal: number;
    review: number;
    blocked: number;
  }>;
  workloadViolations: Array<{
    workloadId: string;
    violationType: string;
    count: number;
  }>;
  workloadOutcomes: Array<{
    workloadId: string;
    policyAllowed: number;
    finalCompleted: number;
  }>;
  actionSummary: {
    providerFailures: number;
    providerUnknown: number;
    reviewRequired: number;
    policyBlocked: number;
    responseRejected: number;
  };
  recentSignals: Array<{
    executionId: string;
    signalType: string;
    severity: 'CRITICAL' | 'WARNING' | 'INFO';
    status: string;
    workloadId: string;
    stage: string;
    reasonCode: string | null;
    nextAction: string;
    occurredAt: string;
  }>;
  recentExecutions: {
    items: Array<{
      executionId: string;
      requestId: string;
      workloadId: string;
      policyVersion: string | null;
      finalAction: string | null;
      runtimeStatus: string;
      providerStatus: string | null;
      responseGuardStatus: string | null;
      requestedFieldCount: number | null;
      retrievedFieldCount: number | null;
      transformedFieldCount: number | null;
      releasedFieldCount: number | null;
      providerModelId: string | null;
      latencyMs: number | null;
      reasonCodes: string | null;
      requestedAt: string;
    }>;
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
  };
  coverage: {
    runtimeExecutions: number;
    policyDecisions: number;
    dataAccessEvents: number;
    transformEvidence: number;
    outboundEvidence: number;
    modelEvidence: number;
    responseGuardEvidence: number;
  };
};
