import { describe, expect, it } from 'vitest';
import { activateDigitalAssetArtifact, getDigitalAssetArtifact, ingestDigitalAssetArtifact } from './digitalAssetArtifactApi';

describe('digitalAssetArtifactApi', () => {
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
