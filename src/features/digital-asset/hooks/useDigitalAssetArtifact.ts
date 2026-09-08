import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { activateDigitalAssetArtifact, getDigitalAssetArtifact, ingestDigitalAssetArtifact } from '../api/digitalAssetArtifactApi';

export function useDigitalAssetArtifact(artifactId: string, artifactVersion: string) {
  return useQuery({
    queryKey: ['digital-asset-artifact', artifactId, artifactVersion],
    queryFn: () => getDigitalAssetArtifact(artifactId, artifactVersion),
    enabled: artifactId.length > 0 && artifactVersion.length > 0,
    retry: false,
  });
}

export function useIngestDigitalAssetArtifact() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ingestDigitalAssetArtifact,
    onSuccess: (artifact) => queryClient.setQueryData(
      ['digital-asset-artifact', artifact.artifactId, artifact.artifactVersion],
      artifact,
    ),
  });
}

export function useActivateDigitalAssetArtifact() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ artifactId, artifactVersion }: { artifactId: string; artifactVersion: string }) =>
      activateDigitalAssetArtifact(artifactId, artifactVersion),
    onSuccess: (_active, variables) => queryClient.invalidateQueries({
      queryKey: ['policy-lifecycle', variables.artifactId, variables.artifactVersion],
    }),
  });
}
