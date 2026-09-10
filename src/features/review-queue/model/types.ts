export type ReviewExecutionPack = 'COMMON' | 'AI' | 'DIGITAL_ASSET' | 'SAAS';
export type ReviewSource = 'POLICY' | 'RECOVERY' | 'POST_EXECUTION';
export type ReviewNextAction = 'INSPECT_TRACE' | 'RECONCILE_EXTERNAL_STATUS' | 'INSPECT_POST_EXECUTION_EVIDENCE';

export type ReviewQueueItem = {
  executionId: string;
  requestId: string;
  traceId: string;
  institutionId: string;
  executionPack: ReviewExecutionPack;
  workloadId: string;
  purposeCode: string;
  runtimeStatus: 'REVIEW_REQUIRED';
  finalAction: string | null;
  reviewSource: ReviewSource;
  reviewSources: ReviewSource[];
  nextAction: ReviewNextAction;
  nextActions: ReviewNextAction[];
  reasonCodes: string[];
  recoveryId: string | null;
  recoveryStatus: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ReviewQueueDetail = ReviewQueueItem & {
  policyProfileId: string | null;
  policyProfileVersion: string | null;
  policyProfileDigest: string | null;
  connectorStatus: string | null;
  responseGuardStatus: string | null;
  controlledDeliveryStatus: string | null;
  retryDisposition: string | null;
  recoveryErrorCode: string | null;
  postExecutionEvidenceStatus: string | null;
  mismatchedFields: string[];
  tracePath: string;
  evidencePath: string;
};

export type ReviewQueuePage = {
  items: ReviewQueueItem[];
  page: number;
  size: number;
  totalElements: number;
};

export type ReviewQueueSearchParams = {
  executionPack?: ReviewExecutionPack;
  workloadId?: string;
  page?: number;
  size?: number;
};
