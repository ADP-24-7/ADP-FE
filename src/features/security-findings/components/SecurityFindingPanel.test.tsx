import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { SecurityFindingPanel } from './SecurityFindingPanel';

function renderPanel(onOpenTrace = vi.fn()) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const view = (executionPack: 'AI' | 'DIGITAL_ASSET') => (
    <QueryClientProvider client={queryClient}>
      <SecurityFindingPanel key={executionPack} executionPack={executionPack} onOpenTrace={onOpenTrace} />
    </QueryClientProvider>
  );
  const rendered = render(view('AI'));
  return {
    onOpenTrace,
    rerenderPack: (executionPack: 'AI' | 'DIGITAL_ASSET') => rendered.rerender(view(executionPack)),
  };
}

describe('SecurityFindingPanel', () => {
  it('opens privacy-safe detail and routes to Decision Trace', async () => {
    const user = userEvent.setup();
    const { onOpenTrace } = renderPanel();

    await user.click(await screen.findByRole('button', { name: /exec-security-finding-contract/ }));
    expect(await screen.findByText('Evidence Digest')).toBeInTheDocument();
    expect(screen.queryByText('010-1234-5678')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Decision Trace' }));
    expect(onOpenTrace).toHaveBeenCalledWith('exec-security-finding-contract');
  });

  it('removes previous pack findings immediately when the scope changes', async () => {
    const { rerenderPack } = renderPanel();

    expect(await screen.findByRole('button', { name: /exec-security-finding-contract/ })).toBeInTheDocument();
    rerenderPack('DIGITAL_ASSET');

    expect(screen.queryByRole('button', { name: /exec-security-finding-contract/ })).not.toBeInTheDocument();
    expect(await screen.findByText('탐지된 민감정보가 없습니다')).toBeInTheDocument();
  });
});
