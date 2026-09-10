import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import { server } from '../../../app/mocks/server';
import { AiEvaluationPanel } from './AiEvaluationPanel';

function renderPanel() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(
    <QueryClientProvider client={queryClient}>
      <AiEvaluationPanel />
    </QueryClientProvider>,
  );
}

describe('AiEvaluationPanel', () => {
  it('combines readiness and bundle failures into one user-facing status', async () => {
    server.use(http.get('/api/admin/ai/evaluation-runs/:evaluationRunId/bundle', () => HttpResponse.json({
      errorCode: 'EXECUTION_PACK_INPUT_REJECTED',
      message: 'Execution pack input rejected',
    }, { status: 422 })));
    const user = userEvent.setup();
    renderPanel();

    await user.type(screen.getByRole('combobox', { name: 'Evaluation Run ID' }), 'ai-eval-baseline-2026-09-07');
    await user.click(screen.getByRole('button', { name: '조회' }));

    expect(await screen.findByText('평가 번들을 불러올 수 없습니다')).toBeInTheDocument();
    expect(screen.getByText('조회 실패')).toBeInTheDocument();
    expect(screen.queryByText('Execution pack input rejected')).not.toBeInTheDocument();
  });
});
