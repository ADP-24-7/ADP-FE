export type OverviewMetric = {
  current: number;
  previous: number;
  changePercent: number | null;
};

export type DigitalAssetOperationsOverview = {
  schemaVersion: 'adp-digital-asset-operations-overview/v1';
  generatedAt: string;
  from: string;
  to: string;
  metrics: {
    total: OverviewMetric;
    passed: OverviewMetric;
    blocked: OverviewMetric;
    failed: OverviewMetric;
    sentUnknown: OverviewMetric;
    reconciled: OverviewMetric;
  };
  flow: Array<{ source: string; target: string; count: number }>;
  trend: Array<{
    date: string;
    total: number;
    completed: number;
    blocked: number;
    failed: number;
    sentUnknown: number;
    reconciled: number;
  }>;
  violations: Array<{ stage: 'PRE_EXECUTION' | 'POST_EXECUTION'; reasonCode: string; count: number }>;
  hourlyStatuses: Array<{ hour: number; status: string; count: number }>;
  recentSignals: Array<{
    executionId: string;
    signalType: string;
    severity: 'CRITICAL' | 'WARNING' | 'INFO';
    status: string;
    reasonCode: string | null;
    occurredAt: string;
  }>;
  recentExecutions: Array<{
    executionId: string;
    requestId: string;
    workloadId: string;
    policyVersion: string | null;
    finalAction: string | null;
    runtimeStatus: string;
    connectorStatus: string | null;
    recoveryStatus: string | null;
    requestedAt: string;
  }>;
  coverage: {
    runtimeExecutions: number;
    decisionEvidence: number;
    preExecutionGuardEvidence: number;
    transactionEvidence: number;
    postExecutionEvidence: number;
    recoveryEvidence: number;
    unavailableDimensions: string[];
  };
};
