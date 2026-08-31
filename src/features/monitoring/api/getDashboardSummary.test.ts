import { describe, expect, it } from 'vitest';
import { getDashboardSummary } from './getDashboardSummary';

describe('getDashboardSummary', () => {
  it('uses the HTTP contract served by MSW', async () => {
    await expect(getDashboardSummary()).resolves.toEqual({
      requestCount: 1284,
      reviewCount: 37,
      blockCount: 18,
    });
  });
});
