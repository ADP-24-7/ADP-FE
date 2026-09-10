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

export type DigitalAssetCurrentSelectionStatus = 'CURRENT' | 'NOT_CURRENT' | 'INCONSISTENT';

export type DigitalAssetArtifactCurrentStateItem = {
  artifactId: string;
  artifactVersion: string;
  artifactDigest: string;
  workloadId: string;
  purposeCode: string;
  destinationProfileId: string;
  lifecycleStage: string;
  revision: number;
  currentSelectionStatus: DigitalAssetCurrentSelectionStatus;
  runtimeExecutionCount: number;
  latestExecutionId: string | null;
  latestRuntimeStatus: string | null;
  activatedAt: string | null;
  ingestedAt: string;
  updatedAt: string;
};

export type DigitalAssetArtifactCurrentStatePage = {
  items: DigitalAssetArtifactCurrentStateItem[];
  page: number;
  size: number;
  totalElements: number;
};

export type DigitalAssetArtifactRuntimeEvidence = {
  executionId: string;
  requestId: string;
  traceId: string;
  runtimeStatus: string;
  finalAction: string | null;
  snapshotId: string;
  snapshotDigest: string;
  approvedPolicySnapshotId: string;
  approvedPolicyVersion: string;
  approvedPolicyDigest: string;
  destinationProfileId: string;
  destinationProfileVersion: string;
  destinationProfileDigest: string;
  postExecutionStatus: string | null;
  externalStatus: string | null;
  providerStatus: string | null;
  receiptStatus: string | null;
  finalityStatus: string | null;
  selectedAt: string;
  observedAt: string | null;
  tracePath: string;
  evidencePath: string;
};

export type DigitalAssetArtifactCurrentStateDetail = {
  artifact: DigitalAssetArtifactCurrentStateItem;
  manifestSchemaVersion: string;
  manifestReference: string;
  canonicalContractVersion: string;
  canonicalContractDigest: string;
  runtimeControlVersion: string;
  runtimeControlDigest: string;
  crosswalkVersion: string;
  crosswalkDigest: string;
  fileCount: number;
  createdBy: string;
  ingestedBy: string;
  createdAt: string;
  activeSelection: DigitalAssetActiveArtifact | null;
  latestRuntimeEvidence: DigitalAssetArtifactRuntimeEvidence | null;
  policyHistoryPath: string;
};

export type DigitalAssetArtifactCurrentStateSearch = {
  lifecycleStage?: string;
  workloadId?: string;
  query?: string;
  currentOnly?: boolean;
  page?: number;
  size?: number;
};
