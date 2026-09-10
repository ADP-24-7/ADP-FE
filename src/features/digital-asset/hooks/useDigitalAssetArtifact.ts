import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  activateDigitalAssetArtifact,
  getDigitalAssetArtifact,
  getDigitalAssetArtifactCurrentState,
  getDigitalAssetArtifactCurrentStates,
  ingestDigitalAssetArtifact,
} from '../api/digitalAssetArtifactApi';
import type { DigitalAssetArtifactCurrentStateSearch } from '../model/types';

export function useDigitalAssetArtifactCurrentStates(params: DigitalAssetArtifactCurrentStateSearch) {
  return useQuery({
    queryKey: ['digital-asset-artifact-current-states', params],
    queryFn: () => getDigitalAssetArtifactCurrentStates(params),
    placeholderData: (previous) => previous,
    retry: false,
  });
}

export function useDigitalAssetArtifactCurrentState(artifactId: string, artifactVersion: string) {
  return useQuery({
    queryKey: ['digital-asset-artifact-current-state', artifactId, artifactVersion],
    queryFn: () => getDigitalAssetArtifactCurrentState(artifactId, artifactVersion),
    enabled: artifactId.length > 0 && artifactVersion.length > 0,
    retry: false,
  });
}

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
    onSuccess: (artifact) => {
      queryClient.setQueryData(
        ['digital-asset-artifact', artifact.artifactId, artifact.artifactVersion],
        artifact,
      );
      queryClient.invalidateQueries({ queryKey: ['digital-asset-artifact-current-states'] });
    },
  });
}

export function useActivateDigitalAssetArtifact() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ artifactId, artifactVersion }: { artifactId: string; artifactVersion: string }) =>
      activateDigitalAssetArtifact(artifactId, artifactVersion),
    onSuccess: (_active, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['policy-lifecycle', variables.artifactId, variables.artifactVersion],
      });
      queryClient.invalidateQueries({ queryKey: ['digital-asset-artifact-current-states'] });
      queryClient.invalidateQueries({
        queryKey: ['digital-asset-artifact-current-state', variables.artifactId, variables.artifactVersion],
      });
    },
  });
}
