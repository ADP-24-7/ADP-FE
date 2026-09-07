import { describe, expect, it } from 'vitest';
import { previewRuntimeContext } from './contextPreviewApi';

describe('contextPreviewApi', () => {
  it('returns privacy-safe context and detection metadata', async () => {
    await expect(previewRuntimeContext({
      workloadId: 'customer_summary',
      purpose: 'CUSTOMER_SUPPORT',
      subject: 'customer:customer-100',
    })).resolves.toMatchObject({
      contextId: 'context-contract',
      contextDigest: 'context-digest',
      fields: [],
    });
  });
});
