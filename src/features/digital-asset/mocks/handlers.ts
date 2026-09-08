import { http, HttpResponse } from 'msw';

const artifact = {
  institutionId: 'institution_local',
  artifactId: 'DA-DIGITAL-ASSET-RUNTIME-CANDIDATE-001',
  artifactVersion: '1.0.0',
  artifactDigest: '2a0fad69b2db5f8e18081fadbdb71e5c0af2c12ea436e25276f5b8fa693d468f',
  manifestSchemaVersion: 'adp-artifact-manifest/v1',
  manifestReference: 'docs/contracts/artifacts/p0-5-sample/manifest.json',
  canonicalContractVersion: '1.0.0',
  canonicalContractDigest: '886842702fad124a95e73f0f714ffacef56d5cbd5a4c0f222440279d106b3504',
  workloadId: 'tokenized_asset_purchase',
  purposeCode: 'DIGITAL_ASSET_PURCHASE',
  destinationProfileId: 'dest_mock_asset_platform_v1',
  runtimeControlVersion: '1.0.0',
  runtimeControlDigest: `${'1'.repeat(64)}`,
  crosswalkVersion: '1.0.0',
  crosswalkDigest: `${'2'.repeat(64)}`,
  fileCount: 5,
  lifecycleStage: 'CANDIDATE',
  ingestedBy: 'artifact-maker',
  ingestedAt: '2026-09-08T00:00:00Z',
};

export const digitalAssetHandlers = [
  http.get('/api/admin/digital-assets/artifacts/:artifactId/versions/:artifactVersion', () => HttpResponse.json(artifact)),
  http.post('/api/admin/digital-assets/artifacts/ingestions', () => HttpResponse.json(artifact, { status: 201 })),
  http.post('/api/admin/digital-assets/artifacts/:artifactId/versions/:artifactVersion/activate', () => HttpResponse.json({
    institutionId: artifact.institutionId,
    workloadId: artifact.workloadId,
    purposeCode: artifact.purposeCode,
    artifactId: artifact.artifactId,
    artifactVersion: artifact.artifactVersion,
    artifactDigest: artifact.artifactDigest,
    destinationProfileId: artifact.destinationProfileId,
    runtimeControlVersion: artifact.runtimeControlVersion,
    runtimeControlDigest: artifact.runtimeControlDigest,
    crosswalkVersion: artifact.crosswalkVersion,
    crosswalkDigest: artifact.crosswalkDigest,
    activatedBy: 'artifact-checker',
    activatedAt: '2026-09-08T00:05:00Z',
  })),
];
