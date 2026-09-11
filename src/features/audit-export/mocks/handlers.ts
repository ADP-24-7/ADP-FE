import { http, HttpResponse } from 'msw';

const summary = {
  principalId: 'operator-local', approvalAvailable: false, operationsAvailable: false,
  personal: { pendingApproval: 1, approvedOrGenerating: 0, readyToDownload: 1, downloaded: 0, rejected: 0, failedOrExpired: 0 },
  approvals: { pending: 2, waitingOver24Hours: 1 },
  operations: { pendingApproval: 2, oldestPendingAgeSeconds: 90000, approvedLast24Hours: 3, rejectedLast24Hours: 1, generating: 1, ready: 1, failed: 0, expired: 0 },
  generatedAt: '2026-09-12T00:00:00Z',
};

export const auditExportHandlers = [
  http.get('/api/v1/audit-exports/work-summary', () => HttpResponse.json(summary)),
  http.get('/api/v1/audit-exports', () => HttpResponse.json({ items: [], page: 0, size: 10, totalElements: 0 })),
];
