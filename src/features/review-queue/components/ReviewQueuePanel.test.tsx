import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ReviewQueuePanel } from './ReviewQueuePanel';

function renderPanel(
  onOpenTrace = vi.fn(),
  onOpenRecovery = vi.fn(),
) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(
    <QueryClientProvider client={queryClient}>
      <ReviewQueuePanel executionPack="AI" onOpenTrace={onOpenTrace} onOpenRecovery={onOpenRecovery} />
    </QueryClientProvider>,
  );
  return { onOpenTrace, onOpenRecovery };
}

describe('ReviewQueuePanel', () => {
  it('opens privacy-safe detail and routes the selected execution to Decision Trace', async () => {
    const user = userEvent.setup();
    const { onOpenTrace } = renderPanel();

    await user.click(await screen.findByRole('button', { name: /exec-review-contract/ }));
    expect(await screen.findByText('Reason Codes')).toBeInTheDocument();
    expect(screen.getAllByText('SENSITIVE_INPUT_REVIEW_REQUIRED')).toHaveLength(2);

    await user.click(screen.getByRole('button', { name: 'Decision Trace' }));
    expect(onOpenTrace).toHaveBeenCalledWith('exec-review-contract');
  });
});
