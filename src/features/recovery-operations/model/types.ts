export type ConnectorStatus = 'NOT_SENT' | 'SENT_UNKNOWN' | 'ACKNOWLEDGED' | 'COMPLETED' | 'FAILED';
export type RecoveryStatus = 'PENDING' | 'CLAIMED' | 'RETRY_SCHEDULED' | 'RECONCILED' | 'MANUAL_REVIEW' | 'EXHAUSTED';
export type RetryDisposition = 'RETRY_ALLOWED' | 'RECONCILE_FIRST' | 'NO_RETRY' | 'MANUAL_REVIEW';
export type RecoveryOperationType = 'RECONCILE' | 'RETRY' | 'MARK_REVIEW';
export type RecoveryOperationOutcome = 'IN_PROGRESS' | 'SUCCEEDED' | 'REJECTED' | 'FAILED';

export type RecoveryIncidentSummary = {
  recoveryId: string;
  executionId: string;
  institutionId: string;
  executionPack: ExecutionPackApiValue | null;
  workloadId: string;
  purposeCode: string;
  connectorId: string;
  observedStatus: ConnectorStatus;
  lastObservedExternalStatus: ConnectorStatus | null;
  recoveryStatus: RecoveryStatus;
  retryDisposition: RetryDisposition;
  attemptCount: number;
  maxAttempts: number;
  nextAttemptAt: string | null;
  lastErrorCode: string | null;
  createdAt: string;
  updatedAt: string;
};

export type RecoveryOperationEvent = {
  operationId: string;
  actorPrincipalId: string;
  operationType: RecoveryOperationType;
  outcome: RecoveryOperationOutcome;
  reasonCode: string | null;
  evidenceDigest: string | null;
  createdAt: string;
  completedAt: string | null;
};

export type RecoveryIncidentDetail = RecoveryIncidentSummary & {
  connectorExecutionId: string;
  leaseUntil: string | null;
  lastStatusQueriedAt: string | null;
  statusQueryEvidenceDigest: string | null;
  operations: RecoveryOperationEvent[];
};

export type RecoveryIncidentPage = {
  items: RecoveryIncidentSummary[];
  page: number;
  size: number;
  totalElements: number;
};

export type RecoverySearchParams = {
  executionPack?: ExecutionPackApiValue;
  status?: RecoveryStatus;
  page?: number;
  size?: number;
};

export type RecoveryCommandResult = {
  recoveryId: string;
  operationId: string;
  operationType: RecoveryOperationType;
  outcome: RecoveryOperationOutcome;
  recoveryStatus: RecoveryStatus;
  reasonCode: string | null;
  replayed: boolean;
};
import type { ExecutionPackApiValue } from '../../../shared/prototype';
