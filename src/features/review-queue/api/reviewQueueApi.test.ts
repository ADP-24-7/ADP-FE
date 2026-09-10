import { describe, expect, it } from 'vitest';
import { getReviewQueue, getReviewQueueDetail } from './reviewQueueApi';

describe('reviewQueueApi', () => {
  it('loads a server-scoped pack page and review detail', async () => {
    await expect(getReviewQueue({ executionPack: 'AI', page: 0, size: 20 })).resolves.toMatchObject({
      totalElements: 1,
      items: [{
        executionId: 'exec-review-contract',
        executionPack: 'AI',
        runtimeStatus: 'REVIEW_REQUIRED',
        nextAction: 'INSPECT_TRACE',
      }],
    });
    await expect(getReviewQueueDetail('exec-review-contract')).resolves.toMatchObject({
      executionId: 'exec-review-contract',
      tracePath: '/v1/runtime/executions/exec-review-contract/trace',
      mismatchedFields: [],
    });
  });
});
