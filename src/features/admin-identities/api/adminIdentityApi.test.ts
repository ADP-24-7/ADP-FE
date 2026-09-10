import { describe, expect, it } from 'vitest';
import { getAdminIdentities, getAdminIdentityDetail } from './adminIdentityApi';

describe('adminIdentityApi', () => {
  it('loads the institution-scoped identity registry', async () => {
    const page = await getAdminIdentities({ role: 'RUNTIME_EXECUTOR', workloadId: 'customer_summary' });

    expect(page.items).toHaveLength(1);
    expect(page.items[0]).toMatchObject({
      principalId: 'svc_local_runtime',
      enabledApiKeyCount: 1,
    });
  });

  it('loads bounded permission detail without credential material', async () => {
    const detail = await getAdminIdentityDetail('svc_local_runtime');

    expect(detail.permissions[0]).toMatchObject({
      workloadId: 'customer_summary',
      purpose: 'CUSTOMER_SUPPORT',
      subjectGrantCount: 2,
      workloadRegistryStatus: 'ENABLED',
    });
    expect(detail).not.toHaveProperty('keyHash');
    expect(detail.permissions[0]).not.toHaveProperty('subjectId');
  });
});
