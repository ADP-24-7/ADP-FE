import { describe, expect, it } from 'vitest';
import { getDigitalAssetOperationsOverview } from './digitalAssetOperationsApi';

describe('digitalAssetOperationsApi', () => {
  it('loads server-scoped operational aggregates without unavailable raw dimensions', async () => {
    await expect(getDigitalAssetOperationsOverview(
      '2026-09-07T00:00:00Z',
      '2026-09-14T00:00:00Z',
      '',
      '',
      0,
    )).resolves.toMatchObject({
      schemaVersion: 'adp-digital-asset-operations-overview/v1',
      metrics: { total: { current: 179 }, reconciled: { current: 6 } },
      trend: [{ passed: 1 }],
      recentExecutions: { page: 0, size: 10, totalElements: 1, totalPages: 1 },
      coverage: {
        transactionEvidence: 49,
        unavailableDimensions: ['ASSET_SYMBOL', 'EXACT_AMOUNT', 'DESTINATION_CATEGORY'],
      },
    });
  });
});
