import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { server } from '../../../app/mocks/server';
import { AuditExportWorkPanel } from './AuditExportWorkPanel';

const pending = {
  exportId: 'exp-pending', institutionId: 'institution_local', workloadId: 'customer_summary',
  executionPack: 'AI', executionId: 'exec-pending', reportType: 'EXECUTION_EVIDENCE', format: 'CSV',
  status: 'REQUESTED', scopeDigest: 'scope-digest', requesterId: 'auditor-local', approverId: null,
  requestReason: '금융 감사 제출', approvalReason: null, createdAt: '2026-09-11T00:00:00Z',
  approvedAt: null, generatedAt: null, expiresAt: null, downloadedAt: null,
  updatedAt: '2026-09-11T00:00:00Z',
};
const workSummary = {
  principalId: 'privileged-operator-local', approvalAvailable: true,
  personal: { pendingApproval: 0, approvedOrGenerating: 0, readyToDownload: 0, downloaded: 0, rejected: 0, failedOrExpired: 0 },
  approvals: { pending: 1, waitingOver24Hours: 1 },
  operations: { pendingApproval: 1, oldestPendingAgeSeconds: 90000, approvedLast24Hours: 0, rejectedLast24Hours: 0, generating: 0, ready: 0, failed: 0, expired: 0 },
  generatedAt: '2026-09-12T00:00:00Z',
};

describe('AuditExportWorkPanel', () => {
  it('reviews a server-scoped approval task through the existing maker-checker command', async () => {
    let decision: Record<string, unknown> = {};
    server.use(
      http.get('/api/v1/audit-exports/work-summary', () => HttpResponse.json(workSummary)),
      http.get('/api/v1/audit-exports', ({ request }) => {
        const view = new URL(request.url).searchParams.get('view');
        return HttpResponse.json({ items: view === 'APPROVAL_QUEUE' ? [pending] : [], page: 0, size: 10, totalElements: view === 'APPROVAL_QUEUE' ? 1 : 0 });
      }),
      http.get('/api/v1/audit-exports/:exportId', () => HttpResponse.json({
        job: pending,
        events: [{ eventId: 'event-1', actorId: 'auditor-local', action: 'REQUESTED', fromStatus: null, toStatus: 'REQUESTED', reasonCode: 'AUDIT_EXPORT_REQUESTED', occurredAt: pending.createdAt }],
      })),
      http.post('/api/v1/audit-exports/:exportId/approval', async ({ request }) => {
        decision = await request.json() as Record<string, unknown>;
        return HttpResponse.json({ ...pending, status: 'APPROVED', approverId: 'operator-local' });
      }),
    );
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
    const user = userEvent.setup();
    render(<MemoryRouter><QueryClientProvider client={queryClient}><AuditExportWorkPanel /></QueryClientProvider></MemoryRouter>);

    await user.click(await screen.findByRole('tab', { name: '승인할 요청' }));
    await user.click(await screen.findByRole('button', { name: 'CSV 감사 증적 검토' }));
    expect(screen.getByText('금융 감사 제출')).toBeInTheDocument();
    expect(screen.getByText(/정책 판단, 변환, 외부 전송, 복구 메타데이터/)).toBeInTheDocument();
    expect(screen.queryByRole('textbox', { name: '처리 사유' })).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: '승인' }));

    expect(decision).toMatchObject({ action: 'APPROVE', reason: '요청 범위 및 반출 목적 확인' });
  });

  it('opens history details inline and limits navigation to ten jobs per page', async () => {
    const jobs = Array.from({ length: 10 }, (_, index) => ({
      ...pending,
      exportId: `exp-history-${index}`,
      status: 'REJECTED',
      approvalReason: '업무 범위 불일치',
      approverId: 'privileged-operator-local',
    }));
    server.use(
      http.get('/api/v1/audit-exports/work-summary', () => HttpResponse.json(workSummary)),
      http.get('/api/v1/audit-exports', ({ request }) => {
        const url = new URL(request.url);
        const page = Number(url.searchParams.get('page'));
        return HttpResponse.json({ items: page === 0 ? jobs : [{ ...pending, exportId: 'exp-history-10' }], page, size: 10, totalElements: 11 });
      }),
      http.get('/api/v1/audit-exports/:exportId', ({ params }) => HttpResponse.json({
        job: { ...jobs[0], exportId: params.exportId },
        events: [{ eventId: 'event-history', actorId: 'privileged-operator-local', action: 'REJECTED', fromStatus: 'REQUESTED', toStatus: 'REJECTED', reasonCode: 'AUDIT_EXPORT_REJECTED', occurredAt: pending.createdAt }],
      })),
    );
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
    const user = userEvent.setup();
    render(<MemoryRouter><QueryClientProvider client={queryClient}><AuditExportWorkPanel /></QueryClientProvider></MemoryRouter>);

    await user.click(await screen.findByRole('tab', { name: '전체 이력' }));
    const detailRows = await screen.findAllByRole('button', { name: 'CSV 감사 증적 상세' });
    expect(detailRows).toHaveLength(10);
    await user.click(detailRows[0]);
    await user.click(detailRows[1]);
    expect(detailRows[0]).toHaveAttribute('aria-expanded', 'true');
    expect(detailRows[1]).toHaveAttribute('aria-expanded', 'true');
    expect(await screen.findAllByText('요청 목적')).toHaveLength(2);
    expect(await screen.findAllByText('업무 범위 불일치')).toHaveLength(2);
    expect(screen.getAllByText('REQUESTED → REJECTED')).toHaveLength(2);
    expect(screen.getByText('11건 · 페이지당 10건')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: '2페이지' }));
    expect(await screen.findByText('exp-history-10')).toBeInTheDocument();
  });
});
