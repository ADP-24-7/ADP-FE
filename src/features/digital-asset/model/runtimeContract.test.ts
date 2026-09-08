import { describe, expect, it } from 'vitest';
import { createDigitalAssetRuntimeInput } from './runtimeContract';

const draft = {
  approvedTransactionReference: 'approved-tx-local-001',
  customerId: 'customer-100',
  accountId: 'acct-100-1',
  chainId: 'eip155:1',
  assetKind: 'FUNGIBLE_TOKEN' as const,
  assetSymbol: 'asset-krw-token-001',
  assetContractAddress: '0x0000000000000000000000000000000000000001',
  operation: 'TRANSFER' as const,
  tokenId: '',
  requestedAmount: '10000',
  requestedDestination: 'wallet-test-001',
  requestedBeneficiaryReference: 'beneficiary-local-001',
};

describe('createDigitalAssetRuntimeInput', () => {
  it('creates the exact P0-4 caller-controlled input shape', () => {
    expect(createDigitalAssetRuntimeInput(draft)).toEqual({
      approvedTransactionReference: 'approved-tx-local-001',
      customerId: 'customer-100',
      accountId: 'acct-100-1',
      outboundRequest: {
        requestedAsset: {
          chainId: 'eip155:1',
          assetKind: 'FUNGIBLE_TOKEN',
          assetSymbol: 'asset-krw-token-001',
          assetContractAddress: '0x0000000000000000000000000000000000000001',
          operation: 'TRANSFER',
        },
        requestedAmount: '10000',
        requestedDestination: 'wallet-test-001',
        requestedBeneficiaryReference: 'beneficiary-local-001',
        regulatoryOutboundData: {},
      },
    });
  });

  it('rejects decimal amounts and incomplete token descriptors', () => {
    expect(() => createDigitalAssetRuntimeInput({ ...draft, requestedAmount: '1.5' })).toThrow('Atomic Unit');
    expect(() => createDigitalAssetRuntimeInput({
      ...draft,
      assetKind: 'NON_FUNGIBLE_TOKEN',
      tokenId: '',
    })).toThrow('Token ID');
  });
});
