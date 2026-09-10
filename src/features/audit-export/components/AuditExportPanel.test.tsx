import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { beforeEach, describe, expect, it } from 'vitest';
import { server } from '../../../app/mocks/server';
import { AuditExportPanel } from './AuditExportPanel';

function job(status = 'REQUESTED') {
  return {
    exportId: 'exp-contract', institutionId: 'institution_local', workloadId: 'customer_summary',
    executionPack: 'AI', executionId: 'exec-contract', reportType: 'EXECUTION_EVIDENCE',
    format: 'CSV', status, scopeDigest: 'scope-digest', requesterId: 'operator-local',
    requestReason: '내부 감사 증적 제출', idempotencyKey: 'exp-key', scopeJson: '{}',
    rowCount: status === 'READY' ? 1 : null, contentDigest: status === 'READY' ? 'content-digest' : null,
    contentSize: status === 'READY' ? 128 : null, contentType: status === 'READY' ? 'text/csv' : null,
    fileName: status === 'READY' ? 'adp-evidence.csv' : null, createdAt: '2026-09-10T00:00:00Z',
    updatedAt: '2026-09-10T00:00:00Z', version: 0,
  };
}

function renderPanel() {
  server.use(http.get('/api/admin/auth/context', () => HttpResponse.json({
    principalId: 'operator-local', principalType: 'USER', displayName: 'Local Operator',
    institutionId: 'institution_local', roles: ['OPERATOR', 'PRIVILEGED_OPERATOR'],
    workloadIds: ['*'], subjectAuthorizationRequired: false,
  })));
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  return render(<QueryClientProvider client={queryClient}><AuditExportPanel executionId="exec-contract" /></QueryClientProvider>);
}

describe('AuditExportPanel', () => {
  beforeEach(() => window.localStorage.clear());

  it('requests only the selected execution and server-owned export template', async () => {
    let submitted: Record<string, unknown> = {};
    server.use(
      http.post('/api/v1/audit-exports', async ({ request }) => {
        submitted = await request.json() as Record<string, unknown>;
        return HttpResponse.json(job());
      }),
      http.get('/api/v1/audit-exports/:exportId', () => HttpResponse.json({ job: job(), events: [] })),
    );
    const user = userEvent.setup();
    renderPanel();

    await user.click(await screen.findByRole('button', { name: 'PDF' }));
    await user.click(screen.getByRole('button', { name: '승인 요청' }));

    expect((await screen.findAllByText('승인 대기')).length).toBeGreaterThan(0);
    expect(screen.getByText('요청자와 다른 권한자의 승인이 필요합니다.')).toBeInTheDocument();
    expect(submitted).toMatchObject({
      executionId: 'exec-contract', reportType: 'EXECUTION_EVIDENCE', format: 'PDF',
    });
    expect(submitted).not.toHaveProperty('institutionId');
    expect(submitted).not.toHaveProperty('workloadId');
    expect(submitted).not.toHaveProperty('executionPack');
    expect(submitted).not.toHaveProperty('objectKey');
  });

  it('shows authenticated download only after the server reports READY', async () => {
    server.use(
      http.post('/api/v1/audit-exports', () => HttpResponse.json(job('READY'))),
      http.get('/api/v1/audit-exports/:exportId', () => HttpResponse.json({ job: job('READY'), events: [] })),
    );
    const user = userEvent.setup();
    renderPanel();

    expect(screen.queryByRole('button', { name: '다운로드' })).not.toBeInTheDocument();
    await user.click(await screen.findByRole('button', { name: '승인 요청' }));
    expect(await screen.findByRole('button', { name: '다운로드' })).toBeInTheDocument();
    expect(screen.queryByText(/Object/)).not.toBeInTheDocument();
  });
});
