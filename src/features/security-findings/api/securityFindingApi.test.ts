import { describe, expect, it } from 'vitest';
import { getSecurityFindingDetail, getSecurityFindings } from './securityFindingApi';

describe('securityFindingApi', () => {
  it('loads a server-scoped finding page and privacy-safe detail', async () => {
    await expect(getSecurityFindings({ executionPack: 'AI', page: 0, size: 20 })).resolves.toMatchObject({
      totalElements: 1,
      items: [{
        findingId: 901,
        executionId: 'exec-security-finding-contract',
        executionPack: 'AI',
        findingType: 'PHONE_NUMBER',
      }],
    });
    const detail = await getSecurityFindingDetail(901);
    expect(detail).toMatchObject({
      findingId: 901,
      tracePath: '/v1/runtime/executions/exec-security-finding-contract/trace',
      evidenceDigest: 'a'.repeat(64),
    });
    expect(detail).not.toHaveProperty('rawValue');
  });
});
