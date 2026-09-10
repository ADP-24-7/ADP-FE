import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { describe, expect, it, vi } from 'vitest';
import { server } from '../../../app/mocks/server';
import { PolicyOperationsBrowser } from './PolicyOperationsBrowser';

function renderBrowser(onSelect = vi.fn(), onClearSelection = vi.fn()) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(
    <QueryClientProvider client={queryClient}>
      <PolicyOperationsBrowser
        executionPack="AI"
        selectedArtifactId=""
        selectedArtifactVersion=""
        onSelect={onSelect}
        onClearSelection={onClearSelection}
      />
    </QueryClientProvider>,
  );
  return { onSelect, onClearSelection };
}

describe('PolicyOperationsBrowser', () => {
  it('selects an artifact from the server-owned operations list', async () => {
    const user = userEvent.setup();
    const { onSelect } = renderBrowser();

    await user.click(await screen.findByRole('button', { name: /active-policy-contract/ }));

    expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({
      artifactId: 'active-policy-contract',
      artifactVersion: '1.0.0',
      currentSelection: true,
    }));
  });

  it('clears the command target when stage, actionable filter, or applied query changes', async () => {
    const user = userEvent.setup();
    const { onClearSelection } = renderBrowser();
    await screen.findByRole('button', { name: /active-policy-contract/ });

    await user.selectOptions(screen.getByRole('combobox', { name: 'Lifecycle Stage' }), 'SUPERSEDED');
    await user.click(screen.getByRole('checkbox', { name: '조치 가능만' }));
    await user.type(screen.getByRole('textbox', { name: 'Artifact 검색' }), 'candidate');
    await user.click(screen.getByRole('button', { name: '검색' }));

    expect(onClearSelection).toHaveBeenCalledTimes(3);
  });

  it('clears the command target when moving to another result page', async () => {
    server.use(http.get('/api/admin/policy-lifecycle', ({ request }) => {
      const url = new URL(request.url);
      return HttpResponse.json({
        items: [{
          artifactId: 'active-policy-contract', artifactVersion: '1.0.0', artifactDigest: '1'.repeat(64),
          policyLayer: 'WORKLOAD', executionPack: 'AI', workloadId: 'customer_summary',
          purposeCode: 'CUSTOMER_SUPPORT', lifecycleStage: 'ACTIVE', createdBy: 'maker-local',
          revision: 7, createdAt: '2026-09-09T00:00:00Z', updatedAt: '2026-09-09T00:00:01Z',
          currentSelection: true, actionable: false, nextAction: null,
        }],
        total: 11,
        limit: Number(url.searchParams.get('limit') ?? 10),
        offset: Number(url.searchParams.get('offset') ?? 0),
      });
    }));
    const user = userEvent.setup();
    const { onClearSelection } = renderBrowser();

    await user.click(await screen.findByRole('button', { name: '다음 Policy Artifact' }));

    expect(onClearSelection).toHaveBeenCalledOnce();
  });
});
