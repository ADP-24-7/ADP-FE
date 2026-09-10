export type AuditExportFormat = 'CSV' | 'PDF';
export type AuditExportStatus =
  | 'REQUESTED'
  | 'APPROVED'
  | 'GENERATING'
  | 'READY'
  | 'REJECTED'
  | 'FAILED'
  | 'EXPIRED'
  | 'REVOKED';

export type AuditExportJob = {
  exportId: string;
  institutionId: string;
  workloadId: string;
  executionPack: 'AI' | 'DIGITAL_ASSET' | 'COMMON' | 'SAAS';
  executionId: string;
  reportType: 'EXECUTION_EVIDENCE';
  format: AuditExportFormat;
  status: AuditExportStatus;
  scopeDigest: string;
  requesterId: string;
  approverId?: string | null;
  requestReason: string;
  approvalReason?: string | null;
  rowCount?: number | null;
  contentDigest?: string | null;
  contentSize?: number | null;
  contentType?: string | null;
  fileName?: string | null;
  failureCode?: string | null;
  createdAt: string;
  approvedAt?: string | null;
  generatedAt?: string | null;
  expiresAt?: string | null;
  downloadedAt?: string | null;
  updatedAt: string;
};

export type AuditExportEvent = {
  eventId: string;
  actorId: string;
  action: string;
  fromStatus?: AuditExportStatus | null;
  toStatus: AuditExportStatus;
  reasonCode: string;
  occurredAt: string;
};

export type AuditExportDetail = { job: AuditExportJob; events: AuditExportEvent[] };

export type CreateAuditExportRequest = {
  executionId: string;
  reportType: 'EXECUTION_EVIDENCE';
  format: AuditExportFormat;
  reason: string;
  idempotencyKey: string;
};
