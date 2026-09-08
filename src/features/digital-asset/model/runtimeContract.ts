import type { DigitalAssetRuntimeInput, DigitalAssetRuntimeInputDraft } from './types';

const SHA_256_DIGEST = /^sha256:[0-9a-f]{64}$/;
const ATOMIC_UNITS = /^[0-9]{1,78}$/;

function required(value: string, label: string, maxLength = 240) {
  const normalized = value.trim();
  if (normalized.length === 0 || normalized.length > maxLength) {
    throw new Error(`${label} 값이 유효하지 않습니다.`);
  }
  return normalized;
}

export function isSha256Digest(value: string) {
  return SHA_256_DIGEST.test(value);
}

export function createDigitalAssetRuntimeInput(draft: DigitalAssetRuntimeInputDraft): DigitalAssetRuntimeInput {
  const requestedAmount = draft.requestedAmount.trim();
  if (!ATOMIC_UNITS.test(requestedAmount) || BigInt(requestedAmount) <= 0n) {
    throw new Error('Requested Amount는 1~78자리의 양수 Atomic Unit 문자열이어야 합니다.');
  }

  const requestedAsset = {
    chainId: required(draft.chainId, 'Chain ID', 80),
    assetKind: draft.assetKind,
    assetSymbol: required(draft.assetSymbol, 'Asset Symbol', 64),
    operation: draft.operation,
    ...(draft.assetKind !== 'NATIVE' && draft.assetContractAddress.trim()
      ? { assetContractAddress: required(draft.assetContractAddress, 'Asset Contract Address') }
      : {}),
    ...(draft.assetKind === 'NON_FUNGIBLE_TOKEN' && draft.tokenId.trim()
      ? { tokenId: required(draft.tokenId, 'Token ID', 160) }
      : {}),
  };

  if (draft.assetKind === 'NATIVE' && (requestedAsset.assetContractAddress || requestedAsset.tokenId)) {
    throw new Error('NATIVE 자산에는 Contract Address와 Token ID를 입력할 수 없습니다.');
  }
  if (draft.assetKind === 'FUNGIBLE_TOKEN' && (!requestedAsset.assetContractAddress || requestedAsset.tokenId)) {
    throw new Error('FUNGIBLE_TOKEN은 Contract Address가 필요하고 Token ID는 허용하지 않습니다.');
  }
  if (draft.assetKind === 'NON_FUNGIBLE_TOKEN' && (!requestedAsset.assetContractAddress || !requestedAsset.tokenId)) {
    throw new Error('NON_FUNGIBLE_TOKEN은 Contract Address와 Token ID가 모두 필요합니다.');
  }

  return {
    approvedTransactionReference: required(draft.approvedTransactionReference, 'Approved Transaction Reference', 160),
    customerId: required(draft.customerId, 'Customer ID'),
    accountId: required(draft.accountId, 'Account ID'),
    outboundRequest: {
      requestedAsset,
      requestedAmount,
      requestedDestination: required(draft.requestedDestination, 'Requested Destination'),
      requestedBeneficiaryReference: required(draft.requestedBeneficiaryReference, 'Beneficiary Reference'),
      regulatoryOutboundData: {},
    },
  };
}
