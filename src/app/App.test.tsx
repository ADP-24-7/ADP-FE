import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { delay, http, HttpResponse } from 'msw';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it } from 'vitest';
import { OverviewPage } from '../pages/overview/OverviewPage';
import { AuditPage } from '../pages/audit/AuditPage';
import { ExecutionPackProvider } from '../shared/prototype';
import { server } from './mocks/server';
import { App } from './App';

describe('App', () => {
  beforeEach(() => {
    window.history.replaceState({}, '', '/overview');
  });

  it('renders the real API console without mock environment labels', async () => {
    render(<App />);

    expect(await screen.findByRole('heading', { name: 'Security Overview' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /정책 · 승인/ })).toHaveAttribute('href', '/policies');
    expect(screen.getByRole('link', { name: /Runtime · Recovery/ })).toHaveAttribute('href', '/analysis');
    expect(screen.queryByText('MOCK DATA')).not.toBeInTheDocument();
    expect(screen.queryByText('PROJECT_PROVISIONAL')).not.toBeInTheDocument();
    expect(screen.queryByText('NO MOCK DATA')).not.toBeInTheDocument();
    expect(screen.queryByText('PoC Workspace · v3.2')).not.toBeInTheDocument();
    expect(screen.queryByText('DATA SOURCE')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Policy.*No Data/i })).not.toBeInTheDocument();
    expect(screen.queryByText('Policy 없음')).not.toBeInTheDocument();
  });

  it('does not restore a persisted pack that the runtime selector does not support', async () => {
    window.localStorage.setItem('adp.selectedExecutionPack', 'saas');

    render(<App />);

    expect(await screen.findByRole('heading', { name: 'Security Overview' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /AI · Agent/ })).toHaveClass('active');
  });

  it('shows product role labels and opens identity details from the operator menu', async () => {
    const user = userEvent.setup();
    render(<App />);

    const operator = await screen.findByRole('button', { name: '현재 운영자 권한' });
    expect(operator).toHaveTextContent('운영자 · 승인 권한');
    expect(operator).not.toHaveTextContent('PRIVILEGED_OPERATOR');
    await user.click(operator);

    expect(screen.getByText(/계정 ID/)).toHaveTextContent('operator-local');
    expect(screen.getByText(/기관/)).toHaveTextContent('institution_local');
    expect(screen.getByText(/기술 Role/)).toHaveTextContent('OPERATOR · PRIVILEGED_OPERATOR');
    await user.click(screen.getByRole('menuitem', { name: /권한 상세 보기/ }));

    expect(await screen.findByRole('heading', { name: 'Identity · 권한' })).toBeInTheDocument();
  });

  it('updates runtime domain from the global selector without page reload', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('link', { name: '통합 관제' }));
    await screen.findByRole('heading', { name: 'Security Overview' });
    await user.click(screen.getByRole('tab', { name: /Digital Asset/ }));

    expect(window.location.pathname).toBe('/overview');
    expect(screen.getByRole('tab', { name: /Digital Asset/ })).toHaveClass('active');
    expect(screen.getByText('Value-use · Transaction · Settlement · Reconciliation')).toBeInTheDocument();

    await user.click(screen.getByRole('link', { name: /정책 · 승인/ }));

    expect(await screen.findByRole('heading', { name: '정책 · 승인' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /정책 · 승인/ })).toHaveClass('active');
    expect(screen.getByLabelText('선택된 운영 영역')).toHaveTextContent('Digital Asset');
    expect(screen.getByRole('heading', { name: 'Policy Operations' })).toBeInTheDocument();
    expect(screen.getByText(/권한 범위의 Artifact를 검색/)).toBeInTheDocument();
  });

  it('uses the global pack selector for Gateway Lab without a duplicate axis picker', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(await screen.findByRole('link', { name: '통합 관제' }));
    await screen.findByRole('heading', { name: 'Security Overview' });
    await user.click(screen.getByRole('tab', { name: /Digital Asset/ }));
    await user.click(screen.getByRole('link', { name: 'Gateway Lab' }));

    expect(await screen.findByRole('heading', { name: 'Gateway Lab' })).toBeInTheDocument();
    expect(window.location.pathname).toBe('/gateway-lab');
    expect(screen.queryByRole('tablist', { name: 'Gateway 실행 축 선택' })).not.toBeInTheDocument();
    expect(screen.queryByText('Gateway 실행 축')).not.toBeInTheDocument();
    expect(screen.getByLabelText('선택된 운영 영역')).toHaveTextContent('Digital Asset');
    expect(screen.getByRole('textbox', { name: 'Customer ID' })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Approved Transaction Reference' })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Requested Amount (Atomic Units)' })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'Asset Kind' })).toHaveValue('FUNGIBLE_TOKEN');
  });

  it('separates viewing context from operations data scope', async () => {
    const user = userEvent.setup();
    window.history.pushState({}, '', '/overview');
    render(<App />);

    await user.click(await screen.findByRole('link', { name: 'Security Monitoring' }));
    await user.click(screen.getByRole('tab', { name: /Digital Asset/ }));

    expect(window.location.pathname).toBe('/monitoring');
    expect(screen.getByLabelText('선택된 운영 영역')).toHaveTextContent('Digital Asset');
    expect(screen.getByLabelText('선택된 운영 영역')).toHaveTextContent('조회 범위보안 탐지 · 정책 이력');
  });

  it('opens the exact recovery incident selected from the review queue', async () => {
    const user = userEvent.setup();
    window.localStorage.setItem('adp.selectedExecutionPack', 'ai');
    render(<App />);

    await user.click(screen.getByRole('link', { name: /Runtime · Recovery/ }));
    expect(await screen.findByRole('heading', { name: 'Runtime · Recovery' })).toBeInTheDocument();
    expect(await screen.findByRole('heading', { name: 'Review Queue' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Recovery Incident' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /exec-review-contract/ }));
    await user.click(await screen.findByRole('button', { name: 'Recovery Incident' }));

    expect(window.location.search).toBe('?recoveryId=recovery-contract');
    expect(await screen.findByText('Recovery ID')).toBeInTheDocument();
    expect(screen.getAllByText('recovery-contract').length).toBeGreaterThan(0);
  });

  it('shows zero operational signals without inferring attention', async () => {
    server.use(
      http.get('/api/admin/operations/summary', () => HttpResponse.json({
        schemaVersion: 'adp-operations-summary/v2',
        windowMinutes: 60,
        generatedAt: '2026-09-09T00:00:00Z',
        scope: {
          requestedExecutionPack: 'AI',
          defaultSemantics: 'REQUESTED_EXECUTION_PACK',
          packScopedSections: ['RUNTIME', 'RECOVERY', 'POLICY'],
          allAuthorizedWorkloadSections: ['SECURITY'],
        },
        runtime: { total: 0, completed: 0, failed: 0, blocked: 0, reviewRequired: 0 },
        recovery: {
          backlog: 0,
          oldestBacklogAgeSeconds: null,
          manualReview: 0,
          exhausted: 0,
          completedOperations: 0,
          averageOperationLatencyMillis: null,
          staleOperations: 0,
          oldestStaleOperationAgeSeconds: null,
        },
        policy: { currentSelections: 0, driftedSelections: 0, activations: 0, rollbacks: 0 },
        security: { deniedAttempts: 0, institutionScopeMismatch: 0, authorizationPolicyDenied: 0 },
      })),
    );
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    render(
      <ExecutionPackProvider>
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <OverviewPage />
          </MemoryRouter>
        </QueryClientProvider>
      </ExecutionPackProvider>,
    );

    expect(await screen.findByText('현재 0이 아닌 운영 신호가 없습니다')).toBeInTheDocument();
    expect(screen.queryByText('Attention Required')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Recovery backlog/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Security denied attempts/ })).not.toBeInTheDocument();
  });

  it('does not expose disconnected policy controls as product actions', async () => {
    const user = userEvent.setup();
    window.localStorage.setItem('adp.selectedExecutionPack', 'ai');
    window.history.replaceState({}, '', '/overview');

    render(<App />);

    await user.click(await screen.findByRole('link', { name: /정책 · 승인/ }));
    expect(await screen.findByRole('heading', { name: '정책 · 승인' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Artifact 동기화/ })).not.toBeInTheDocument();
    expect(screen.queryByText('REUSE_ALLOWED')).not.toBeInTheDocument();
    expect(screen.queryByText('TRANSFORM_REQUIRED')).not.toBeInTheDocument();
  });

  it('does not expose disconnected workload or per-field retrieval controls', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('link', { name: /Workload · Data/ }));
    expect(await screen.findByRole('heading', { name: 'Workload · Data Access' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Workload Registry' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Workload 등록/ })).not.toBeInTheDocument();

    await user.click(screen.getByRole('link', { name: 'Gateway Lab' }));
    expect(await screen.findByRole('heading', { name: 'Gateway Lab' })).toBeInTheDocument();
    expect(screen.queryByText('조회 결과')).not.toBeInTheDocument();
    expect(screen.queryByText('Valid Until')).not.toBeInTheDocument();
    expect(screen.queryByText('API 연결 대기')).not.toBeInTheDocument();
  });

  it('focuses the post-execution evidence section from a review deep link', async () => {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    render(
      <ExecutionPackProvider>
        <QueryClientProvider client={queryClient}>
          <MemoryRouter initialEntries={['/audit?executionId=execution-contract&section=post-execution']}>
            <AuditPage />
          </MemoryRouter>
        </QueryClientProvider>
      </ExecutionPackProvider>,
    );

    expect(await screen.findByRole('heading', { name: 'External Execution & Response Evidence' })).toBeInTheDocument();
    const focusedSection = screen.getByLabelText('우선 확인 Evidence');
    expect(focusedSection).toHaveClass('evidence-focus-section-active');
    expect(screen.getByText('provider-response-digest')).toBeInTheDocument();
    await waitFor(() => expect(document.activeElement).toBe(focusedSection));
  });

  it('focuses the policy decision section from a decision deep link', async () => {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    render(
      <ExecutionPackProvider>
        <QueryClientProvider client={queryClient}>
          <MemoryRouter initialEntries={['/audit?executionId=execution-contract&section=decision']}>
            <AuditPage />
          </MemoryRouter>
        </QueryClientProvider>
      </ExecutionPackProvider>,
    );

    const focusedSection = await screen.findByLabelText('Policy Decision Evidence');
    expect(focusedSection).toHaveClass('evidence-focus-section-active');
    await waitFor(() => expect(document.activeElement).toBe(focusedSection));
  });

  it('clears the selected audit detail when search conditions change', async () => {
    const user = userEvent.setup();
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    render(
      <ExecutionPackProvider>
        <QueryClientProvider client={queryClient}>
          <MemoryRouter initialEntries={['/audit']}>
            <AuditPage />
          </MemoryRouter>
        </QueryClientProvider>
      </ExecutionPackProvider>,
    );

    await user.type(screen.getByLabelText('감사 Workload 검색'), 'customer_summary');
    await user.click(screen.getByRole('button', { name: '검색' }));
    await user.click(await screen.findByRole('button', { name: /exec-search-contract/ }));
    expect(await screen.findByText('provider-response-digest')).toBeInTheDocument();

    await user.clear(screen.getByLabelText('감사 Workload 검색'));
    await user.type(screen.getByLabelText('감사 Workload 검색'), 'tokenized_asset_purchase');
    await user.click(screen.getByRole('button', { name: '검색' }));
    expect(await screen.findByText('실행 선택 대기')).toBeInTheDocument();
    expect(screen.queryByText('provider-response-digest')).not.toBeInTheDocument();
  });

  it('opens the second audit page without collapsing the current result table', async () => {
    server.use(http.get('/api/admin/audit/executions', async ({ request }) => {
      const params = new URL(request.url).searchParams;
      expect(params.get('executionPack')).toBe('AI');
      const page = Number(params.get('page') ?? 0);
      if (page === 1) await delay(80);
      const count = page === 0 ? 10 : 2;
      return HttpResponse.json({
        items: Array.from({ length: count }, (_, index) => ({
          executionId: `exec-page-${page}-${index}`,
          requestId: `req-page-${page}-${index}`,
          traceId: `trace-page-${page}-${index}`,
          institutionId: 'institution_local',
          executionPack: 'AI',
          workloadId: 'customer_summary',
          purposeCode: 'CUSTOMER_SUPPORT',
          status: 'COMPLETED',
          finalAction: 'ALLOW',
          createdAt: '2026-09-09T00:00:00Z',
          updatedAt: '2026-09-09T00:00:01Z',
        })),
        page,
        size: 10,
        totalElements: 12,
      });
    }));
    const user = userEvent.setup();
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    render(
      <ExecutionPackProvider>
        <QueryClientProvider client={queryClient}>
          <MemoryRouter initialEntries={['/audit']}>
            <AuditPage />
          </MemoryRouter>
        </QueryClientProvider>
      </ExecutionPackProvider>,
    );

    expect(await screen.findByRole('button', { name: /exec-page-0-0/ })).toBeInTheDocument();
    expect(screen.getByText('총 12건 · 1/2 페이지')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: '다음' }));

    expect(screen.getByRole('button', { name: /exec-page-0-0/ })).toBeDisabled();
    expect(await screen.findByRole('button', { name: /exec-page-1-0/ })).toBeInTheDocument();
    expect(screen.getByText('총 12건 · 2/2 페이지')).toBeInTheDocument();
  });

  it('scrolls and focuses the operations section selected from overview', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('link', { name: '통합 관제' }));
    await screen.findByRole('heading', { name: 'Security Overview' });
    await user.click(await screen.findByRole('button', { name: /Recovery backlog/ }));

    expect(window.location.pathname).toBe('/analysis');
    expect(window.location.hash).toBe('#recovery-incidents');
    const target = document.getElementById('recovery-incidents');
    expect(target).not.toBeNull();
    await waitFor(() => expect(document.activeElement).toBe(target));
  });
});
