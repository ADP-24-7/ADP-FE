import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { ExecutionEvidencePack } from '../../audit-trace';
import { digitalAssetRuntimeTraceFixture } from '../../runtime-execution/mocks/fixtures';
import { DigitalAssetRuntimeEvidencePanel } from './DigitalAssetRuntimeEvidencePanel';

const evidence: ExecutionEvidencePack = {
  schemaVersion: 'adp-execution-evidence/v1',
  exportContentDigest: 'export-digest',
  executionId: digitalAssetRuntimeTraceFixture.executionId,
  requestId: 'request-da-contract',
  traceId: digitalAssetRuntimeTraceFixture.traceId,
  institutionId: 'institution_local',
  workloadId: 'tokenized_asset_purchase',
  purposeCode: 'DIGITAL_ASSET_PURCHASE',
  runtimeStatus: 'COMPLETED',
  authorizationStatus: 'PASSED',
  idempotency: {
    existingExecutionReused: true,
    replayCount: 1,
    additionalExternalEffectCount: 0,
  },
  policy: { policyVersion: 'policy/1.0.0', snapshotDigest: 'snapshot-digest', finalAction: 'ALLOW' },
  data: {},
  egress: {
    destinationProfileId: 'dest_mock_asset_platform_v1',
    outboundGuardStatus: 'PASSED',
    connectorExecutionId: 'connector-da-contract',
    connectorStatus: 'COMPLETED',
  },
  recovery: { recoveryStatus: null },
  audit: { auditId: 'audit-da-contract', reasonCode: null, evidenceRefs: [] },
  createdAt: '2026-09-12T00:00:00Z',
  updatedAt: '2026-09-12T00:00:01Z',
};

describe('DigitalAssetRuntimeEvidencePanel', () => {
  it('renders BE-owned trace, exact evidence, and privacy-safe unavailable states', () => {
    render(<DigitalAssetRuntimeEvidencePanel evidence={evidence} trace={digitalAssetRuntimeTraceFixture} />);

    expect(screen.getByRole('heading', { name: 'Digital Asset Runtime Evidence' })).toBeInTheDocument();
    expect(screen.getByText('request-da-contract')).toBeInTheDocument();
    expect(screen.getByText(/TOKEN_TRANSFER/)).toBeInTheDocument();
    expect(screen.getByText('dest_mock_asset_platform_v1')).toBeInTheDocument();
    expect(screen.getByText('EXECUTED · connector-da-contract')).toBeInTheDocument();
    expect(screen.getByText('VERIFIED · SUCCESS · FINALIZED')).toBeInTheDocument();
    expect(screen.getByText('NOT EXPOSED BY PRIVACY-SAFE READ API')).toBeInTheDocument();
    expect(screen.getByText('Existing Execution Reused')).toBeInTheDocument();
    expect(screen.getByText('Additional External Effect')).toBeInTheDocument();
    expect(screen.getByText('YES')).toBeInTheDocument();
    expect(screen.getByText('0')).toBeInTheDocument();
    expect(screen.queryByText('0x1234567890abcdef')).not.toBeInTheDocument();
  });
});
