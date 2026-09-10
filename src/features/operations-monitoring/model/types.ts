import type { ExecutionPackApiValue } from '../../../shared/prototype';

export type OperationsSummary = {
  schemaVersion: 'adp-operations-summary/v2';
  windowMinutes: number;
  generatedAt: string;
  scope: {
    requestedExecutionPack: ExecutionPackApiValue | null;
    defaultSemantics: 'ALL_AUTHORIZED_WORKLOADS' | 'REQUESTED_EXECUTION_PACK';
    packScopedSections: string[];
    allAuthorizedWorkloadSections: string[];
  };
  runtime: {
    total: number;
    completed: number;
    failed: number;
    blocked: number;
    reviewRequired: number;
  };
  recovery: {
    backlog: number;
    oldestBacklogAgeSeconds: number | null;
    manualReview: number;
    exhausted: number;
    completedOperations: number;
    averageOperationLatencyMillis: number | null;
    staleOperations: number;
    oldestStaleOperationAgeSeconds: number | null;
  };
  policy: {
    currentSelections: number;
    driftedSelections: number;
    activations: number;
    rollbacks: number;
  };
  security: {
    deniedAttempts: number;
    institutionScopeMismatch: number;
    authorizationPolicyDenied: number;
  };
};

export type PolicyEventCategory = 'LIFECYCLE_TRANSITION' | 'CURRENT_SELECTION';

export type PolicyOperationEvent = {
  eventId: string;
  category: PolicyEventCategory;
  eventType: string;
  executionPack: string;
  workloadId: string;
  purposeCode: string;
  artifactId: string;
  artifactVersion: string;
  artifactDigest: string;
  previousArtifactId: string | null;
  previousArtifactVersion: string | null;
  previousArtifactDigest: string | null;
  artifactRevision: number | null;
  selectionRevision: number | null;
  actorId: string;
  reasonCode: string;
  occurredAt: string;
};

export type PolicyOperationEventPage = {
  items: PolicyOperationEvent[];
  page: number;
  size: number;
  total: number;
};

export type PolicyOperationEventParams = {
  executionPack?: ExecutionPackApiValue;
  workloadId?: string;
  category?: PolicyEventCategory;
  from?: string;
  to?: string;
  page?: number;
  size?: number;
};
