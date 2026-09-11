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

describe('AuditExportWorkPanel', () => {
  it('reviews a server-scoped approval task through the existing maker-checker command', async () => {
    let decision: Record<string, unknown> = {};
    server.use(
      http.get('/api/v1/audit-exports', ({ request }) => {
        const view = new URL(request.url).searchParams.get('view');
        return HttpResponse.json({ items: view === 'APPROVAL_QUEUE' ? [pending] : [], page: 0, size: 10, totalElements: view === 'APPROVAL_QUEUE' ? 1 : 0 });
      }),
      http.post('/api/v1/audit-exports/:exportId/approval', async ({ request }) => {
        decision = await request.json() as Record<string, unknown>;
        return HttpResponse.json({ ...pending, status: 'APPROVED', approverId: 'operator-local' });
      }),
    );
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
    const user = userEvent.setup();
    render(<MemoryRouter><QueryClientProvider client={queryClient}><AuditExportWorkPanel /></QueryClientProvider></MemoryRouter>);

    await user.click(await screen.findByRole('tab', { name: '승인할 요청' }));
    await user.click(await screen.findByRole('button', { name: '검토' }));
    expect(screen.getByText('금융 감사 제출')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: '승인' }));

    expect(decision).toMatchObject({ action: 'APPROVE', reason: '업무 범위와 반출 목적 확인' });
  });
});
