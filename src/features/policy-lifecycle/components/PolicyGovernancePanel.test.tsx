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
  it('projects immutable regulatory evidence with the policy lifecycle state', async () => {
    renderPanel();

    expect(await screen.findByText('Regulatory Evidence Lineage')).toBeInTheDocument();
    expect(await screen.findByText('개인정보 보호법')).toBeInTheDocument();
    expect(screen.getByText('REF-REG-PIPA-2026-09-11')).toBeInTheDocument();
    expect(screen.getByText('제15조; 제16조; 제28조의8; 제29조')).toBeInTheDocument();
    expect(screen.getByText('2026-09-11')).toBeInTheDocument();
    expect(screen.getByText('candidate-policy-contract')).toBeInTheDocument();
  });

  it('preserves the Digital Asset evidence identity without merging admin domains', async () => {
    server.use(
      http.get('/api/admin/reference-evidence/policy-artifacts/:artifactId/versions/:artifactVersion', () => (
        HttpResponse.json([{
          regulatoryEvidenceId: 'REF-REG-VA-UPA-2024',
          sourceVersion: '20372-2024-07-19',
          sourceDigest: `sha256:${'c'.repeat(64)}`,
          lawName: '가상자산 이용자 보호 등에 관한 법률',
          authority: '금융위원회',
          officialSource: '국가법령정보센터',
          sourceUrl: 'https://www.law.go.kr/LSW/lsLinkCommonInfo.do?lsJoLnkSeq=1024562527',
          applicableArticles: '제2조; 제6조; 제7조; 제9조',
          effectiveDate: '2024-07-19',
          policyArtifactId: 'candidate-policy-contract',
          policyVersion: '2.0.0',
          lifecycleState: 'ACTIVE',
          executionPack: 'DIGITAL_ASSET',
          workloadId: 'tokenized_asset_purchase',
          purposeCode: 'DIGITAL_ASSET_PURCHASE',
          reviewStatus: 'CONNECTED',
          boundAt: '2026-09-12T00:00:00Z',
        }])
      )),
    );
    renderPanel();

    expect(await screen.findByText('가상자산 이용자 보호 등에 관한 법률')).toBeInTheDocument();
    expect(screen.getByText('REF-REG-VA-UPA-2024')).toBeInTheDocument();
    expect(screen.getByText(/DIGITAL_ASSET/)).toBeInTheDocument();
    expect(screen.getByText('CONNECTED')).toBeInTheDocument();
  });

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
