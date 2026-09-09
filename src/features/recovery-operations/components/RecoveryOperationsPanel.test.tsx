import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import { server } from '../../../app/mocks/server';
import { RecoveryOperationsPanel } from './RecoveryOperationsPanel';

function renderPanel() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <RecoveryOperationsPanel />
    </QueryClientProvider>,
  );
}

describe('RecoveryOperationsPanel', () => {
  it('reuses the logical operation ID when a command is retried', async () => {
    const user = userEvent.setup();
    const operationIds: string[] = [];
    server.use(
      http.post('/api/admin/recovery/incidents/:recoveryId/retry', async ({ params, request }) => {
        const body = await request.json() as { operationId: string };
        operationIds.push(body.operationId);
        if (operationIds.length === 1) {
          return HttpResponse.json({
            reasonCode: 'RECOVERY_COMMAND_IN_PROGRESS',
            message: 'Recovery operation rejected',
          }, { status: 409 });
        }
        return HttpResponse.json({
          recoveryId: params.recoveryId,
          operationId: body.operationId,
          operationType: 'RETRY',
          outcome: 'SUCCEEDED',
          recoveryStatus: 'RETRY_SCHEDULED',
          reasonCode: 'STATUS_NOT_SENT_RETRY_ALLOWED',
          replayed: true,
        });
      }),
    );
    renderPanel();

    await user.click(await screen.findByRole('button', { name: /recovery-contract/ }));
    await screen.findByRole('checkbox', { name: /RECONCILE 명령/ });
    await user.click(screen.getByRole('tab', { name: /안전 재시도/ }));
    await user.click(screen.getByRole('checkbox', { name: /RETRY 명령/ }));
    await user.click(screen.getByRole('button', { name: '안전 재시도' }));

    expect(await screen.findByText('Recovery 명령이 거부됐습니다')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: '같은 Operation ID로 재시도' }));

    expect(await screen.findByText('RETRY · SUCCEEDED')).toBeInTheDocument();
    expect(operationIds).toHaveLength(2);
    expect(operationIds[0]).toBe(operationIds[1]);
  });
});
