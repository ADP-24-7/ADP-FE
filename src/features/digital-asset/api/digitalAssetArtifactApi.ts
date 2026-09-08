import { httpClient } from '../../../shared/api/httpClient';
import type { DigitalAssetActiveArtifact, DigitalAssetArtifactIngestion, IngestDigitalAssetArtifactRequest } from '../model/types';

export async function getDigitalAssetArtifact(artifactId: string, artifactVersion: string) {
  const response = await httpClient.get<DigitalAssetArtifactIngestion>(
    `/api/admin/digital-assets/artifacts/${encodeURIComponent(artifactId)}/versions/${encodeURIComponent(artifactVersion)}`,
  );
  return response.data;
}

export async function ingestDigitalAssetArtifact(request: IngestDigitalAssetArtifactRequest) {
  const response = await httpClient.post<DigitalAssetArtifactIngestion>(
    '/api/admin/digital-assets/artifacts/ingestions',
    request,
  );
  return response.data;
}

export async function activateDigitalAssetArtifact(artifactId: string, artifactVersion: string) {
  const response = await httpClient.post<DigitalAssetActiveArtifact>(
    `/api/admin/digital-assets/artifacts/${encodeURIComponent(artifactId)}/versions/${encodeURIComponent(artifactVersion)}/activate`,
  );
  return response.data;
}
