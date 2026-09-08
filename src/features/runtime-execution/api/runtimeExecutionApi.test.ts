import { describe, expect, it } from 'vitest';
import { createRuntimeExecution, getRuntimeExecution, getRuntimeExecutionTrace } from './runtimeExecutionApi';
import {
  digitalAssetRuntimeTraceFixture,
  runtimeExecutionDetailFixture,
  runtimeExecutionFixture,
  runtimeExecutionRequestFixture,
  runtimeExecutionTraceFixture,
} from '../mocks/fixtures';

describe('runtimeExecutionApi', () => {
  it('creates a runtime execution with the v1 request contract', async () => {
    await expect(createRuntimeExecution(runtimeExecutionRequestFixture)).resolves.toEqual(runtimeExecutionFixture);
  });

  it('gets a runtime execution by execution id', async () => {
    await expect(getRuntimeExecution(runtimeExecutionFixture.executionId)).resolves.toEqual(runtimeExecutionDetailFixture);
  });

  it('gets a runtime execution trace by execution id', async () => {
    await expect(getRuntimeExecutionTrace(runtimeExecutionFixture.executionId)).resolves.toEqual(runtimeExecutionTraceFixture);
  });

  it('keeps the P0-6 through P0-8 evidence returned by a Digital Asset trace', async () => {
    await expect(getRuntimeExecutionTrace(digitalAssetRuntimeTraceFixture.executionId)).resolves.toMatchObject({
      digitalAssetRuntimeSnapshot: {
        snapshotId: 'dasnap_contract',
        artifactId: 'DA-DIGITAL-ASSET-RUNTIME-CANDIDATE-001',
        runtimeControlVersion: '1.0.0',
        crosswalkVersion: '1.0.0',
      },
      digitalAssetPreExecutionGuard: {
        status: 'PASSED',
        controlResults: {
          APPROVED_VS_REQUESTED_MATCH: 'PASSED',
          TRACE_BINDING: 'PASSED',
        },
      },
      digitalAssetPostExecutionEvidence: {
        status: 'VERIFIED',
        evidenceSourceType: 'INDEPENDENT_EXTERNAL',
        amountSource: 'TOKEN_TRANSFER',
        mismatchedFields: [],
      },
    });
  });
});
