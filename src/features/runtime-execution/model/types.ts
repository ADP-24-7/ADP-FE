import type { FinalAction } from '../../../shared/types/runtime';

export type RuntimeExecutionStage =
  | 'AUTHORIZATION'
  | 'RETRIEVAL'
  | 'DETECTION'
  | 'DECISION'
  | 'TRANSFORM'
  | 'OUTBOUND_GUARD'
  | 'PROVIDER'
  | 'RESPONSE_GUARD'
  | 'AUDIT';

export type RuntimeExecutionStatus =
  | 'RECEIVED'
  | 'AUTHORIZED'
  | 'RETRIEVED'
  | 'DECIDED'
  | 'TRANSFORMED'
  | 'EGRESSING'
  | 'COMPLETED'
  | 'REVIEW_REQUIRED'
  | 'BLOCKED'
  | 'FAILED';

export type RuntimeExecutionInput = Record<string, unknown>;

export type RuntimeExecutionRequest = {
  workloadId: string;
  purposeCode: string;
  subjectScope: string;
  providerProfileId: string;
  input: RuntimeExecutionInput;
  idempotencyKey: string;
};

export type RuntimeExecution = {
  executionId: string;
  traceId: string;
  status: RuntimeExecutionStatus;
  finalAction?: FinalAction;
  reasonCodes: string[];
  policyVersion?: string;
  artifactVersion?: string;
  stages: RuntimeExecutionTraceStage[];
  output?: RuntimeExecutionOutput;
};

export type RuntimeExecutionTraceStage = {
  stage: RuntimeExecutionStage;
  status: RuntimeExecutionStatus;
  reasonCodes?: string[];
  startedAt?: string;
  completedAt?: string;
};

export type RuntimeExecutionTrace = {
  executionId: string;
  traceId: string;
  stages: RuntimeExecutionTraceStage[];
};

export type RuntimeExecutionOutput = {
  displayText?: string;
  redactionApplied?: boolean;
  metadata?: Record<string, unknown>;
};
