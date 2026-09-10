import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { DigitalAssetArtifactPanel } from './DigitalAssetArtifactPanel';

function renderPanel(onOpenTrace = vi.fn()) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(
    <QueryClientProvider client={queryClient}>
      <DigitalAssetArtifactPanel onOpenTrace={onOpenTrace} />
    </QueryClientProvider>,
  );
  return onOpenTrace;
}

describe('DigitalAssetArtifactPanel', () => {
  it('discovers current state and opens pinned runtime evidence without manual identity input', async () => {
    const user = userEvent.setup();
    const onOpenTrace = renderPanel();

    expect(screen.queryByLabelText('Digital Asset Artifact ID')).not.toBeInTheDocument();
    await user.click(await screen.findByRole('button', {
      name: /DA-DIGITAL-ASSET-RUNTIME-LOCAL-ACTIVE-001/,
    }));

    expect(await screen.findByText('Current Selection')).toBeInTheDocument();
    expect(screen.getByText('policy-da-current:1.0.0 · policy/1.0.0')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Decision Trace' }));
    expect(onOpenTrace).toHaveBeenCalledWith('exec-da-current-001');
  });
});
