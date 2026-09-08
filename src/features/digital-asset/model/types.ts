export type DigitalAssetKind = 'NATIVE' | 'FUNGIBLE_TOKEN' | 'NON_FUNGIBLE_TOKEN';
export type DigitalAssetOperation = 'TRANSFER' | 'CONTRACT_CALL';

export type DigitalAssetDescriptor = {
  chainId: string;
  assetKind: DigitalAssetKind;
  assetSymbol: string;
  assetContractAddress?: string;
  operation: DigitalAssetOperation;
  tokenId?: string;
};

export type DigitalAssetRuntimeInput = {
  approvedTransactionReference: string;
  customerId: string;
  accountId: string;
  outboundRequest: {
    requestedAsset: DigitalAssetDescriptor;
    requestedAmount: string;
    requestedDestination: string;
    requestedBeneficiaryReference: string;
    regulatoryOutboundData: Record<string, never>;
  };
};

export type DigitalAssetRuntimeInputDraft = {
  approvedTransactionReference: string;
  customerId: string;
  accountId: string;
  chainId: string;
  assetKind: DigitalAssetKind;
  assetSymbol: string;
  assetContractAddress: string;
  operation: DigitalAssetOperation;
  tokenId: string;
  requestedAmount: string;
  requestedDestination: string;
  requestedBeneficiaryReference: string;
};

export type DigitalAssetArtifactIngestion = {
  institutionId: string;
  artifactId: string;
  artifactVersion: string;
  artifactDigest: string;
  manifestSchemaVersion: string;
  manifestReference: string;
  canonicalContractVersion: string;
  canonicalContractDigest: string;
  workloadId: string;
  purposeCode: string;
  destinationProfileId: string;
  runtimeControlVersion: string;
  runtimeControlDigest: string;
  crosswalkVersion: string;
  crosswalkDigest: string;
  fileCount: number;
  lifecycleStage: string;
  ingestedBy: string;
  ingestedAt: string;
};

export type IngestDigitalAssetArtifactRequest = {
  manifestReference: string;
  expectedContentDigest: string;
};

export type DigitalAssetActiveArtifact = {
  institutionId: string;
  workloadId: string;
  purposeCode: string;
  artifactId: string;
  artifactVersion: string;
  artifactDigest: string;
  destinationProfileId: string;
  runtimeControlVersion: string;
  runtimeControlDigest: string;
  crosswalkVersion: string;
  crosswalkDigest: string;
  activatedBy: string;
  activatedAt: string;
};
