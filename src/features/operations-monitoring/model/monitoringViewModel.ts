export type MonitoringSignalState = 'normal' | 'info' | 'attention' | 'critical' | 'unknown';

export type MonitoringMetric = {
  id: string;
  label: string;
  value: string;
  state: MonitoringSignalState;
  stateLabel: string;
  interpretation: string;
  impact: string;
  recommendation: string;
  rawField: string;
  rawValue: string;
  criterion: string;
  priority: 'primary' | 'secondary';
};

export type MonitoringIssue = {
  id: string;
  title: string;
  state: MonitoringSignalState;
  stateLabel: string;
  summary: string;
  recommendation: string;
  executionId: string;
  workloadId: string;
  observedStatus: string;
  recoveryStatus: string;
  retryDisposition: string;
  updatedAt: string;
};

export type RuntimeStageHealth = {
  id: string;
  label: string;
  state: MonitoringSignalState;
  stateLabel: string;
  summary: string;
  evidence: string;
  connection: 'observed' | 'partial' | 'not-connected';
  connectionLabel: 'OBSERVED' | 'PARTIAL' | 'NOT CONNECTED';
};

export type OperationsMonitoringViewModel = {
  brief: {
    state: MonitoringSignalState;
    title: string;
    summary: string;
    priorityCount: number;
    generatedAt: string;
  };
  metrics: MonitoringMetric[];
  issues: MonitoringIssue[];
  stages: RuntimeStageHealth[];
};
