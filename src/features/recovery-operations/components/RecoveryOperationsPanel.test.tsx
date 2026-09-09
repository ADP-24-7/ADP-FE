import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import { server } from '../../../app/mocks/server';
import { operationsMonitoringKeys } from '../../operations-monitoring';
import { RecoveryOperationsPanel } from './RecoveryOperationsPanel';

function detailResponse(recoveryStatus = 'PENDING', retryDisposition = 'RECONCILE_FIRST') {
  return {
    recoveryId: 'recovery-contract',
    executionId: 'execution-contract',
    institutionId: 'institution_local',
    workloadId: 'customer_summary',
    purposeCode: 'CUSTOMER_SUPPORT',
    connectorId: 'connector-local',
    connectorExecutionId: 'connector-execution-contract',
    observedStatus: 'SENT_UNKNOWN',
    lastObservedExternalStatus: null,
    recoveryStatus,
    retryDisposition,
    attemptCount: 1,
    maxAttempts: 5,
    nextAttemptAt: null,
    lastErrorCode: null,
    leaseUntil: null,
    lastStatusQueriedAt: null,
    statusQueryEvidenceDigest: null,
    operations: [],
    createdAt: '2026-09-09T00:00:00Z',
    updatedAt: '2026-09-09T00:01:00Z',
  };
}

function renderPanel() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const view = render(
    <QueryClientProvider client={queryClient}>
      <RecoveryOperationsPanel />
    </QueryClientProvider>,
  );
  return { ...view, queryClient };
}

describe('RecoveryOperationsPanel', () => {
  it('reuses the logical operation ID when a command is retried', async () => {
    const user = userEvent.setup();
    const operationIds: string[] = [];
    server.use(
      http.get('/api/admin/recovery/incidents/:recoveryId', () => HttpResponse.json(detailResponse('PENDING', 'RETRY_ALLOWED'))),
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
    const { queryClient } = renderPanel();
    queryClient.setQueryData(operationsMonitoringKeys.summary(60), { recovery: { backlog: 1 } });

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
    expect(queryClient.getQueryState(operationsMonitoringKeys.summary(60))?.isInvalidated).toBe(true);
  });

  it('disables commands that are not valid for the current incident state', async () => {
    const user = userEvent.setup();
    server.use(
      http.get('/api/admin/recovery/incidents/:recoveryId', () => HttpResponse.json(detailResponse('RECONCILED', 'NO_RETRY'))),
    );
    renderPanel();

    await user.click(await screen.findByRole('button', { name: /recovery-contract/ }));

    expect(await screen.findByText('실행 가능한 Recovery 명령이 없습니다')).toBeInTheDocument();
    expect(screen.getByText('이미 외부 상태가 확정되어 추가 Recovery 명령이 필요하지 않습니다.')).toBeInTheDocument();
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
  });
});
