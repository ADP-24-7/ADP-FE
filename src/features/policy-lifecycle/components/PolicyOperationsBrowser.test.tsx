import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { PolicyOperationsBrowser } from './PolicyOperationsBrowser';

function renderBrowser(onSelect = vi.fn()) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(
    <QueryClientProvider client={queryClient}>
      <PolicyOperationsBrowser
        executionPack="AI"
        selectedArtifactId=""
        selectedArtifactVersion=""
        onSelect={onSelect}
      />
    </QueryClientProvider>,
  );
  return onSelect;
}

describe('PolicyOperationsBrowser', () => {
  it('selects an artifact from the server-owned operations list', async () => {
    const user = userEvent.setup();
    const onSelect = renderBrowser();

    await user.click(await screen.findByRole('button', { name: /active-policy-contract/ }));

    expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({
      artifactId: 'active-policy-contract',
      artifactVersion: '1.0.0',
      currentSelection: true,
    }));
  });
});
