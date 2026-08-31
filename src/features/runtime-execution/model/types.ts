export type RuntimeExecutionStage = 'DETECTION' | 'DECISION' | 'TRANSFORM' | 'CONNECTOR' | 'AUDIT';

export type RuntimeExecutionStatus = 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED';

export type RuntimeExecutionRequest = {
  workloadId: string;
  inputRef: string;
  dryRun?: boolean;
};

export type RuntimeExecution = {
  executionId: string;
  status: RuntimeExecutionStatus;
};

export type RuntimeExecutionTraceStage = {
  stage: RuntimeExecutionStage;
  status: RuntimeExecutionStatus;
  startedAt?: string;
  completedAt?: string;
};

export type RuntimeExecutionTrace = {
  executionId: string;
  stages: RuntimeExecutionTraceStage[];
};
