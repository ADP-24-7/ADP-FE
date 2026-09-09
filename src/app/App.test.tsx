import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { OverviewPage } from '../pages/overview/OverviewPage';
import { ExecutionPackProvider } from '../shared/prototype';
import { server } from './mocks/server';
import { App } from './App';

describe('App', () => {
  it('renders the real API console without mock environment labels', async () => {
    render(<App />);

    expect(await screen.findByRole('heading', { name: 'Security Overview' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /정책 · 승인/ })).toHaveAttribute('href', '/policies');
    expect(screen.getByRole('link', { name: /Runtime · Recovery/ })).toHaveAttribute('href', '/analysis');
    expect(screen.queryByText('MOCK DATA')).not.toBeInTheDocument();
    expect(screen.queryByText('PROJECT_PROVISIONAL')).not.toBeInTheDocument();
    expect(screen.getAllByText('NO MOCK DATA').length).toBeGreaterThan(0);
  });

  it('updates runtime domain from the global selector without page reload', async () => {
    const user = userEvent.setup();
    render(<App />);

    await screen.findByRole('heading', { name: 'Security Overview' });
    await user.click(screen.getByRole('tab', { name: /Digital Asset/ }));

    expect(window.location.pathname).toBe('/overview');
    expect(screen.getByRole('tab', { name: /Digital Asset/ })).toHaveClass('active');
    expect(screen.getByText('Value-use · Transaction · Settlement · Reconciliation')).toBeInTheDocument();

    await user.click(screen.getByRole('link', { name: /정책 · 승인/ }));

    expect(await screen.findByRole('heading', { name: '정책 · 승인' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /정책 · 승인/ })).toHaveClass('active');
    expect(screen.getByLabelText('선택된 Execution Pack')).toHaveTextContent('Digital Asset');
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
    expect(screen.getByLabelText('선택된 Execution Pack')).toHaveTextContent('Digital Asset');
    expect(screen.getByLabelText('선택된 Execution Pack')).toHaveTextContent('Digital Asset');
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
    expect(screen.getByLabelText('선택된 Viewing Context')).toHaveTextContent('Digital Asset');
    expect(screen.getByLabelText('선택된 Viewing Context')).toHaveTextContent('전체 권한 허용 Workload · Pack 필터 미지원');
  });

  it('shows a clear state when there are no attention items', async () => {
    server.use(
      http.get('/api/admin/operations/summary', () => HttpResponse.json({
        schemaVersion: 'adp-operations-summary/v1',
        windowMinutes: 60,
        generatedAt: '2026-09-09T00:00:00Z',
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

    expect(await screen.findByText('현재 확인이 필요한 운영 이슈가 없습니다')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Recovery backlog/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Security denied attempts/ })).not.toBeInTheDocument();
  });
});
