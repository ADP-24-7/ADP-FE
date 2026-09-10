import { describe, expect, it } from 'vitest';
import {
  activateDigitalAssetArtifact,
  getDigitalAssetArtifact,
  getDigitalAssetArtifactCurrentState,
  getDigitalAssetArtifactCurrentStates,
  ingestDigitalAssetArtifact,
} from './digitalAssetArtifactApi';

describe('digitalAssetArtifactApi', () => {
  it('discovers the current artifact without an artifact identity', async () => {
    await expect(getDigitalAssetArtifactCurrentStates({ currentOnly: true, page: 0, size: 10 }))
      .resolves.toMatchObject({
        totalElements: 1,
        items: [{
          artifactId: 'DA-DIGITAL-ASSET-RUNTIME-LOCAL-ACTIVE-001',
          currentSelectionStatus: 'CURRENT',
          latestRuntimeStatus: 'COMPLETED',
        }],
      });
  });

  it('loads current selection and pinned runtime evidence', async () => {
    await expect(getDigitalAssetArtifactCurrentState(
      'DA-DIGITAL-ASSET-RUNTIME-LOCAL-ACTIVE-001',
      '1.0.0',
    )).resolves.toMatchObject({
      artifact: { currentSelectionStatus: 'CURRENT', runtimeExecutionCount: 1 },
      activeSelection: { activatedBy: 'artifact-checker' },
      latestRuntimeEvidence: {
        executionId: 'exec-da-current-001',
        approvedPolicySnapshotId: 'policy-da-current:1.0.0',
      },
    });
  });

  it('loads a P0-5 artifact candidate', async () => {
    await expect(getDigitalAssetArtifact('DA-DIGITAL-ASSET-RUNTIME-CANDIDATE-001', '1.0.0')).resolves.toMatchObject({
      lifecycleStage: 'CANDIDATE',
      fileCount: 5,
      canonicalContractVersion: '1.0.0',
    });
  });

  it('submits the server-owned artifact reference and expected digest', async () => {
    await expect(ingestDigitalAssetArtifact({
      manifestReference: 'docs/contracts/artifacts/p0-5-sample/manifest.json',
      expectedContentDigest: `sha256:${'a'.repeat(64)}`,
    })).resolves.toMatchObject({ artifactId: 'DA-DIGITAL-ASSET-RUNTIME-CANDIDATE-001' });
  });

  it('activates a validated candidate through the privileged endpoint', async () => {
    await expect(activateDigitalAssetArtifact('DA-DIGITAL-ASSET-RUNTIME-CANDIDATE-001', '1.0.0')).resolves.toMatchObject({
      artifactId: 'DA-DIGITAL-ASSET-RUNTIME-CANDIDATE-001',
      runtimeControlVersion: '1.0.0',
      activatedBy: 'artifact-checker',
    });
  });
});
