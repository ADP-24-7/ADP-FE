import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import { server } from '../../../app/mocks/server';
import { usePolicyLifecycle } from '../hooks/usePolicyLifecycle';
import type { PolicyLifecycleRecord, PolicyLifecycleStage } from '../model/types';
import { PolicyGovernancePanel } from './PolicyGovernancePanel';

function policyRecord(lifecycleStage: PolicyLifecycleStage, revision: number): PolicyLifecycleRecord {
  return {
    artifactId: 'candidate-policy-contract',
    artifactVersion: '2.0.0',
    artifactDigest: 'f'.repeat(64),
    institutionId: 'institution_local',
    policyLayer: 'WORKLOAD',
    executionPack: 'AI',
    workloadId: 'customer_summary',
    purposeCode: 'CUSTOMER_SUPPORT',
    lifecycleStage,
    createdBy: 'maker-local',
    revision,
    createdAt: '2026-09-09T00:00:00Z',
    updatedAt: '2026-09-09T00:00:01Z',
  };
}

function QueryBackedPanel() {
  const policy = usePolicyLifecycle('candidate-policy-contract', '2.0.0');
  return policy.data ? <PolicyGovernancePanel policy={policy.data} /> : null;
}

function renderPanel() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <QueryBackedPanel />
    </QueryClientProvider>,
  );
}

describe('PolicyGovernancePanel', () => {
  it('blocks approval when the current session evidence is DIFF', async () => {
    const user = userEvent.setup();
    server.use(
      http.get('/api/admin/policy-lifecycle/:artifactId/versions/:artifactVersion', () => (
        HttpResponse.json(policyRecord('REPLAY', 4))
      )),
    );
    renderPanel();

    const caseInput = await screen.findByRole('combobox', { name: 'Policy Shadow Evaluation Case ID' });
    await user.type(caseInput, 'FAILURE_BLOCK');
    await user.click(screen.getByRole('button', { name: 'Shadow 비교 실행' }));
    expect(await screen.findByText('DIFF / FINAL_ACTION')).toBeInTheDocument();

    await user.click(screen.getByRole('checkbox', { name: /Shadow 진입 명령/ }));
    await user.click(screen.getByRole('button', { name: 'Shadow 진입' }));

    expect(await screen.findByText('이 Evidence는 승인할 수 없습니다')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Evidence 기반 승인' })).toBeDisabled();
    expect(screen.getByRole('checkbox', { name: /BE가 MATCH Evidence/ })).toBeDisabled();
  });

  it('refetches current selection after an activation conflict', async () => {
    const user = userEvent.setup();
    let selectionRequestCount = 0;
    server.use(
      http.get('/api/admin/policy-lifecycle/:artifactId/versions/:artifactVersion', () => (
        HttpResponse.json(policyRecord('APPROVED', 6))
      )),
      http.get('/api/admin/policy-lifecycle/current-selection', () => {
        selectionRequestCount += 1;
        return HttpResponse.json({
          institutionId: 'institution_local',
          policyLayer: 'WORKLOAD',
          executionPack: 'AI',
          workloadId: 'customer_summary',
          purposeCode: 'CUSTOMER_SUPPORT',
          artifactId: 'active-policy-contract',
          artifactVersion: '1.0.0',
          artifactDigest: '1'.repeat(64),
          artifactRevision: 7,
          selectionRevision: selectionRequestCount === 1 ? 3 : 4,
          selectedBy: 'checker-local',
          selectedAt: '2026-09-09T00:00:00Z',
        });
      }),
      http.post('/api/admin/policy-lifecycle/:artifactId/versions/:artifactVersion/activations', () => (
        HttpResponse.json({
          reasonCode: 'POLICY_CURRENT_SELECTION_STALE',
          message: 'Current selection revision is stale',
        }, { status: 409 })
      )),
    );
    renderPanel();

    await user.click(await screen.findByRole('checkbox', { name: /Artifact rev 6 \/ Selection rev 3/ }));
    await user.click(screen.getByRole('button', { name: 'Current Selection 활성화' }));

    expect(await screen.findByText('Current Selection이 변경됐습니다')).toBeInTheDocument();
    await waitFor(() => expect(selectionRequestCount).toBeGreaterThanOrEqual(2));
    expect(await screen.findByText(/Artifact rev 6 \/ Selection rev 4/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '최신 상태 다시 조회' })).toBeInTheDocument();
  });
});
