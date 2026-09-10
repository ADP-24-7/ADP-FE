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
  const view = (executionPack: 'AI' | 'DIGITAL_ASSET') => (
    <QueryClientProvider client={queryClient}>
      <ReviewQueuePanel key={executionPack} executionPack={executionPack} onOpenTrace={onOpenTrace} onOpenRecovery={onOpenRecovery} />
    </QueryClientProvider>
  );
  const rendered = render(view('AI'));
  return {
    onOpenTrace,
    onOpenRecovery,
    rerenderPack: (executionPack: 'AI' | 'DIGITAL_ASSET') => rendered.rerender(view(executionPack)),
  };
}

describe('ReviewQueuePanel', () => {
  it('opens privacy-safe detail and routes the selected execution to Decision Trace', async () => {
    const user = userEvent.setup();
    const { onOpenTrace } = renderPanel();

    await user.click(await screen.findByRole('button', { name: /exec-review-contract/ }));
    expect(await screen.findByText('Reason Codes')).toBeInTheDocument();
    expect(screen.getAllByText('SENSITIVE_INPUT_REVIEW_REQUIRED')).toHaveLength(2);

    await user.click(screen.getByRole('button', { name: 'Decision Trace' }));
    expect(onOpenTrace).toHaveBeenCalledWith('exec-review-contract', 'decision');

    await user.click(screen.getByRole('button', { name: '실행 결과 증적' }));
    expect(onOpenTrace).toHaveBeenCalledWith('exec-review-contract', 'post-execution');
  });

  it('removes previous pack rows immediately when the operation scope changes', async () => {
    const { rerenderPack } = renderPanel();

    expect(await screen.findByRole('button', { name: /exec-review-contract/ })).toBeInTheDocument();
    rerenderPack('DIGITAL_ASSET');

    expect(screen.queryByRole('button', { name: /exec-review-contract/ })).not.toBeInTheDocument();
    expect(await screen.findByText('검토 대기 실행이 없습니다')).toBeInTheDocument();
  });
});
